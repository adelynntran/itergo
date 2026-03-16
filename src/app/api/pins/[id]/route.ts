import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { pins } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { requireRole } from "@/lib/api/role";
import { parseBody } from "@/lib/api/validation";
import { notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/pins/:id — update a pin
const updatePinSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const pin = await db.query.pins.findFirst({
    where: eq(pins.id, id),
  });
  if (!pin) return notFound("Pin not found");

  const roleCheck = await requireRole(pin.boardId, auth.userId, ["host", "editor"]);
  if ("error" in roleCheck) return roleCheck.error;

  const parsed = parseBody(updatePinSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const [updated] = await db
    .update(pins)
    .set({
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      ...(parsed.data.category && { category: parsed.data.category }),
      updatedAt: new Date(),
    })
    .where(eq(pins.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/pins/:id — delete a pin
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const pin = await db.query.pins.findFirst({
    where: eq(pins.id, id),
  });
  if (!pin) return notFound("Pin not found");

  const roleCheck = await requireRole(pin.boardId, auth.userId, ["host", "editor"]);
  if ("error" in roleCheck) return roleCheck.error;

  await db.delete(pins).where(eq(pins.id, id));

  return new NextResponse(null, { status: 204 });
}
