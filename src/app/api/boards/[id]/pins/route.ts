import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "@/server/db";
import { pins } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";

type Params = { params: Promise<{ id: string }> };

// GET /api/boards/:id/pins — list pins for a board
export async function GET(req: NextRequest, { params }: Params) {
  const { id: boardId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(boardId, auth.userId, ["host", "editor", "viewer"]);
  if ("error" in roleCheck) return roleCheck.error;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const sortBy = searchParams.get("sortBy") ?? "recent";

  const allPins = await db.query.pins.findMany({
    where: category
      ? and(eq(pins.boardId, boardId), eq(pins.category, category))
      : eq(pins.boardId, boardId),
    with: {
      addedByUser: true,
      votes: true,
      comments: true,
      media: true,
    },
    orderBy: sortBy === "name" ? [asc(pins.name)] : [desc(pins.createdAt)],
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
      .filter((v) => v.userId === auth.userId)
      .map((v) => v.voteType),
  }));

  if (sortBy === "most_voted") {
    pinsWithCounts.sort((a, b) => b.totalVotes - a.totalVotes);
  }

  return NextResponse.json(pinsWithCounts);
}

// POST /api/boards/:id/pins — create a pin
const createPinSchema = z.object({
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
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id: boardId } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(boardId, auth.userId, ["host", "editor"]);
  if ("error" in roleCheck) return roleCheck.error;

  const parsed = parseBody(createPinSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [pin] = await db
    .insert(pins)
    .values({
      boardId,
      addedBy: auth.userId,
      name: parsed.data.name,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address,
      city: parsed.data.city,
      country: parsed.data.country,
      category: parsed.data.category,
      notes: parsed.data.notes,
      placeId: parsed.data.placeId,
      sourceType: parsed.data.sourceType,
    })
    .returning();

  return NextResponse.json(pin, { status: 201 });
}
