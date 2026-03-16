import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../init";
import {
  comments,
  commentReactions,
  pins,
  boardMembers,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const commentsRouter = router({
  list: protectedProcedure
    .input(z.object({ pinId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.comments.findMany({
        where: eq(comments.pinId, input.pinId),
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
    }),

  create: protectedProcedure
    .input(
      z.object({
        pinId: z.string().uuid(),
        body: z.string().min(1).max(2000),
        parentId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pin = await ctx.db.query.pins.findFirst({
        where: eq(pins.id, input.pinId),
      });
      if (!pin) throw new TRPCError({ code: "NOT_FOUND" });

      // All members can comment
      const member = await ctx.db.query.boardMembers.findFirst({
        where: and(
          eq(boardMembers.boardId, pin.boardId),
          eq(boardMembers.userId, ctx.userId)
        ),
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const [comment] = await ctx.db
        .insert(comments)
        .values({
          pinId: input.pinId,
          userId: ctx.userId,
          body: input.body,
          parentId: input.parentId,
        })
        .returning();

      return comment;
    }),

  update: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        body: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await ctx.db
        .update(comments)
        .set({ body: input.body, updatedAt: new Date() })
        .where(eq(comments.id, input.commentId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));
    }),

  react: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        emoji: z.string().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.commentReactions.findFirst({
        where: and(
          eq(commentReactions.commentId, input.commentId),
          eq(commentReactions.userId, ctx.userId),
          eq(commentReactions.emoji, input.emoji)
        ),
      });

      if (existing) {
        await ctx.db
          .delete(commentReactions)
          .where(eq(commentReactions.id, existing.id));
        return { action: "removed" as const };
      } else {
        await ctx.db.insert(commentReactions).values({
          commentId: input.commentId,
          userId: ctx.userId,
          emoji: input.emoji,
        });
        return { action: "added" as const };
      }
    }),
});
