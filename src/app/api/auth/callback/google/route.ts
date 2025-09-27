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

  console.log('🔄 Processing user:', email, 'with Google ID:', providerUserId);

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
    console.log('✅ Found existing social account for:', email);
    return socialAccount.user;
  }

  // 기존 이메일 계정 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      socialAccounts: true
    }
  });

  if (existingUser) {
    console.log('🔗 Found existing user, linking Google account:', email);

    // 기존 사용자에게 Google 소셜 계정 연결
    const existingGoogleAccount = existingUser.socialAccounts.find(
      account => account.provider === SocialProvider.GOOGLE
    );

    if (!existingGoogleAccount) {
      await prisma.socialAccount.create({
        data: {
          provider: SocialProvider.GOOGLE,
          providerUserId,
          userId: existingUser.id,
        },
      });
      console.log('✅ Successfully linked Google account to existing user:', email);
    } else {
      console.log('✅ Google account already linked to user:', email);
    }

    return existingUser;
  }

  // 새 사용자 생성
  console.log('🆕 Creating new user:', email);
  const randomPassword = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  const newUser = await prisma.user.create({
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

  console.log('✅ Successfully created new user:', email, 'with ID:', newUser.id);
  return newUser;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('🔄 Google OAuth callback - URL:', url.pathname);
    console.log('🔄 Parameters:', { code: code ? 'present' : 'missing', state, error });

    if (error) {
      console.error('❌ OAuth error from Google:', error);
      return NextResponse.redirect(new URL('/ko/auth/login?error=oauth_error', request.url));
    }

    if (!code) {
      console.error('❌ Missing authorization code');
      return NextResponse.redirect(new URL('/ko/auth/login?error=missing_code', request.url));
    }

    // OAuth 코드를 토큰으로 교환
    // 현재 호스트 기반으로 redirect_uri 동적 생성
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

    console.log('🔄 Using redirect URI:', redirectUri);

    let tokenData;
    try {
      tokenData = await exchangeCodeForToken(code, redirectUri);
      console.log('✅ Successfully exchanged code for token');
    } catch (tokenError) {
      console.error('❌ Token exchange failed:', tokenError);
      return NextResponse.redirect(new URL('/ko/auth/login?error=token_exchange_failed', request.url));
    }

    // 사용자 정보 가져오기
    let userInfo;
    try {
      userInfo = await getUserInfo(tokenData.access_token);
      console.log('✅ Successfully retrieved user info for:', userInfo.email);
    } catch (userInfoError) {
      console.error('❌ User info retrieval failed:', userInfoError);
      return NextResponse.redirect(new URL('/ko/auth/login?error=user_info_failed', request.url));
    }

    // 사용자 찾기 또는 생성
    let user;
    try {
      user = await findOrCreateUser(userInfo);
      console.log('✅ Successfully processed user:', user.email);
    } catch (userError) {
      console.error('❌ User creation/retrieval failed:', userError);
      return NextResponse.redirect(new URL('/ko/auth/login?error=user_processing_failed', request.url));
    }

    // 관리자 권한 확인
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(user.role);

    if (isAdmin) {
      try {
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

        console.log('✅ Admin login successful for:', user.email);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch (adminError) {
        console.error('❌ Admin session creation failed:', adminError);
        return NextResponse.redirect(new URL('/ko/auth/login?error=admin_session_failed', request.url));
      }
    } else {
      try {
        // 일반 사용자용 세션 처리
        const response = NextResponse.redirect(new URL(`/${user.locale || 'ko'}`, request.url));

        await issueSession(response, {
          id: user.id,
          email: user.email,
          role: user.role,
        });

        console.log('✅ User login successful for:', user.email);
        return response;
      } catch (sessionError) {
        console.error('❌ User session creation failed:', sessionError);
        return NextResponse.redirect(new URL('/ko/auth/login?error=session_failed', request.url));
      }
    }
  } catch (error) {
    console.error('❌ Critical Google OAuth callback error:', error);

    // 더 상세한 에러 정보 로깅
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.redirect(new URL('/ko/auth/login?error=oauth_failed', request.url));
  }
}