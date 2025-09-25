import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { issueSession } from "@/services/auth-service";
import { hashPassword } from "@/lib/auth";
import { SocialProvider } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { webcrypto as crypto } from "node:crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface SocialLoginPayload {
  token: string;
}

async function verifyGoogleToken(idToken: string) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    throw new Error("Invalid Google token");
  }
  const data = (await response.json()) as {
    email?: string;
    name?: string;
  };
  if (!data.email) {
    throw new Error("Google token missing email");
  }
  return {
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
  };
}

// Kakao login removed - not needed for Turkey market

async function findOrCreateUser({
  provider,
  providerUserId,
  email,
  name,
  locale,
}: {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  name: string;
  locale?: string;
}) {
  const socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    include: {
      user: true,
    },
  });

  if (socialAccount) {
    return socialAccount.user;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (locale && existingUser.locale !== locale) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { locale },
      });
    }
    await prisma.socialAccount.create({
      data: {
        provider,
        providerUserId,
        userId: existingUser.id,
      },
    });
    return existingUser;
  }

  const randomPassword = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      locale: locale ?? "ko",
      socialAccounts: {
        create: {
          provider,
          providerUserId,
        },
      },
    },
  });
}

// GET handler for OAuth initiation
export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  try {
    const { provider: providerParamValue } = await context.params;
    const providerParam = providerParamValue.toLowerCase();

    if (providerParam !== "google") {
      return errorResponse("Only Google login is supported", 400);
    }

    // Google OAuth URL 생성
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/callback/google`;

    const googleOAuthURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleOAuthURL.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
    googleOAuthURL.searchParams.append('redirect_uri', redirectUri);
    googleOAuthURL.searchParams.append('response_type', 'code');
    googleOAuthURL.searchParams.append('scope', 'openid email profile');
    googleOAuthURL.searchParams.append('state', crypto.randomUUID());

    // 직접 리다이렉트
    return NextResponse.redirect(googleOAuthURL.toString());
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return errorResponse((error as Error).message ?? "Failed to initiate Google OAuth", 500);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  try {
    const { token } = (await request.json()) as SocialLoginPayload;
    if (!token) {
      return errorResponse("Token is required", 400);
    }

    const { provider: providerParamValue } = await context.params;
    const providerParam = providerParamValue.toLowerCase();

    let email: string;
    let name: string;
    let providerUserId: string;
    let localePref: string | undefined;
    let provider: SocialProvider;

    if (providerParam === "google") {
      provider = SocialProvider.GOOGLE;
      const profile = await verifyGoogleToken(token);
      email = profile.email;
      name = profile.name;
      providerUserId = profile.email;
      localePref = undefined;
    } else {
      return errorResponse("Only Google login is supported", 400);
    }

    const user = await findOrCreateUser({ provider, providerUserId, email, name, locale: localePref });

    // 관리자 권한 확인
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(user.role);

    if (isAdmin) {
      // 관리자용 JWT 토큰 생성
      const adminToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "8h" }
      );

      // 관리자용 쿠키 설정
      const cookieStore = await cookies();
      cookieStore.set("admin-token", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60, // 8시간
        path: "/",
      });

      // 감사 로그 기록
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entityType: "AdminSession",
          entityId: user.id.toString(),
          description: `Admin Google login: ${user.email}`,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return successResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          locale: user.locale,
          role: user.role,
        },
        provider,
        isAdmin: true,
        redirectTo: "/admin/dashboard"
      });
    } else {
      // 일반 사용자용 세션 처리
      const response = successResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          locale: user.locale,
          role: user.role,
        },
        provider,
        isAdmin: false,
        redirectTo: `/${user.locale || 'ko'}`
      });

      await issueSession(response, {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return response;
    }
  } catch (error) {
    console.error(error);
    return errorResponse((error as Error).message ?? "Unable to authenticate", 400);
  }
}
