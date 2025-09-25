import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAdminToken } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // Find user with admin role
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 관리자 계정입니다." },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "관리자 권한이 없습니다." },
        { status: 401 }
      );
    }

    // For development, if no password hash exists, allow login
    if (user.passwordHash) {
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "잘못된 비밀번호입니다." },
          { status: 401 }
        );
      }
    }

    // Update last login (if lastLoginAt field exists)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      });
    } catch (error) {
      // Continue if update fails (field might not exist)
    }

    // Generate token
    const token = generateAdminToken(user);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/"
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}