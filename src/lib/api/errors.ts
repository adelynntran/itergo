import { NextResponse } from "next/server";

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function badRequest(message: string) {
  return apiError(400, message);
}

export function unauthorized() {
  return apiError(401, "Unauthorized");
}

export function forbidden(message = "Forbidden") {
  return apiError(403, message);
}

export function notFound(message = "Not found") {
  return apiError(404, message);
}
