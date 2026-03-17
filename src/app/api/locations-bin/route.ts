import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { locationsBin } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";

// GET /api/locations-bin — list saved locations for the current user
export async function GET() {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const items = await db.query.locationsBin.findMany({
    where: eq(locationsBin.ownerUserId, auth.userId),
    orderBy: [desc(locationsBin.removedAt)],
  });

  return NextResponse.json(items);
}
