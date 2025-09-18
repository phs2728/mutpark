import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createAccessToken, verifyRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      return errorResponse("Refresh token missing", 401);
    }

    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
    });

    if (!storedToken || storedToken.token !== refreshToken) {
      return errorResponse("Refresh token invalid", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return errorResponse("Refresh token expired", 401);
    }

    const accessToken = createAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    const response = successResponse({ accessToken });
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to refresh token", 401);
  }
}
