import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SUPER_ADMIN만 복원 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { fileName, confirmation } = await request.json();

    // 3단계 확인 검증
    if (confirmation !== 'RESTORE_DATABASE_CONFIRM') {
      return NextResponse.json({
        error: 'Invalid confirmation. Please type "RESTORE_DATABASE_CONFIRM"'
      }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json({ error: 'Backup file name is required' }, { status: 400 });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    const backupFilePath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    // DATABASE_URL 파싱
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    const url = new URL(dbUrl);
    const dbHost = url.hostname;
    const dbPort = url.port || '3306';
    const dbName = url.pathname.slice(1);
    const dbUser = url.username;
    const dbPassword = url.password;

    try {
      // 백업에서 데이터베이스 복원
      const mysqlCmd = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName}`;
      const backupContent = fs.readFileSync(backupFilePath, 'utf8');

      await execAsync(`echo "${backupContent.replace(/"/g, '\\"')}" | ${mysqlCmd}`);

      // 감사 로그 기록
      // TODO: AuditLog 모델이 구현되면 로그 기록 추가

      return NextResponse.json({
        success: true,
        message: 'Database restored successfully',
        restoredFrom: fileName,
        restoredAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Restore error:', error);
      return NextResponse.json({
        error: 'Failed to restore database',
        details: error.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database restore error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}