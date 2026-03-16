import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards, boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { generateCode, generatePin } from "@/lib/api/utils";

// GET /api/boards — list all boards the user is a member of
export async function GET() {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const memberRows = await db.query.boardMembers.findMany({
    where: eq(boardMembers.userId, auth.userId),
    with: {
      board: {
        with: {
          members: { with: { user: true } },
          pins: true,
        },
      },
    },
  });

  const boards = memberRows
    .filter((m) => m.board.status === "active")
    .map((m) => ({
      ...m.board,
      role: m.role,
      memberCount: m.board.members.length,
      pinCount: m.board.pins.length,
    }));

  return NextResponse.json(boards);
}

// POST /api/boards — create a new board
const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(["private", "group"]).default("group"),
});

export async function POST(req: Request) {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(createSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [board] = await db
    .insert(dreamBoards)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      createdBy: auth.userId,
      inviteCode: generateCode(6),
      invitePin: generatePin(),
    })
    .returning();

  await db.insert(boardMembers).values({
    boardId: board.id,
    userId: auth.userId,
    role: "host",
  });

  return NextResponse.json(board, { status: 201 });
}
