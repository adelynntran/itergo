import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { badRequest } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string; userId: string }> };

// PATCH /api/boards/:id/members/:userId — update member role
const updateRoleSchema = z.object({
  role: z.enum(["editor", "viewer"]),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, userId: targetUserId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  const parsed = parseBody(updateRoleSchema, await req.json());
  if (!parsed.success) return parsed.error;

  await db
    .update(boardMembers)
    .set({ role: parsed.data.role })
    .where(
      and(
        eq(boardMembers.boardId, id),
        eq(boardMembers.userId, targetUserId)
      )
    );

  return new NextResponse(null, { status: 204 });
}

// DELETE /api/boards/:id/members/:userId — remove member from board
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, userId: targetUserId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  if (targetUserId === auth.userId) {
    return badRequest("Cannot remove yourself");
  }

  await db
    .delete(boardMembers)
    .where(
      and(
        eq(boardMembers.boardId, id),
        eq(boardMembers.userId, targetUserId)
      )
    );

  return new NextResponse(null, { status: 204 });
}
