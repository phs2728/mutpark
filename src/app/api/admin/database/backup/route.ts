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

    // SUPER_ADMIN만 백업 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `mutpark_backup_${timestamp}.sql`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // MySQL 백업 명령어 (환경변수에서 DB 설정 읽기)
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // DATABASE_URL 파싱
    const url = new URL(dbUrl);
    const dbHost = url.hostname;
    const dbPort = url.port || '3306';
    const dbName = url.pathname.slice(1);
    const dbUser = url.username;
    const dbPassword = url.password;

    const mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName}`;

    try {
      const { stdout } = await execAsync(mysqldumpCmd);
      fs.writeFileSync(backupFilePath, stdout);

      // 백업 파일 정보
      const stats = fs.statSync(backupFilePath);

      return NextResponse.json({
        success: true,
        backup: {
          fileName: backupFileName,
          filePath: backupFilePath,
          size: stats.size,
          createdAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('Backup error:', error);
      return NextResponse.json({
        error: 'Failed to create backup',
        details: error.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database backup error:', error);
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

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ backups });

  } catch (error) {
    console.error('List backups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}