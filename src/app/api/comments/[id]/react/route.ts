import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { commentReactions } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";

type Params = { params: Promise<{ id: string }> };

// POST /api/comments/:id/react — toggle emoji reaction on a comment
const reactSchema = z.object({
  emoji: z.string().min(1).max(10),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id: commentId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(reactSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const existing = await db.query.commentReactions.findFirst({
    where: and(
      eq(commentReactions.commentId, commentId),
      eq(commentReactions.userId, auth.userId),
      eq(commentReactions.emoji, parsed.data.emoji)
    ),
  });

  if (existing) {
    await db
      .delete(commentReactions)
      .where(eq(commentReactions.id, existing.id));
    return NextResponse.json({ action: "removed" });
  } else {
    await db.insert(commentReactions).values({
      commentId,
      userId: auth.userId,
      emoji: parsed.data.emoji,
    });
    return NextResponse.json({ action: "added" });
  }
}
