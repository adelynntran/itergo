import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { dreamBoards } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { generateCode, generatePin } from "@/lib/api/utils";

type Params = { params: Promise<{ id: string }> };

// POST /api/boards/:id/invite — generate new invite code and PIN
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const roleCheck = await requireRole(id, auth.userId, ["host"]);
  if ("error" in roleCheck) return roleCheck.error;

  const code = generateCode(6);
  const pin = generatePin();

  await db
    .update(dreamBoards)
    .set({ inviteCode: code, invitePin: pin })
    .where(eq(dreamBoards.id, id));

  return NextResponse.json({ code, pin });
}
