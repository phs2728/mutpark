import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  AccessTokenPayload,
} from "@/lib/auth";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/session";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60; // 1 hour
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function createSessionCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookies(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });
}

export async function issueSession(response: NextResponse, user: { id: number; email: string; role: string }) {
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createAccessToken(payload);

  // 기존 사용자의 모든 RefreshToken들 정리 (보안성 향상)
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id
      }
    });
  } catch (error) {
    console.error("Failed to clean up existing tokens:", error);
    // 토큰 정리 실패는 치명적이지 않으므로 계속 진행
  }

  // 유니크한 토큰 생성을 위한 재시도 로직
  let refreshToken: string;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // 타임스탬프와 랜덤값을 추가하여 유니크성 보장
      const tokenPayload = {
        ...payload,
        tokenId: `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      };
      refreshToken = createRefreshToken(tokenPayload);

      const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: refreshExpiresAt,
        }
      });

      createSessionCookies(response, accessToken, refreshToken);

      return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000),
        refreshTokenExpiresAt: refreshExpiresAt,
      };
    } catch (error: any) {
      retryCount++;
      console.error(`Failed to create refresh token (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error(`Failed to create refresh token after ${maxRetries} attempts: ${error.message}`);
      }

      // 짧은 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
    }
  }

  throw new Error("Unexpected error in token creation");
}

export async function revokeSession(refreshToken: string | null, userId?: number) {
  if (!refreshToken) return;

  try {
    // 토큰으로 찾아서 삭제 (TEXT 타입이므로 정확한 일치 검색)
    const existingTokens = await prisma.refreshToken.findMany({
      where: {
        token: refreshToken,
        ...(userId && { userId })
      }
    });

    if (existingTokens.length > 0) {
      const deletedToken = await prisma.refreshToken.deleteMany({
        where: {
          id: { in: existingTokens.map(t => t.id) }
        }
      });

      console.log(`Revoked ${deletedToken.count} refresh tokens`);
      return deletedToken;
    }

    // Also clean up any expired tokens for the user if userId is provided
    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          expiresAt: { lte: new Date() }
        }
      });
    }

    return { count: 0 };
  } catch (error) {
    console.error("Error revoking session:", error);
    throw error;
  }
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return user;
}

export async function registerUser({
  email,
  password,
  name,
  locale,
  phone,
}: {
  email: string;
  password: string;
  name: string;
  locale: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      locale,
      phone,
    },
  });

  return user;
}

export async function logoutUser(refreshToken: string | null, userId?: number) {
  const response = NextResponse.json({ success: true });

  try {
    // Clear cookies
    clearSessionCookies(response);

    // Revoke the session in database
    if (refreshToken) {
      await revokeSession(refreshToken, userId);
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if database cleanup fails, clear the cookies
    clearSessionCookies(response);
    return response;
  }
}
