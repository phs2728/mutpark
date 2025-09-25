import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

// 모의 관리자 사용자 데이터
let adminUsers = [
  {
    id: 1,
    email: 'admin@mutpark.com',
    name: '시스템 관리자',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 2,
    email: 'manager@mutpark.com',
    name: '운영 관리자',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

let nextId = 3;

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPER_ADMIN만 관리자 계정 조회 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      users: adminUsers
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPER_ADMIN만 관리자 계정 생성 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { email, name, role, password } = await request.json();

    // 유효성 검사
    if (!email || !name || !role || !password) {
      return NextResponse.json({
        error: 'All fields are required'
      }, { status: 400 });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'OPERATOR'].includes(role)) {
      return NextResponse.json({
        error: 'Invalid role'
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingUser = adminUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json({
        error: 'Email already exists'
      }, { status: 400 });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 새 관리자 사용자 생성
    const newUser = {
      id: nextId++,
      email,
      name,
      role: role as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'OPERATOR',
      status: 'ACTIVE' as const,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      isActive: true,
      // 실제로는 비밀번호를 저장하지 않음 (보안상)
    };

    adminUsers.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Admin user created successfully'
    });

  } catch (error) {
    console.error('Create admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}