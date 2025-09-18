import { successResponse } from "@/lib/api";

export const runtime = "edge";

export async function GET() {
  return successResponse({ status: "ok", timestamp: Date.now() });
}
