import { z } from "zod";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../init";
import {
  pins,
  pinVotes,
  boardMembers,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

async function requireBoardRole(
  db: any,
  boardId: string,
  userId: string,
  allowedRoles: string[]
) {
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, boardId),
      eq(boardMembers.userId, userId)
    ),
  });
  if (!member || !allowedRoles.includes(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires one of: ${allowedRoles.join(", ")}`,
    });
  }
  return member.role;
}

export const pinsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        category: z.string().optional(),
        sortBy: z
          .enum(["recent", "most_voted", "name"])
          .default("recent"),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireBoardRole(ctx.db, input.boardId, ctx.userId, [
        "host",
        "editor",
        "viewer",
      ]);

      const allPins = await ctx.db.query.pins.findMany({
        where: input.category
          ? and(
              eq(pins.boardId, input.boardId),
              eq(pins.category, input.category)
            )
          : eq(pins.boardId, input.boardId),
        with: {
          addedByUser: true,
          votes: true,
          comments: true,
          media: true,
        },
        orderBy:
          input.sortBy === "name"
            ? [asc(pins.name)]
            : [desc(pins.createdAt)],
      });

      const pinsWithCounts = allPins.map((pin) => ({
        ...pin,
        voteCounts: {
          upvote: pin.votes.filter((v) => v.voteType === "upvote").length,
          heart: pin.votes.filter((v) => v.voteType === "heart").length,
          must_do: pin.votes.filter((v) => v.voteType === "must_do").length,
        },
        totalVotes: pin.votes.length,
        commentCount: pin.comments.length,
        userVotes: pin.votes
          .filter((v) => v.userId === ctx.userId)
          .map((v) => v.voteType),
      }));

      if (input.sortBy === "most_voted") {
        pinsWithCounts.sort((a, b) => b.totalVotes - a.totalVotes);
      }

      return pinsWithCounts;
    }),

  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        name: z.string().min(1).max(200),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
        placeId: z.string().optional(),
        sourceType: z
          .enum(["search", "url", "photo", "map_drop", "manual"])
          .default("search"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireBoardRole(ctx.db, input.boardId, ctx.userId, [
        "host",
        "editor",
      ]);

      const [pin] = await ctx.db
        .insert(pins)
        .values({
          boardId: input.boardId,
          addedBy: ctx.userId,
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          city: input.city,
          country: input.country,
          category: input.category,
          notes: input.notes,
          placeId: input.placeId,
          sourceType: input.sourceType,
        })
        .returning();

      return pin;
    }),

  update: protectedProcedure
    .input(
      z.object({
        pinId: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        notes: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pin = await ctx.db.query.pins.findFirst({
        where: eq(pins.id, input.pinId),
      });
      if (!pin) throw new TRPCError({ code: "NOT_FOUND" });

      await requireBoardRole(ctx.db, pin.boardId, ctx.userId, [
        "host",
        "editor",
      ]);

      const [updated] = await ctx.db
        .update(pins)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.category && { category: input.category }),
          updatedAt: new Date(),
        })
        .where(eq(pins.id, input.pinId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ pinId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const pin = await ctx.db.query.pins.findFirst({
        where: eq(pins.id, input.pinId),
      });
      if (!pin) throw new TRPCError({ code: "NOT_FOUND" });

      await requireBoardRole(ctx.db, pin.boardId, ctx.userId, [
        "host",
        "editor",
      ]);

      await ctx.db.delete(pins).where(eq(pins.id, input.pinId));
    }),

  vote: protectedProcedure
    .input(
      z.object({
        pinId: z.string().uuid(),
        voteType: z.enum(["upvote", "heart", "must_do"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pin = await ctx.db.query.pins.findFirst({
        where: eq(pins.id, input.pinId),
      });
      if (!pin) throw new TRPCError({ code: "NOT_FOUND" });

      await requireBoardRole(ctx.db, pin.boardId, ctx.userId, [
        "host",
        "editor",
        "viewer",
      ]);

      // Toggle: delete if exists, create if not
      const existing = await ctx.db.query.pinVotes.findFirst({
        where: and(
          eq(pinVotes.pinId, input.pinId),
          eq(pinVotes.userId, ctx.userId),
          eq(pinVotes.voteType, input.voteType)
        ),
      });

      if (existing) {
        await ctx.db.delete(pinVotes).where(eq(pinVotes.id, existing.id));
        return { action: "removed" as const };
      } else {
        await ctx.db.insert(pinVotes).values({
          pinId: input.pinId,
          userId: ctx.userId,
          voteType: input.voteType,
        });
        return { action: "added" as const };
      }
    }),
});
