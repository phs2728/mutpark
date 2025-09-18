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
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
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
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);

  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
      expiresAt: { lt: new Date() },
    },
  });

  const activeTokens = await prisma.refreshToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (activeTokens.length >= 5) {
    await prisma.refreshToken.delete({ where: { id: activeTokens[0].id } });
  }

  const refreshRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: "",
      expiresAt: refreshExpiresAt,
    },
  });

  const refreshToken = createRefreshToken({ ...payload, tokenId: refreshRecord.id });

  await prisma.refreshToken.update({
    where: { id: refreshRecord.id },
    data: { token: refreshToken },
  });

  createSessionCookies(response, accessToken, refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000),
    refreshTokenExpiresAt: refreshExpiresAt,
  };
}

export async function revokeSession(refreshToken: string | null) {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
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
