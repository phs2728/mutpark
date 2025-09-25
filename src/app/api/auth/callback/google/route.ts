import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueSession } from "@/services/auth-service";
import { hashPassword } from "@/lib/auth";
import { SocialProvider } from "@prisma/client";
import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  locale?: string;
}

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return tokenResponse.json();
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user info');
  }

  return userResponse.json();
}

async function findOrCreateUser(userInfo: GoogleUserInfo) {
  const { id: providerUserId, email, name } = userInfo;

  // 기존 소셜 계정 확인
  const socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: SocialProvider.GOOGLE,
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

  // 기존 이메일 계정 확인
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // 기존 사용자에 소셜 계정 연결
    await prisma.socialAccount.create({
      data: {
        provider: SocialProvider.GOOGLE,
        providerUserId,
        userId: existingUser.id,
      },
    });
    return existingUser;
  }

  // 새 사용자 생성
  const randomPassword = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      locale: "ko", // 기본값
      socialAccounts: {
        create: {
          provider: SocialProvider.GOOGLE,
          providerUserId,
        },
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/ko/auth/login?error=oauth_error', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/ko/auth/login?error=missing_code', request.url));
    }

    // OAuth 코드를 토큰으로 교환
    // 환경에 따른 리다이렉트 URI 설정 (OAuth 시작시와 동일해야 함)
    const redirectUri = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_APP_URL || url.origin}/api/auth/callback/google`
      : 'http://localhost:3000/api/auth/callback/google';
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // 사용자 정보 가져오기
    const userInfo = await getUserInfo(tokenData.access_token);

    // 사용자 찾기 또는 생성
    const user = await findOrCreateUser(userInfo);

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
          description: `Admin Google OAuth login: ${user.email}`,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      // 일반 사용자용 세션 처리
      const response = NextResponse.redirect(new URL(`/${user.locale || 'ko'}`, request.url));

      await issueSession(response, {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return response;
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/ko/auth/login?error=oauth_failed', request.url));
  }
}