import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { boardMembers } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";

type Params = { params: Promise<{ id: string }> };

// GET /api/boards/:id/members — list all members of a board
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host", "editor", "viewer"]);
  if ("error" in roleCheck) return roleCheck.error;

  const members = await db.query.boardMembers.findMany({
    where: eq(boardMembers.boardId, id),
    with: { user: true },
  });

  return NextResponse.json(members);
}
