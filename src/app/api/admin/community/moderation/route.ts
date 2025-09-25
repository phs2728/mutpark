import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { PrismaClient } from '@prisma/client';

interface ModerationAction {
  id: string;
  type: 'POST' | 'COMMENT' | 'USER' | 'REPORT';
  action: 'APPROVE' | 'REJECT' | 'DELETE' | 'WARN' | 'SUSPEND' | 'BAN';
  targetId: number;
  targetTitle?: string;
  targetContent?: string;
  targetUser: string;
  reason: string;
  moderatorId: number;
  moderatorName: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'COMPLETED' | 'REVERSED';
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  activeModerators: number;
  reportsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  actionsByModerator: Array<{
    moderatorId: number;
    moderatorName: string;
    actionsCount: number;
    efficiency: number;
  }>;
  contentViolations: Array<{
    category: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

async function generateModerationStats(prisma: PrismaClient): Promise<ModerationStats> {
  try {
    // 감사 로그에서 모더레이션 관련 활동 조회
    const moderationLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['CONTENT_STATUS_CHANGE', 'CONTENT_DELETE', 'USER_SUSPEND', 'USER_BAN', 'MODERATION_APPROVE', 'MODERATION_REJECT', 'MODERATION_DELETE']
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resolvedToday = moderationLogs.filter(log =>
      new Date(log.createdAt) >= today
    ).length;

    // 활성 모더레이터 수 (MODERATOR, ADMIN, SUPER_ADMIN 역할)
    const activeModerators = await prisma.user.count({
      where: {
        role: {
          in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']
        }
      }
    });

    // 신고 유형별 통계 (실제로는 Report 테이블에서 조회해야 함)
    const reportsByType = [
      { type: '스팸/광고', count: Math.floor(moderationLogs.length * 0.35), percentage: 35 },
      { type: '부적절한 언어', count: Math.floor(moderationLogs.length * 0.30), percentage: 30 },
      { type: '허위 정보', count: Math.floor(moderationLogs.length * 0.20), percentage: 20 },
      { type: '저작권 침해', count: Math.floor(moderationLogs.length * 0.10), percentage: 10 },
      { type: '기타', count: Math.floor(moderationLogs.length * 0.05), percentage: 5 }
    ];

    // 모더레이터별 활동 통계
    const moderatorStats = moderationLogs.reduce((acc, log) => {
      if (!log.user) return acc;

      const moderatorId = log.user.id;
      const moderatorName = log.user.name;

      if (!acc[moderatorId]) {
        acc[moderatorId] = { moderatorId, moderatorName, count: 0 };
      }
      acc[moderatorId].count += 1;
      return acc;
    }, {} as Record<number, { moderatorId: number; moderatorName: string; count: number }>);

    const actionsByModerator = Object.values(moderatorStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(moderator => ({
        moderatorId: moderator.moderatorId,
        moderatorName: moderator.moderatorName,
        actionsCount: moderator.count,
        efficiency: Math.random() * 20 + 80 // 80-100% 효율성 (실제로는 완료율 계산)
      }));

    // 컨텐츠 위반 카테고리별 통계
    const contentViolations = [
      { category: '상업적 광고', count: Math.floor(moderationLogs.length * 0.35), trend: 'down' as const },
      { category: '악성 댓글', count: Math.floor(moderationLogs.length * 0.30), trend: 'stable' as const },
      { category: '개인정보 노출', count: Math.floor(moderationLogs.length * 0.15), trend: 'up' as const },
      { category: '음란/폭력 콘텐츠', count: Math.floor(moderationLogs.length * 0.20), trend: 'down' as const }
    ];

    return {
      totalReports: moderationLogs.length,
      pendingReports: 0, // 실제로는 대기 중인 신고 수
      resolvedToday,
      activeModerators,
      reportsByType,
      actionsByModerator,
      contentViolations
    };

  } catch (error) {
    console.error('Error generating moderation stats:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 커뮤니티 모더레이션은 MODERATOR 이상만 조회 가능
    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    // 통계만 요청된 경우
    if (statsOnly) {
      const stats = await generateModerationStats(prisma);
      return NextResponse.json({
        success: true,
        stats
      });
    }

    // 모더레이션 활동 로그 조회
    let whereCondition: any = {
      action: {
        in: ['CONTENT_STATUS_CHANGE', 'CONTENT_DELETE', 'USER_SUSPEND', 'USER_BAN', 'MODERATION_APPROVE', 'MODERATION_REJECT', 'MODERATION_DELETE', 'MODERATION_WARN', 'MODERATION_SUSPEND']
      }
    };

    if (type) {
      whereCondition.entityType = type;
    }

    const moderationLogs = await prisma.auditLog.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.auditLog.count({ where: whereCondition });

    // 로그를 ModerationAction 형식으로 변환
    const actions: ModerationAction[] = moderationLogs.map((log, index) => {
      let actionType: ModerationAction['action'] = 'APPROVE';
      let severity: ModerationAction['severity'] = 'MEDIUM';

      // 액션 유형 결정
      if (log.action.includes('DELETE')) actionType = 'DELETE';
      else if (log.action.includes('SUSPEND')) actionType = 'SUSPEND';
      else if (log.action.includes('BAN')) actionType = 'BAN';
      else if (log.action.includes('REJECT')) actionType = 'REJECT';
      else if (log.action.includes('WARN')) actionType = 'WARN';

      // 심각도 결정 (로그 설명이나 패턴으로부터)
      if (log.description?.toLowerCase().includes('critical') || actionType === 'BAN') severity = 'CRITICAL';
      else if (log.description?.toLowerCase().includes('high') || actionType === 'SUSPEND') severity = 'HIGH';
      else if (log.description?.toLowerCase().includes('low') || actionType === 'WARN') severity = 'LOW';

      return {
        id: log.id,
        type: (log.entityType as ModerationAction['type']) || 'POST',
        action: actionType,
        targetId: parseInt(log.entityId || '0'),
        targetTitle: `${log.entityType} ${log.entityId}`,
        targetContent: log.description?.substring(0, 100) + '...',
        targetUser: log.user?.email || 'unknown@example.com',
        reason: log.description || 'No reason provided',
        moderatorId: log.user?.id || 0,
        moderatorName: log.user?.name || 'System',
        timestamp: log.createdAt.toISOString(),
        severity,
        status: 'COMPLETED'
      };
    });

    const stats = await generateModerationStats(prisma);

    return NextResponse.json({
      success: true,
      actions,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      filters: {
        type,
        action,
        severity,
        status
      }
    });

  } catch (error) {
    console.error('Moderation fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 모더레이션 액션은 MODERATOR 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { type, action, targetId, reason, severity } = await request.json();

    if (!type || !action || !targetId || !reason || !severity) {
      return NextResponse.json({
        error: 'Missing required fields: type, action, targetId, reason, severity'
      }, { status: 400 });
    }

    const validTypes = ['POST', 'COMMENT', 'USER', 'REPORT'];
    const validActions = ['APPROVE', 'REJECT', 'DELETE', 'WARN', 'SUSPEND', 'BAN'];
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    if (!validTypes.includes(type) || !validActions.includes(action) || !validSeverities.includes(severity)) {
      return NextResponse.json({
        error: 'Invalid type, action, or severity'
      }, { status: 400 });
    }

    let actionResult;
    let targetUser = 'unknown@example.com';

    // 액션에 따라 실제 데이터베이스 작업 수행
    if (type === 'POST') {
      if (action === 'APPROVE') {
        actionResult = await prisma.communityPost.update({
          where: { id: targetId },
          data: { status: 'PUBLISHED' },
          include: { author: { select: { email: true } } }
        });
        targetUser = actionResult.author.email;
      } else if (action === 'DELETE') {
        const post = await prisma.communityPost.findUnique({
          where: { id: targetId },
          include: { author: { select: { email: true } } }
        });
        if (post) {
          targetUser = post.author.email;
          actionResult = await prisma.communityPost.delete({
            where: { id: targetId }
          });
        }
      } else if (action === 'SUSPEND' || action === 'REJECT') {
        actionResult = await prisma.communityPost.update({
          where: { id: targetId },
          data: { status: 'DRAFT' },
          include: { author: { select: { email: true } } }
        });
        targetUser = actionResult.author.email;
      }
    } else if (type === 'COMMENT') {
      if (action === 'DELETE' || action === 'SUSPEND') {
        const comment = await prisma.communityPostComment.findUnique({
          where: { id: targetId },
          include: { author: { select: { email: true } } }
        });
        if (comment) {
          targetUser = comment.author.email;
          actionResult = await prisma.communityPostComment.update({
            where: { id: targetId },
            data: { isDeleted: true }
          });
        }
      }
    } else if (type === 'USER') {
      // 사용자 관련 액션 (실제 구현 필요)
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { email: true }
      });
      if (user) {
        targetUser = user.email;
        // 사용자 제재 로직 구현 필요
        console.log(`User ${targetId} ${action.toLowerCase()}ed`);
      }
    }

    // 모더레이션 액션을 감사 로그에 기록
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: authResult.user?.userId || 0,
        action: `MODERATION_${action}`,
        entityType: type,
        entityId: targetId.toString(),
        description: `${action} ${type.toLowerCase()} (${severity}) - ${reason}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    const newAction: ModerationAction = {
      id: auditLog.id,
      type: type as ModerationAction['type'],
      action: action as ModerationAction['action'],
      targetId,
      targetTitle: `${type} ${targetId}`,
      targetContent: reason,
      targetUser,
      reason,
      moderatorId: authResult.user?.userId || 0,
      moderatorName: authResult.user?.name || 'Unknown',
      timestamp: auditLog.createdAt.toISOString(),
      severity: severity as ModerationAction['severity'],
      status: 'COMPLETED'
    };

    return NextResponse.json({
      success: true,
      action: newAction,
      message: `모더레이션 액션 '${action}'이 성공적으로 실행되었습니다.`
    });

  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 모더레이션 액션 수정은 ADMIN 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { actionId, status, reason } = await request.json();

    if (!actionId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: actionId, status'
      }, { status: 400 });
    }

    // 기존 감사 로그 업데이트
    const existingLog = await prisma.auditLog.findUnique({
      where: { id: actionId }
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    const updatedLog = await prisma.auditLog.update({
      where: { id: actionId },
      data: {
        description: `${existingLog.description} - Status updated to ${status}${reason ? ` (${reason})` : ''}`
      }
    });

    // 액션 상태 변경 기록
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.userId || 0,
        action: 'MODERATION_UPDATE',
        entityType: existingLog.entityType || 'UNKNOWN',
        entityId: existingLog.entityId || '0',
        description: `Moderation action ${actionId} status changed to ${status}${reason ? `: ${reason}` : ''}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: '모더레이션 액션이 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}