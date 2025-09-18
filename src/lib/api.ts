import { NextResponse } from "next/server";

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, message }, { status });
}

export function successResponse<T>(data: T, init?: ResponseInit) {
  return jsonResponse({ success: true, data }, init);
}
