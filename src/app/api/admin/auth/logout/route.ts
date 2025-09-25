import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (token) {
      try {
        const adminUser = await verifyAdminToken(token);
        if (adminUser) {
          // 감사 로그 기록
          await prisma.auditLog.create({
            data: {
              userId: adminUser.userId,
              action: "LOGOUT",
              entityType: "AdminSession",
              entityId: adminUser.userId.toString(),
              description: `관리자 로그아웃: ${adminUser.email}`,
              ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
              userAgent: request.headers.get("user-agent") || "unknown",
            },
          });
        }
      } catch (error) {
        // 토큰 검증 실패시에도 로그아웃 처리
        console.warn("Token verification failed during logout:", error);
      }
    }

    // 쿠키 삭제
    cookieStore.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ message: "로그아웃 완료" });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}