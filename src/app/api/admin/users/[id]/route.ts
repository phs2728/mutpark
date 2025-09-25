import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

// 모의 관리자 사용자 데이터 (실제로는 데이터베이스에서 가져옴)
// 이는 route.ts에서 import해야 하지만 간단히 하기 위해 여기에 복제
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    const user = adminUsers.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    const userIndex = adminUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates = await request.json();

    // 허용된 필드만 업데이트
    const allowedFields = ['name', 'role', 'isActive', 'status'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // 상태 동기화
    if (filteredUpdates.isActive !== undefined) {
      filteredUpdates.status = filteredUpdates.isActive ? 'ACTIVE' : 'INACTIVE';
    }

    adminUsers[userIndex] = {
      ...adminUsers[userIndex],
      ...filteredUpdates
    };

    return NextResponse.json({
      success: true,
      user: adminUsers[userIndex],
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    const userIndex = adminUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 본인 계정은 삭제할 수 없음
    if (adminUsers[userIndex].id === authResult.user?.id) {
      return NextResponse.json({
        error: 'Cannot delete your own account'
      }, { status: 400 });
    }

    // SUPER_ADMIN은 한 명만 남겨두어야 함
    const superAdminCount = adminUsers.filter(u => u.role === 'SUPER_ADMIN').length;
    if (adminUsers[userIndex].role === 'SUPER_ADMIN' && superAdminCount <= 1) {
      return NextResponse.json({
        error: 'Cannot delete the last SUPER_ADMIN account'
      }, { status: 400 });
    }

    adminUsers.splice(userIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}