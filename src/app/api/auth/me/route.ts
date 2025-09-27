import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";

// GET /api/auth/me - Get current user information
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: auth.userId,
        email: auth.email,
        displayName: auth.displayName,
        provider: auth.provider
      }
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "사용자 정보 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}