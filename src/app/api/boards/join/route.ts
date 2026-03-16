import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards, boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

// POST /api/boards/join — join a board by invite code
const joinSchema = z.object({
  code: z.string(),
});

export async function POST(req: Request) {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(joinSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const board = await db.query.dreamBoards.findFirst({
    where: eq(dreamBoards.inviteCode, parsed.data.code.toUpperCase()),
  });

  if (!board || board.status !== "active") {
    return notFound("Invalid invite code");
  }

  const existing = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, board.id),
      eq(boardMembers.userId, auth.userId)
    ),
  });

  if (existing) return NextResponse.json(board);

  await db.insert(boardMembers).values({
    boardId: board.id,
    userId: auth.userId,
    role: "editor",
  });

  return NextResponse.json(board);
}
