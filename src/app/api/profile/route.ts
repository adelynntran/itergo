import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { getAuthSession } from "@/lib/api/auth";
import { parseBody } from "@/lib/api/validation";
import { badRequest, notFound } from "@/lib/api/errors";

export async function GET() {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    columns: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      interestTags: true,
    },
  });

  if (!user) return notFound("User not found");
  return NextResponse.json(user);
}

const updateSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  interestTags: z.array(z.string().trim().min(1).max(30)).max(12).optional(),
});

export async function PATCH(req: Request) {
  const auth = await getAuthSession();
  if ("error" in auth) return auth.error;

  const parsed = parseBody(updateSchema, await req.json());
  if (!parsed.success) return parsed.error;

  const data = parsed.data;
  if (
    data.displayName === undefined &&
    data.avatarUrl === undefined &&
    data.bio === undefined &&
    data.interestTags === undefined
  ) {
    return badRequest("Provide at least one field to update");
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.interestTags !== undefined ? { interestTags: data.interestTags } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, auth.userId))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      interestTags: users.interestTags,
    });

  if (!updated) return notFound("User not found");
  return NextResponse.json(updated);
}

