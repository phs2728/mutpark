import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validators";
import { errorResponse, successResponse } from "@/lib/api";
import { issueSession, validateUserCredentials } from "@/services/auth-service";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimiters, getClientIdentifier } from "@/utils/security";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIdentifier(request);
    const rateLimitResult = rateLimiters.auth.checkLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return errorResponse("Too many login attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await validateUserCredentials(data.email, data.password);

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

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
          description: `Admin login: ${user.email}`,
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
    console.error("Login error:", error);
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    return errorResponse("Unexpected error", 500);
  }
}
