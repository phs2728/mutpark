import { prisma } from './prisma';

export interface PopularityScore {
  postId: number;
  score: number;
  breakdown: {
    likesScore: number;
    commentsScore: number;
    viewsScore: number;
    recencyScore: number;
    engagementRate: number;
  };
}

export interface PopularPostsFilter {
  timeRange?: 'day' | 'week' | 'month' | 'all';
  postType?: 'recipe' | 'review' | 'tip' | 'question' | 'all';
  minScore?: number;
  limit?: number;
}

export class PopularPostsService {
  // 인기도 점수 계산 알고리즘
  static calculatePopularityScore(post: {
    id: number;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    publishedAt?: Date | null;
  }): PopularityScore {
    const now = new Date();
    const postDate = post.publishedAt || post.createdAt;
    const hoursAge = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    // 가중치
    const weights = {
      likes: 10,
      comments: 15, // 댓글이 더 높은 가중치
      recency: 5,
      engagement: 20
    };

    // 1. 좋아요 점수 (로그 스케일 적용)
    const likesScore = Math.log(post.likesCount + 1) * weights.likes;

    // 2. 댓글 점수 (로그 스케일 적용)
    const commentsScore = Math.log(post.commentsCount + 1) * weights.comments;

    // 3. 조회수 점수 (현재는 좋아요+댓글로 추정)
    const estimatedViews = (post.likesCount + post.commentsCount) * 10;
    const viewsScore = Math.log(estimatedViews + 1) * 2;

    // 4. 최신성 점수 (24시간 이내 높은 점수, 이후 감소)
    const recencyScore = Math.max(0, weights.recency * (1 - hoursAge / (24 * 7))); // 1주일 기준

    // 5. 참여율 점수
    const totalInteractions = post.likesCount + post.commentsCount;
    const engagementRate = totalInteractions > 0 ?
      (post.commentsCount / totalInteractions) : 0;
    const engagementScore = engagementRate * weights.engagement;

    // 최종 점수 계산
    const totalScore = likesScore + commentsScore + viewsScore + recencyScore + engagementScore;

    return {
      postId: post.id,
      score: Math.round(totalScore * 100) / 100,
      breakdown: {
        likesScore: Math.round(likesScore * 100) / 100,
        commentsScore: Math.round(commentsScore * 100) / 100,
        viewsScore: Math.round(viewsScore * 100) / 100,
        recencyScore: Math.round(recencyScore * 100) / 100,
        engagementRate: Math.round(engagementRate * 100) / 100
      }
    };
  }

