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

    // SUPER_ADMIN만 전체 초기화 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const {
      confirmationStep1,
      confirmationStep2,
      confirmationStep3,
      resetType
    } = await request.json();

    // 3단계 확인 검증
    if (confirmationStep1 !== 'I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA') {
      return NextResponse.json({
        error: 'Step 1 confirmation failed. Please type exactly: "I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA"'
      }, { status: 400 });
    }

    if (confirmationStep2 !== 'DELETE_ALL_DATABASE_CONTENT') {
      return NextResponse.json({
        error: 'Step 2 confirmation failed. Please type exactly: "DELETE_ALL_DATABASE_CONTENT"'
      }, { status: 400 });
    }

    if (confirmationStep3 !== 'FINAL_CONFIRMATION_RESET_DATABASE') {
      return NextResponse.json({
        error: 'Step 3 confirmation failed. Please type exactly: "FINAL_CONFIRMATION_RESET_DATABASE"'
      }, { status: 400 });
    }

    if (!['full', 'schema_only'].includes(resetType)) {
      return NextResponse.json({
        error: 'Invalid reset type. Use "full" or "schema_only"'
      }, { status: 400 });
    }

    try {
      // 데이터베이스 완전 초기화 실행 - 화이트리스트 명령어만 허용
      const allowedCommands = [
        'npx prisma db push --force-reset',
        'npx prisma generate',
        'npx prisma db seed'
      ];

      let commands: string[] = [];

      if (resetType === 'full') {
        // 1. 데이터베이스 스키마 재생성
        commands.push('npx prisma db push --force-reset');
        // 2. Prisma 클라이언트 재생성
        commands.push('npx prisma generate');
        // 3. 시드 데이터 생성
        commands.push('npx prisma db seed');
      } else {
        // 스키마만 초기화 (데이터만 삭제)
        commands.push('npx prisma db push --force-reset');
        commands.push('npx prisma generate');
      }

      // 화이트리스트 검증
      for (const command of commands) {
        if (!allowedCommands.includes(command)) {
          throw new Error(`Unauthorized command: ${command}`);
        }
      }

      const results = [];

      for (const command of commands) {
        try {
          const { stdout, stderr } = await execAsync(command, {
            cwd: process.cwd(),
            timeout: 120000 // 2분 타임아웃
          });

          results.push({
            command,
            success: true,
            stdout: stdout.trim(),
            stderr: stderr ? stderr.trim() : null
          });

        } catch (error: any) {
          console.error(`Command failed: ${command}`, error);
          results.push({
            command,
            success: false,
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr
          });

          // 중요한 명령이 실패하면 전체 프로세스 중단
          throw new Error(`Critical command failed: ${command} - ${error.message}`);
        }
      }

      // 성공적으로 완료
      return NextResponse.json({
        success: true,
        message: resetType === 'full'
          ? 'Database completely reset and reseeded successfully'
          : 'Database schema reset successfully',
        resetType,
        executedAt: new Date().toISOString(),
        commands: results,
        warning: 'All previous data has been permanently deleted'
      });

    } catch (error: any) {
      console.error('Database reset error:', error);
      return NextResponse.json({
        error: 'Failed to reset database',
        details: error.message,
        resetType,
        executedAt: new Date().toISOString(),
        warning: 'Database may be in an inconsistent state. Please check manually.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database reset API error:', error);
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

    // 데이터베이스 상태 정보 반환
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // 주요 테이블의 레코드 수 확인
      const tableStats = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.communityPost.count(),
        prisma.event.count(),
        prisma.banner.count()
      ]);

      const [userCount, productCount, orderCount, postCount, eventCount, bannerCount] = tableStats;
      const totalRecords = tableStats.reduce((sum, count) => sum + count, 0);

      await prisma.$disconnect();

      return NextResponse.json({
        databaseInfo: {
          tables: {
            users: userCount,
            products: productCount,
            orders: orderCount,
            communityPosts: postCount,
            events: eventCount,
            banners: bannerCount
          },
          totalRecords,
          hasData: totalRecords > 0,
          lastChecked: new Date().toISOString()
        },
        resetOptions: {
          full: 'Complete database reset with fresh seed data',
          schema_only: 'Reset schema only (no seed data)'
        },
        confirmationSteps: [
          'I_UNDERSTAND_THIS_WILL_DELETE_ALL_DATA',
          'DELETE_ALL_DATABASE_CONTENT',
          'FINAL_CONFIRMATION_RESET_DATABASE'
        ]
      });

    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }

  } catch (error) {
    console.error('Database info check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}