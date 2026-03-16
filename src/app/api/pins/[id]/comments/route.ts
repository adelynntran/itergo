import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { comments, pins, boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { notFound, forbidden } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/pins/:id/comments — list comments for a pin
export async function GET(req: NextRequest, { params }: Params) {
  const { id: pinId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const allComments = await db.query.comments.findMany({
    where: eq(comments.pinId, pinId),
    with: {
      user: true,
      reactions: true,
      replies: {
        with: { user: true, reactions: true },
        orderBy: [desc(comments.createdAt)],
      },
    },
    orderBy: [desc(comments.createdAt)],
  });

  return NextResponse.json(allComments);
}

// POST /api/pins/:id/comments — create a comment
const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id: pinId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const pin = await db.query.pins.findFirst({
    where: eq(pins.id, pinId),
  });
  if (!pin) return notFound("Pin not found");

  // All board members can comment
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, pin.boardId),
      eq(boardMembers.userId, auth.userId)
    ),
  });
  if (!member) return forbidden("Must be a board member to comment");

  const parsed = parseBody(createCommentSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [comment] = await db
    .insert(comments)
    .values({
      pinId,
      userId: auth.userId,
      body: parsed.data.body,
      parentId: parsed.data.parentId,
    })
    .returning();

  return NextResponse.json(comment, { status: 201 });
}