  // 인기 게시물 가져오기
  static async getPopularPosts(filter: PopularPostsFilter = {}) {
    const {
      timeRange = 'week',
      postType = 'all',
      minScore = 0,
      limit = 20
    } = filter;

    // 시간 범위 설정
    let startDate: Date | undefined;
    const now = new Date();

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    // 게시물 타입 필터
    const typeFilter = postType === 'all' ? {} : { type: postType.toUpperCase() as 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION' };

    // 기본 게시물 조회
    const posts = await prisma.communityPost.findMany({
      where: {
        ...typeFilter,
        ...(startDate && {
          OR: [
            { publishedAt: { gte: startDate } },
            { createdAt: { gte: startDate } }
          ]
        })
      },
      include: {
        author: {
          select: { name: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    // 인기도 점수 계산 및 정렬
    const postsWithScores = posts.map(post => {
      const popularityScore = this.calculatePopularityScore({
        id: post.id,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt
      });

      return {
        ...post,
        popularityScore,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        bookmarksCount: post._count.bookmarks
      };
    })
    .filter(post => post.popularityScore.score >= minScore)
    .sort((a, b) => b.popularityScore.score - a.popularityScore.score)
    .slice(0, limit);

    return postsWithScores;
  }

  // 트렌딩 태그 가져오기
  static async getTrendingTags(timeRange: 'day' | 'week' | 'month' = 'week') {
    // 시간 범위 설정
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // startDate will be used when actual tag filtering is implemented
    console.log('Using date range from', startDate, 'for future implementation');

    // 현재는 태그 테이블이 없으므로 임시로 인기 키워드 반환
    const popularKeywords = [
      { tag: '김치', count: 45, trend: 'up' },
      { tag: '불고기', count: 38, trend: 'up' },
      { tag: '비빔밥', count: 32, trend: 'stable' },
      { tag: '한식', count: 28, trend: 'down' },
      { tag: '전통요리', count: 25, trend: 'up' },
      { tag: '터키한식', count: 22, trend: 'up' },
      { tag: '현지재료', count: 18, trend: 'stable' },
      { tag: '쉬운요리', count: 15, trend: 'up' }
    ];

    return popularKeywords;
  }

  // 추천 게시물 (사용자 기반)
  static async getRecommendedPosts(userId: number, limit: number = 10) {
    // 사용자의 과거 활동 기반 추천 (좋아요한 게시물 타입, 댓글 단 게시물 등)
    const userActivity = await prisma.communityPostLike.findMany({
      where: { userId: userId },
      include: {
        post: {
          select: { type: true }
        }
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    // 선호하는 게시물 타입 분석
    const typePreferences = userActivity.reduce((acc, like) => {
      const type = like.post.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredTypes = Object.entries(typePreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    // 선호 타입의 인기 게시물 가져오기
    if (preferredTypes.length > 0) {
      return this.getPopularPosts({
        timeRange: 'week',
        limit,
        minScore: 5
      });
    }

    // 활동이 없는 경우 전체 인기 게시물 반환
    return this.getPopularPosts({
      timeRange: 'week',
      limit,
      minScore: 10
    });
  }

  // 실시간 급상승 게시물
  static async getTrendingPosts(limit: number = 5) {
    // 최근 6시간 내 급격히 인기가 오른 게시물
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const recentPosts = await prisma.communityPost.findMany({
      where: {
        OR: [
          { publishedAt: { gte: sixHoursAgo } },
          { createdAt: { gte: sixHoursAgo } }
        ]
      },
      include: {
        author: {
          select: { name: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    // 최근 활동 대비 높은 점수의 게시물 필터링
    const trendingPosts = recentPosts
      .map(post => {
        const popularityScore = this.calculatePopularityScore({
          id: post.id,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          createdAt: post.createdAt,
          publishedAt: post.publishedAt
        });

        return {
          ...post,
          popularityScore,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          bookmarksCount: post._count.bookmarks
        };
      })
      .filter(post => post.popularityScore.score > 15) // 높은 점수만
      .sort((a, b) => b.popularityScore.score - a.popularityScore.score)
      .slice(0, limit);

    return trendingPosts;
  }

  // 베스트 댓글 선별
  static async getBestComments(postId: number, limit: number = 3) {
    const comments = await prisma.communityPostComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    // 댓글 점수 계산 (좋아요 + 답글 수 + 길이 + 작성자 신뢰도)
    const commentsWithScores = comments.map((comment: typeof comments[0]) => {
      const likesScore = comment._count.likes * 10;
      const repliesScore = comment._count.replies * 5;

      // 댓글 길이 점수 (너무 짧거나 너무 긴 댓글 제외)
      const contentLength = comment.content.length;
      const lengthScore = contentLength >= 20 && contentLength <= 500 ?
        Math.min(contentLength / 10, 20) : 0;

      // 최신성 점수
      const hoursAge = (Date.now() - comment.createdAt.getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 10 - hoursAge / 24);

      const totalScore = likesScore + repliesScore + lengthScore + recencyScore;

      return {
        ...comment,
        score: totalScore,
        likesCount: comment._count.likes,
        repliesCount: comment._count.replies
      };
    });

    return commentsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 개인화된 피드 추천
  static async getPersonalizedFeed(userId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    // 사용자의 관심사 분석
    const userPreferences = await this.analyzeUserPreferences(userId);

    // 기본 인기 게시물
    let posts = await this.getPopularPosts({
      timeRange: 'week',
      limit: limit * 2 // 필터링을 위해 더 많이 가져옴
    });

    // 사용자 선호도에 따른 점수 조정
    posts = posts.map(post => {
      let adjustedScore = post.popularityScore.score;

      // 선호 타입 보너스
      if (userPreferences.preferredTypes.includes(post.type)) {
        adjustedScore *= 1.5;
      }

      // 팔로우한 작성자 보너스 (구현 시)
      // if (userPreferences.followedAuthors.includes(post.authorId)) {
      //   adjustedScore *= 1.3;
      // }

      return {
        ...post,
        personalizedScore: adjustedScore
      };
    });

    return posts
      .sort((a, b) => ((a as unknown) as { personalizedScore: number }).personalizedScore < ((b as unknown) as { personalizedScore: number }).personalizedScore ? 1 : -1)
      .slice(offset, offset + limit);
  }

  // 사용자 선호도 분석
  private static async analyzeUserPreferences(userId: number) {
    // 최근 좋아요한 게시물 분석
    const recentLikes = await prisma.communityPostLike.findMany({
      where: { userId },
      include: {
        post: {
          select: { type: true, authorId: true }
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    // 타입 선호도 분석
    const typeCount = recentLikes.reduce((acc, like) => {
      const type = like.post.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // 선호 작성자 분석
    const authorCount = recentLikes.reduce((acc, like) => {
      const authorId = like.post.authorId;
      acc[authorId] = (acc[authorId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const preferredAuthors = Object.entries(authorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([authorId]) => parseInt(authorId));

    return {
      preferredTypes,
      preferredAuthors,
      totalInteractions: recentLikes.length
    };
  }
}