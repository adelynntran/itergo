import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { pins, pinVotes } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// POST /api/pins/:id/vote — toggle a vote on a pin
const voteSchema = z.object({
  voteType: z.enum(["upvote", "heart", "must_do"]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id: pinId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const pin = await db.query.pins.findFirst({
    where: eq(pins.id, pinId),
  });
  if (!pin) return notFound("Pin not found");

  const roleCheck = await requireRole(pin.boardId, auth.userId, ["host", "editor", "viewer"]);
  if ("error" in roleCheck) return roleCheck.error;

  const parsed = parseBody(voteSchema, await req.json());
  if (!parsed.success) return parsed.error;

  // Toggle: delete if exists, create if not
  const existing = await db.query.pinVotes.findFirst({
    where: and(
      eq(pinVotes.pinId, pinId),
      eq(pinVotes.userId, auth.userId),
      eq(pinVotes.voteType, parsed.data.voteType)
    ),
  });

  if (existing) {
    await db.delete(pinVotes).where(eq(pinVotes.id, existing.id));
    return NextResponse.json({ action: "removed" });
  } else {
    await db.insert(pinVotes).values({
      pinId,
      userId: auth.userId,
      voteType: parsed.data.voteType,
    });
    return NextResponse.json({ action: "added" });
  }
}
