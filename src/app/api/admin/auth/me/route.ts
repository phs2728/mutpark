import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const adminUser = await verifyAdminToken(token);

    if (!adminUser) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: adminUser,
    });
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}