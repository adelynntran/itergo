import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { locationsBin } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/locations-bin/:id — permanently remove an item from the bin
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const item = await db.query.locationsBin.findFirst({
    where: and(eq(locationsBin.id, id), eq(locationsBin.ownerUserId, auth.userId)),
  });
  if (!item) return notFound("Location not found");

  await db.delete(locationsBin).where(eq(locationsBin.id, id));
  return new NextResponse(null, { status: 204 });
}
