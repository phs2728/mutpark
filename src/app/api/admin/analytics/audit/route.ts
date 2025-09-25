import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

interface AuditLog {
  id: number;
  adminId: number;
  adminEmail: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface AuditAnalytics {
  totalActions: number;
  uniqueAdmins: number;
  actionsByType: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  actionsBySeverity: Array<{
    severity: string;
    count: number;
    percentage: number;
  }>;
  recentLogs: AuditLog[];
  adminActivity: Array<{
    adminId: number;
    adminName: string;
    adminEmail: string;
    actionCount: number;
    lastActivity: string;
  }>;
  timelineData: Array<{
    date: string;
    actions: number;
    criticalActions: number;
  }>;
}

// 모의 감사 로그 데이터
let auditLogs: AuditLog[] = [
  {
    id: 1,
    adminId: 1,
    adminEmail: 'admin@mutpark.com',
    adminName: '시스템 관리자',
    action: 'USER_CREATE',
    resource: 'ADMIN_USER',
    resourceId: '3',
    details: '새 관리자 계정 생성: moderator@mutpark.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'HIGH'
  },
  {
    id: 2,
    adminId: 2,
    adminEmail: 'manager@mutpark.com',
    adminName: '운영 관리자',
    action: 'DATABASE_BACKUP',
    resource: 'DATABASE',
    details: '데이터베이스 백업 생성',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'MEDIUM'
  },
  {
    id: 3,
    adminId: 1,
    adminEmail: 'admin@mutpark.com',
    adminName: '시스템 관리자',
    action: 'SETTINGS_UPDATE',
    resource: 'SYSTEM_SETTINGS',
    details: '시스템 설정 변경: maintenance_mode = false',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    severity: 'MEDIUM'
  },
  {
    id: 4,
    adminId: 1,
    adminEmail: 'admin@mutpark.com',
    adminName: '시스템 관리자',
    action: 'DATABASE_RESET',
    resource: 'DATABASE',
    details: '데이터베이스 초기화 실행',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    severity: 'CRITICAL'
  },
  {
    id: 5,
    adminId: 2,
    adminEmail: 'manager@mutpark.com',
    adminName: '운영 관리자',
    action: 'USER_LOGIN',
    resource: 'AUTH',
    details: '관리자 로그인',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    severity: 'LOW'
  }
];

let nextLogId = auditLogs.length + 1;

function generateMockAuditData(period: string): AuditAnalytics {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const now = new Date();

  // 기간에 따른 필터링
  const filteredLogs = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return logDate >= cutoffDate;
  });

  // 액션 유형별 집계
  const actionCounts = filteredLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalActions = Object.values(actionCounts).reduce((sum, count) => sum + count, 0);
  const actionsByType = Object.entries(actionCounts).map(([action, count]) => ({
    action,
    count,
    percentage: Math.round((count / totalActions) * 100)
  })).sort((a, b) => b.count - a.count);

  // 심각도별 집계
  const severityCounts = filteredLogs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionsBySeverity = Object.entries(severityCounts).map(([severity, count]) => ({
    severity,
    count,
    percentage: Math.round((count / totalActions) * 100)
  }));

  // 관리자별 활동 집계
  const adminActivityMap = filteredLogs.reduce((acc, log) => {
    if (!acc[log.adminId]) {
      acc[log.adminId] = {
        adminId: log.adminId,
        adminName: log.adminName,
        adminEmail: log.adminEmail,
        actionCount: 0,
        lastActivity: log.timestamp
      };
    }
    acc[log.adminId].actionCount++;
    if (new Date(log.timestamp) > new Date(acc[log.adminId].lastActivity)) {
      acc[log.adminId].lastActivity = log.timestamp;
    }
    return acc;
  }, {} as Record<number, any>);

  const adminActivity = Object.values(adminActivityMap)
    .sort((a: any, b: any) => b.actionCount - a.actionCount);

  // 타임라인 데이터 생성
  const timelineData = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];

    const dayLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toISOString().split('T')[0] === dateStr;
    });

    const actions = dayLogs.length;
    const criticalActions = dayLogs.filter(log => log.severity === 'CRITICAL').length;

    return {
      date: dateStr,
      actions,
      criticalActions
    };
  });

  const uniqueAdmins = new Set(filteredLogs.map(log => log.adminId)).size;

  return {
    totalActions,
    uniqueAdmins,
    actionsByType,
    actionsBySeverity,
    recentLogs: filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20),
    adminActivity,
    timelineData
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 감사 로그는 SUPER_ADMIN만 조회 가능
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const adminId = searchParams.get('adminId');

    // 허용된 기간만 처리
    if (!['7d', '30d', '90d'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }

    const auditData = generateMockAuditData(period);

    // 필터 적용
    let filteredData = { ...auditData };

    if (action) {
      filteredData.recentLogs = auditData.recentLogs.filter(log =>
        log.action.toLowerCase().includes(action.toLowerCase())
      );
    }

    if (severity) {
      filteredData.recentLogs = filteredData.recentLogs.filter(log =>
        log.severity.toLowerCase() === severity.toLowerCase()
      );
    }

    if (adminId) {
      const adminIdNum = parseInt(adminId);
      filteredData.recentLogs = filteredData.recentLogs.filter(log =>
        log.adminId === adminIdNum
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      period,
      filters: { action, severity, adminId }
    });

  } catch (error) {
    console.error('Audit analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, resource, resourceId, details, severity } = await request.json();

    // 필수 필드 검증
    if (!action || !resource || !details) {
      return NextResponse.json({
        error: 'Missing required fields: action, resource, details'
      }, { status: 400 });
    }

    // 허용된 심각도 검증
    if (severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
      return NextResponse.json({
        error: 'Invalid severity level'
      }, { status: 400 });
    }

    // 새 감사 로그 추가
    const newLog: AuditLog = {
      id: nextLogId++,
      adminId: authResult.user?.id || 0,
      adminEmail: authResult.user?.email || '',
      adminName: authResult.user?.name || '',
      action,
      resource,
      resourceId,
      details,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || '',
      timestamp: new Date().toISOString(),
      severity: severity || 'LOW'
    };

    auditLogs.push(newLog);

    return NextResponse.json({
      success: true,
      log: newLog,
      message: 'Audit log created successfully'
    });

  } catch (error) {
    console.error('Create audit log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}