import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards, boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

// POST /api/boards/join/pin — join a board by PIN
const joinPinSchema = z.object({
  boardId: z.string().uuid(),
  pin: z.string().length(6),
});

export async function POST(req: Request) {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(joinPinSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const board = await db.query.dreamBoards.findFirst({
    where: and(
      eq(dreamBoards.id, parsed.data.boardId),
      eq(dreamBoards.invitePin, parsed.data.pin)
    ),
  });

  if (!board || board.status !== "active") {
    return notFound("Invalid PIN");
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
