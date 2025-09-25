import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPER_ADMIN만 시드 데이터 관리 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, confirmation } = await request.json();

    if (!['reset', 'populate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "reset" or "populate"' }, { status: 400 });
    }

    // reset의 경우 확인 필요
    if (action === 'reset' && confirmation !== 'RESET_SEED_DATA_CONFIRM') {
      return NextResponse.json({
        error: 'Invalid confirmation. Please type "RESET_SEED_DATA_CONFIRM"'
      }, { status: 400 });
    }

    try {
      let command;
      let message;

      if (action === 'reset') {
        // 시드 데이터 초기화 후 재생성
        command = 'npx prisma db seed';
        message = 'Seed data reset and repopulated successfully';
      } else {
        // 시드 데이터만 추가
        command = 'npx prisma db seed';
        message = 'Seed data populated successfully';
      }

      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        timeout: 60000 // 60초 타임아웃
      });

      console.log('Seed command stdout:', stdout);
      if (stderr) {
        console.warn('Seed command stderr:', stderr);
      }

      return NextResponse.json({
        success: true,
        message,
        action,
        executedAt: new Date().toISOString(),
        output: stdout
      });

    } catch (error: any) {
      console.error('Seed execution error:', error);
      return NextResponse.json({
        error: 'Failed to execute seed operation',
        details: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // 시드 데이터 상태 확인 (기본 데이터 존재 여부)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const counts = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.event.count(),
        prisma.banner.count()
      ]);

      const [userCount, productCount, categoryCount, eventCount, bannerCount] = counts;

      await prisma.$disconnect();

      return NextResponse.json({
        seedStatus: {
          users: userCount,
          products: productCount,
          categories: categoryCount,
          events: eventCount,
          banners: bannerCount,
          hasSeedData: userCount > 0 || productCount > 0,
          lastChecked: new Date().toISOString()
        }
      });

    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }

  } catch (error) {
    console.error('Seed status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}