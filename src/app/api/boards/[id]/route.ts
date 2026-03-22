import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { badRequest, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/boards/:id — get board details with pins and members
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host", "editor", "viewer"]);
  if ("error" in roleCheck) return roleCheck.error;

  const board = await db.query.dreamBoards.findFirst({
    where: eq(dreamBoards.id, id),
    with: {
      creator: true,
      members: { with: { user: true } },
      pins: {
        with: {
          addedByUser: true,
          votes: true,
          comments: true,
          media: true,
        },
        orderBy: (pins, { desc }) => [desc(pins.createdAt)],
      },
    },
  });

  if (!board || board.status === "deleted") {
    return notFound("Board not found");
  }

  return NextResponse.json({
    ...board,
    currentUserRole: roleCheck.role,
  });
}

// PATCH /api/boards/:id — update board metadata and mode
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  boardMode: z.enum(["dream", "execution", "travel", "momento"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(updateSchema, await req.json());
  if (!parsed.success) return parsed.error;

  if (
    parsed.data.name === undefined &&
    parsed.data.description === undefined &&
    parsed.data.boardMode === undefined
  ) {
    return badRequest("Provide at least one field to update");
  }

  const isModeOnlyUpdate =
    parsed.data.boardMode !== undefined &&
    parsed.data.name === undefined &&
    parsed.data.description === undefined;

  // Validate mode transitions: dream→execution→travel→momento
  if (parsed.data.boardMode) {
    const current = await db.query.dreamBoards.findFirst({
      where: eq(dreamBoards.id, id),
      columns: { boardMode: true },
    });
    const validTransitions: Record<string, string[]> = {
      dream: ["execution"],
      execution: ["travel"],
      travel: ["momento"],
    };
    const allowed = validTransitions[current?.boardMode ?? "dream"] ?? [];
    if (!allowed.includes(parsed.data.boardMode)) {
      return badRequest(
        `Cannot transition from "${current?.boardMode ?? "dream"}" to "${parsed.data.boardMode}"`
      );
    }
  }

  const roleCheck = await requireRole(
    id,
    auth.userId,
    isModeOnlyUpdate ? ["host", "editor"] : ["host"]
  );
  if ("error" in roleCheck) return roleCheck.error;

  const modeUpdate: Record<string, unknown> = {};

  if (parsed.data.boardMode !== undefined) {
    modeUpdate.boardMode = parsed.data.boardMode;
    const now = new Date();
    if (parsed.data.boardMode === "execution") {
      modeUpdate.executionStartedAt = now;
    } else if (parsed.data.boardMode === "travel") {
      modeUpdate.travelStartedAt = now;
    } else if (parsed.data.boardMode === "momento") {
      modeUpdate.momentoStartedAt = now;
    }
  }

  const [updated] = await db
    .update(dreamBoards)
    .set({
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...modeUpdate,
      updatedAt: new Date(),
    })
    .where(eq(dreamBoards.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/boards/:id — soft delete board
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  await db
    .update(dreamBoards)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(eq(dreamBoards.id, id));

  return new NextResponse(null, { status: 204 });
}
