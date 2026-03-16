import { z } from "zod";
import { eq, and, or, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../init";
import { dreamBoards, boardMembers, pins, users, pinVotes } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getMemberRole(
  db: any,
  boardId: string,
  userId: string
): Promise<string | null> {
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, boardId),
      eq(boardMembers.userId, userId)
    ),
  });
  return member?.role ?? null;
}

async function requireRole(
  db: any,
  boardId: string,
  userId: string,
  allowedRoles: string[]
) {
  const role = await getMemberRole(db, boardId, userId);
  if (!role || !allowedRoles.includes(role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires one of: ${allowedRoles.join(", ")}`,
    });
  }
  return role;
}

export const boardsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberRows = await ctx.db.query.boardMembers.findMany({
      where: eq(boardMembers.userId, ctx.userId),
      with: {
        board: {
          with: {
            members: { with: { user: true } },
            pins: true,
          },
        },
      },
    });

    return memberRows
      .filter((m) => m.board.status === "active")
      .map((m) => ({
        ...m.board,
        role: m.role,
        memberCount: m.board.members.length,
        pinCount: m.board.pins.length,
      }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        visibility: z.enum(["private", "group"]).default("group"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [board] = await ctx.db
        .insert(dreamBoards)
        .values({
          name: input.name,
          description: input.description,
          visibility: input.visibility,
          createdBy: ctx.userId,
          inviteCode: generateCode(6),
          invitePin: generatePin(),
        })
        .returning();

      await ctx.db.insert(boardMembers).values({
        boardId: board.id,
        userId: ctx.userId,
        role: "host",
      });

      return board;
    }),

  get: protectedProcedure
    .input(z.object({ boardId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireRole(ctx.db, input.boardId, ctx.userId, [
        "host",
        "editor",
        "viewer",
      ]);

      const board = await ctx.db.query.dreamBoards.findFirst({
        where: eq(dreamBoards.id, input.boardId),
        with: {
          creator: true,
          members: { with: { user: true } },
          pins: {
            with: {
              addedByUser: true,
              votes: true,
              comments: true,
              media: true,
            },
            orderBy: (pins, { desc }) => [desc(pins.createdAt)],
          },
        },
      });

      if (!board || board.status === "deleted") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return board;
    }),

  update: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);

      const [updated] = await ctx.db
        .update(dreamBoards)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          updatedAt: new Date(),
        })
        .where(eq(dreamBoards.id, input.boardId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ boardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);
      await ctx.db
        .update(dreamBoards)
        .set({ status: "deleted", updatedAt: new Date() })
        .where(eq(dreamBoards.id, input.boardId));
    }),

  archive: protectedProcedure
    .input(z.object({ boardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);
      await ctx.db
        .update(dreamBoards)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(dreamBoards.id, input.boardId));
    }),

  generateInvite: protectedProcedure
    .input(z.object({ boardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);
      const code = generateCode(6);
      const pin = generatePin();

      await ctx.db
        .update(dreamBoards)
        .set({ inviteCode: code, invitePin: pin })
        .where(eq(dreamBoards.id, input.boardId));

      return { code, pin };
    }),

  joinByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.query.dreamBoards.findFirst({
        where: eq(dreamBoards.inviteCode, input.code.toUpperCase()),
      });

      if (!board || board.status !== "active") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid invite code",
        });
      }

      const existing = await ctx.db.query.boardMembers.findFirst({
        where: and(
          eq(boardMembers.boardId, board.id),
          eq(boardMembers.userId, ctx.userId)
        ),
      });

      if (existing) return board;

      await ctx.db.insert(boardMembers).values({
        boardId: board.id,
        userId: ctx.userId,
        role: "editor",
      });

      return board;
    }),

  joinByPin: protectedProcedure
    .input(
      z.object({
        boardId: z.string().uuid(),
        pin: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.query.dreamBoards.findFirst({
        where: and(
          eq(dreamBoards.id, input.boardId),
          eq(dreamBoards.invitePin, input.pin)
        ),
      });

      if (!board || board.status !== "active") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid PIN",
        });
      }

      const existing = await ctx.db.query.boardMembers.findFirst({
        where: and(
          eq(boardMembers.boardId, board.id),
          eq(boardMembers.userId, ctx.userId)
        ),
      });

      if (existing) return board;

      await ctx.db.insert(boardMembers).values({
        boardId: board.id,
        userId: ctx.userId,
        role: "editor",
      });

      return board;
    }),

  members: router({
    list: protectedProcedure
      .input(z.object({ boardId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        await requireRole(ctx.db, input.boardId, ctx.userId, [
          "host",
          "editor",
          "viewer",
        ]);
        return ctx.db.query.boardMembers.findMany({
          where: eq(boardMembers.boardId, input.boardId),
          with: { user: true },
        });
      }),

    updateRole: protectedProcedure
      .input(
        z.object({
          boardId: z.string().uuid(),
          userId: z.string().uuid(),
          role: z.enum(["editor", "viewer"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);
        await ctx.db
          .update(boardMembers)
          .set({ role: input.role })
          .where(
            and(
              eq(boardMembers.boardId, input.boardId),
              eq(boardMembers.userId, input.userId)
            )
          );
      }),

    remove: protectedProcedure
      .input(
        z.object({
          boardId: z.string().uuid(),
          userId: z.string().uuid(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await requireRole(ctx.db, input.boardId, ctx.userId, ["host"]);
        if (input.userId === ctx.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove yourself",
          });
        }
        await ctx.db
          .delete(boardMembers)
          .where(
            and(
              eq(boardMembers.boardId, input.boardId),
              eq(boardMembers.userId, input.userId)
            )
          );
      }),
  }),
});
