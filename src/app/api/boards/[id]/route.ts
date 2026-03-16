import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

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

  return NextResponse.json(board);
}

// PATCH /api/boards/:id — update board name/description
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  const parsed = parseBody(updateSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [updated] = await db
    .update(dreamBoards)
    .set({
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
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
