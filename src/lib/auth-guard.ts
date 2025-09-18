import { NextRequest } from "next/server";
import { extractTokenFromRequest } from "@/lib/session";
import { verifyAccessToken } from "@/lib/auth";

interface RequireAuthOptions {
  adminOnly?: boolean;
}

export function requireAuth(request: NextRequest, options?: RequireAuthOptions) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const payload = verifyAccessToken(token);
    if (options?.adminOnly && payload.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      throw error;
    }
    throw new Error("UNAUTHORIZED");
  }
}
