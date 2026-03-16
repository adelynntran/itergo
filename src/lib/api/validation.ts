import { NextResponse } from "next/server";
import { type ZodSchema } from "zod";

export function parseBody<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue: { message: string }) => issue.message)
      .join(", ");
    return {
      success: false,
      error: NextResponse.json({ error: message }, { status: 400 }),
    };
  }
  return { success: true, data: result.data };
}
