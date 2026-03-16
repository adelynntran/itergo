import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { notFound, forbidden } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/comments/:id — update a comment
const updateCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, id),
  });
  if (!comment) return notFound("Comment not found");
  if (comment.userId !== auth.userId) return forbidden("Can only edit your own comments");

  const parsed = parseBody(updateCommentSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [updated] = await db
    .update(comments)
    .set({ body: parsed.data.body, updatedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/comments/:id — delete a comment
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, id),
  });
  if (!comment) return notFound("Comment not found");
  if (comment.userId !== auth.userId) return forbidden("Can only delete your own comments");

  await db.delete(comments).where(eq(comments.id, id));

  return new NextResponse(null, { status: 204 });
}
