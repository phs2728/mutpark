import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { PrismaClient } from '@prisma/client';

interface ContentItem {
  id: number;
  type: 'POST' | 'COMMENT';
  title?: string;
  content: string;
  author: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  category: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  createdAt: string;
  updatedAt: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    reports: number;
    shares: number;
  };
  tags: string[];
  moderationFlags: Array<{
    type: 'SPAM' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'HARASSMENT' | 'MISINFORMATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    reporter: string;
    timestamp: string;
  }>;
}

interface ContentStats {
  totalContent: number;
  activeContent: number;
  pendingReview: number;
  reportedContent: number;
  contentByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  contentByCategory: Array<{
    category: string;
    count: number;
    growth: number;
  }>;
  engagementMetrics: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
  };
  topContent: ContentItem[];
  recentActivity: Array<{
    action: string;
    content: string;
    user: string;
    timestamp: string;
  }>;
}

async function generateContentStats(prisma: PrismaClient): Promise<ContentStats> {
  try {
    // 커뮤니티 포스트 통계
    const [totalPosts, activePosts, pendingPosts] = await Promise.all([
      prisma.communityPost.count(),
      prisma.communityPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.communityPost.count({ where: { status: 'PENDING' } })
    ]);

    // 댓글 통계
    const [totalComments, activeComments] = await Promise.all([
      prisma.communityPostComment.count(),
      prisma.communityPostComment.count({ where: { isDeleted: false } })
    ]);

    const totalContent = totalPosts + totalComments;
    const activeContent = activePosts + activeComments;

    // 카테고리별 통계
    const categoryStats = await prisma.communityPost.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    const contentByCategory = categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count.id,
      growth: Math.random() * 20 - 5 // -5% ~ +15% 성장률 (실제로는 이전 기간과 비교)
    }));

    // 상위 포스트 (조회수 기준)
    const topPosts = await prisma.communityPost.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { views: 'desc' },
      take: 5
    });

    const topContent: ContentItem[] = topPosts.map(post => ({
      id: post.id,
      type: 'POST',
      title: post.title,
      content: post.content.substring(0, 100) + '...',
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email
      },
      category: post.category,
      status: post.status === 'PUBLISHED' ? 'ACTIVE' : 'PENDING',
      visibility: 'PUBLIC',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      metrics: {
        views: post.views,
        likes: post._count.likes,
        comments: post._count.comments,
        reports: 0, // 실제로는 신고 테이블에서 계산
        shares: 0   // 실제로는 공유 테이블에서 계산
      },
      tags: [],
      moderationFlags: []
    }));

    // 평균 지표 계산
    const totalViews = topPosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = topPosts.reduce((sum, post) => sum + post._count.likes, 0);
    const totalCommentsCount = topPosts.reduce((sum, post) => sum + post._count.comments, 0);

    return {
      totalContent,
      activeContent,
      pendingReview: pendingPosts,
      reportedContent: 0, // 실제로는 신고된 컨텐츠 수 계산
      contentByType: [
        {
          type: 'POST',
          count: totalPosts,
          percentage: Math.round((totalPosts / totalContent) * 100)
        },
        {
          type: 'COMMENT',
          count: totalComments,
          percentage: Math.round((totalComments / totalContent) * 100)
        }
      ],
      contentByCategory,
      engagementMetrics: {
        avgViews: topPosts.length ? Math.round(totalViews / topPosts.length) : 0,
        avgLikes: topPosts.length ? Math.round(totalLikes / topPosts.length) : 0,
        avgComments: topPosts.length ? Math.round(totalCommentsCount / topPosts.length) : 0,
        engagementRate: totalViews > 0 ? parseFloat(((totalLikes + totalCommentsCount) / totalViews * 100).toFixed(2)) : 0
      },
      topContent,
      recentActivity: [] // 실제로는 audit log에서 가져오기
    };
  } catch (error) {
    console.error('Error generating content stats:', error);
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

    // 커뮤니티 컨텐츠는 MODERATOR 이상만 조회 가능
    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const hasReports = searchParams.get('hasReports') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    // 통계만 요청된 경우
    if (statsOnly) {
      const stats = await generateContentStats(prisma);
      return NextResponse.json({
        success: true,
        stats
      });
    }

    // 필터 조건 구성
    let whereCondition: any = {};

    if (status) {
      if (status === 'ACTIVE') {
        whereCondition.status = 'PUBLISHED';
      } else if (status === 'PENDING') {
        whereCondition.status = 'PENDING';
      }
    }

    if (category) {
      whereCondition.category = category;
    }

    // 포스트와 댓글 조회
    let allContent: ContentItem[] = [];

    if (!type || type === 'POST') {
      const posts = await prisma.communityPost.findMany({
        where: whereCondition,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const postContent: ContentItem[] = posts.map(post => ({
        id: post.id,
        type: 'POST',
        title: post.title,
        content: post.content,
        author: {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email
        },
        category: post.category,
        status: post.status === 'PUBLISHED' ? 'ACTIVE' : post.status === 'PENDING' ? 'PENDING' : 'SUSPENDED',
        visibility: 'PUBLIC',
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        metrics: {
          views: post.views,
          likes: post._count.likes,
          comments: post._count.comments,
          reports: 0,
          shares: 0
        },
        tags: [],
        moderationFlags: []
      }));

      allContent = [...allContent, ...postContent];
    }

    if (!type || type === 'COMMENT') {
      const comments = await prisma.communityPostComment.findMany({
        where: {
          isDeleted: false,
          ...whereCondition
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          post: {
            select: { category: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: type === 'COMMENT' ? (page - 1) * limit : 0,
        take: type === 'COMMENT' ? limit : Math.floor(limit / 2)
      });

      const commentContent: ContentItem[] = comments.map(comment => ({
        id: comment.id,
        type: 'COMMENT',
        content: comment.content,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          email: comment.author.email
        },
        category: comment.post.category,
        status: 'ACTIVE',
        visibility: 'PUBLIC',
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        metrics: {
          views: 0,
          likes: 0,
          comments: 0,
          reports: 0,
          shares: 0
        },
        tags: [],
        moderationFlags: []
      }));

      allContent = [...allContent, ...commentContent];
    }

    // 시간순 정렬
    allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = await generateContentStats(prisma);
    const totalItems = type === 'POST' ? stats.contentByType.find(t => t.type === 'POST')?.count || 0 :
                      type === 'COMMENT' ? stats.contentByType.find(t => t.type === 'COMMENT')?.count || 0 :
                      stats.totalContent;

    return NextResponse.json({
      success: true,
      content: allContent,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit
      },
      filters: {
        type,
        status,
        category,
        hasReports
      }
    });

  } catch (error) {
    console.error('Community content fetch error:', error);
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

    // 컨텐츠 상태 변경은 MODERATOR 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { contentId, contentType, status, visibility, reason } = await request.json();

    if (!contentId || !contentType || !status) {
      return NextResponse.json({
        error: 'Missing required fields: contentId, contentType, status'
      }, { status: 400 });
    }

    const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      }, { status: 400 });
    }

    let updatedContent;

    if (contentType === 'POST') {
      const dbStatus = status === 'ACTIVE' ? 'PUBLISHED' :
                      status === 'PENDING' ? 'PENDING' :
                      status === 'SUSPENDED' ? 'DRAFT' : 'DRAFT';

      updatedContent = await prisma.communityPost.update({
        where: { id: contentId },
        data: {
          status: dbStatus,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
    } else if (contentType === 'COMMENT') {
      const isDeleted = status === 'DELETED' || status === 'SUSPENDED';

      updatedContent = await prisma.communityPostComment.update({
        where: { id: contentId },
        data: {
          isDeleted,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
    }

    // 감사 로그 생성
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.userId || 0,
        action: 'CONTENT_STATUS_CHANGE',
        entityType: contentType,
        entityId: contentId.toString(),
        description: `${contentType} status changed to ${status}${reason ? ': ' + reason : ''}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      content: updatedContent,
      message: '컨텐츠 상태가 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 컨텐츠 삭제는 ADMIN 이상만 가능
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contentId = parseInt(searchParams.get('contentId') || '0');
    const contentType = searchParams.get('contentType') || 'POST';

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    let deletedContent;

    if (contentType === 'POST') {
      deletedContent = await prisma.communityPost.delete({
        where: { id: contentId }
      });
    } else if (contentType === 'COMMENT') {
      deletedContent = await prisma.communityPostComment.delete({
        where: { id: contentId }
      });
    }

    // 감사 로그 생성
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.userId || 0,
        action: 'CONTENT_DELETE',
        entityType: contentType,
        entityId: contentId.toString(),
        description: `${contentType} permanently deleted`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: '컨텐츠가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}