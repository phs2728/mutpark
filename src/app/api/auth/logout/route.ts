import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api";
import { clearSessionCookies, revokeSession } from "@/services/auth-service";
import { REFRESH_COOKIE_NAME } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;
    await revokeSession(refreshToken);

    const response = successResponse({ message: "Logged out" });
    clearSessionCookies(response);
    return response;
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to logout", 500);
  }
}
