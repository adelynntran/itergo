import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/boards/:id/archive — archive a board
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  await db
    .update(dreamBoards)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(dreamBoards.id, id));

  return new NextResponse(null, { status: 204 });
}
