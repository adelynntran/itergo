import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { locationsBin, pins } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

const restoreSchema = z.object({
  targetPlanCardId: z.string().uuid(),
});

// POST /api/locations-bin/:id/restore — restore a saved location to a plan card
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(restoreSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const item = await db.query.locationsBin.findFirst({
    where: and(eq(locationsBin.id, id), eq(locationsBin.ownerUserId, auth.userId)),
  });
  if (!item) return notFound("Location not found");

  const roleCheck = await requireRole(parsed.data.targetPlanCardId, auth.userId, [
    "host",
    "editor",
  ]);
  if ("error" in roleCheck) return roleCheck.error;

  const [restoredPin] = await db
    .insert(pins)
    .values({
      boardId: parsed.data.targetPlanCardId,
      addedBy: auth.userId,
      name: item.name,
      address: item.address,
      city: item.city,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      placeId: item.placeId,
      category: item.category,
      notes: item.notes,
      sourceType: item.sourceType,
      sourceUrl: item.sourceUrl,
      sourceMeta: item.sourceMeta,
      aiExtracted: item.aiExtracted,
      updatedAt: new Date(),
    })
    .returning();

  await db.delete(locationsBin).where(eq(locationsBin.id, id));

  return NextResponse.json(restoredPin);
}
