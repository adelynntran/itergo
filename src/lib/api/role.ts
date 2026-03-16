import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { boardMembers } from "@/server/db/schema";
import { forbidden } from "./errors";

export async function getMemberRole(boardId: string, userId: string) {
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, boardId),
      eq(boardMembers.userId, userId)
    ),
  });
  return member?.role ?? null;
}

export async function requireRole(
  boardId: string,
  userId: string,
  allowedRoles: string[]
) {
  const role = await getMemberRole(boardId, userId);
  if (!role || !allowedRoles.includes(role)) {
    return { error: forbidden(`Requires one of: ${allowedRoles.join(", ")}`) };
  }
  return { role };
}
