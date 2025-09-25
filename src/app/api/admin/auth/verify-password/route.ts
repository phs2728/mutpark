import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { rateLimiters, getClientIdentifier } from '@/utils/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin password verification
    const clientIP = getClientIdentifier(request);
    const rateLimitResult = rateLimiters.auth.checkLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Too many verification attempts. Please try again later.'
      }, { status: 429 });
    }

    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({
        error: '비밀번호를 입력해주세요.'
      }, { status: 400 });
    }

    // 실제 데이터베이스에서 관리자 비밀번호 조회
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const adminUser = await prisma.user.findUnique({
        where: {
          id: authResult.user?.userId,
          role: { in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'OPERATOR'] }
        },
        select: { passwordHash: true }
      });

      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: '관리자 계정을 찾을 수 없습니다.'
        }, { status: 404 });
      }

      // 실제 데이터베이스 비밀번호 검증
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);

    } finally {
      await prisma.$disconnect();
    }

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: '비밀번호가 올바르지 않습니다.'
      }, { status: 401 });
    }

    // 성공적인 비밀번호 확인 - 임시 토큰 생성 (5분간 유효)
    const verificationToken = Buffer.from(JSON.stringify({
      userId: authResult.user?.userId,
      timestamp: Date.now(),
      action: 'SYSTEM_ACCESS_VERIFIED'
    })).toString('base64');


    const response = NextResponse.json({
      success: true,
      message: '비밀번호가 확인되었습니다.',
      verificationToken
    });

    // 시스템 접근 인증 쿠키 설정 (5분간 유효)
    response.cookies.set('system-access-token', verificationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 300 // 5분
    });

    return response;

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 시스템 접근 토큰 확인
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({
        isVerified: false,
        message: '시스템 관리 접근을 위해 비밀번호를 다시 입력해주세요.'
      });
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    const systemAccessToken = cookies['system-access-token'];
    if (!systemAccessToken) {
      return NextResponse.json({
        isVerified: false,
        message: '시스템 관리 접근을 위해 비밀번호를 다시 입력해주세요.'
      });
    }

    try {
      const tokenData = JSON.parse(Buffer.from(systemAccessToken, 'base64').toString());
      const tokenAge = Date.now() - tokenData.timestamp;
      const fiveMinutes = 5 * 60 * 1000; // 5분

      if (tokenAge > fiveMinutes) {
        return NextResponse.json({
          isVerified: false,
          message: '시스템 접근 인증이 만료되었습니다. 비밀번호를 다시 입력해주세요.'
        });
      }

      if (tokenData.userId !== authResult.user?.userId) {
        return NextResponse.json({
          isVerified: false,
          message: '인증 정보가 일치하지 않습니다.'
        });
      }

      return NextResponse.json({
        isVerified: true,
        message: '시스템 관리 접근이 인증되었습니다.',
        expiresIn: Math.max(0, fiveMinutes - tokenAge)
      });

    } catch (error) {
      return NextResponse.json({
        isVerified: false,
        message: '인증 토큰이 유효하지 않습니다.'
      });
    }

  } catch (error) {
    console.error('System access verification error:', error);
    return NextResponse.json({
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}