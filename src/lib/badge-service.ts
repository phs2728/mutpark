import { prisma } from './prisma';
import { BadgeType } from '@prisma/client';

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  COOKING_MASTER: {
    type: 'COOKING_MASTER',
    name: '요리 마스터',
    description: '10개 이상의 레시피를 공유한 요리 전문가',
    icon: '👨‍🍳',
    color: 'bg-orange-100 text-orange-700',
    criteria: '레시피 10개 이상 공유'
  },
  CULTURE_GUIDE: {
    type: 'CULTURE_GUIDE',
    name: '문화 가이드',
    description: '한국 문화에 대한 깊이 있는 꿀팁을 나누는 문화 전문가',
    icon: '🏮',
    color: 'bg-red-100 text-red-700',
    criteria: '문화 꿀팁 20개 이상 공유'
  },
  FRIENDLY_AMBASSADOR: {
    type: 'FRIENDLY_AMBASSADOR',
    name: '친화 대사',
    description: '따뜻한 댓글과 도움으로 커뮤니티를 이끄는 친화력 대표',
    icon: '🤝',
    color: 'bg-blue-100 text-blue-700',
    criteria: '도움되는 댓글 50개 이상 작성'
  },
  LOCAL_EXPERT: {
    type: 'LOCAL_EXPERT',
    name: '현지 전문가',
    description: '터키 현지 생활 정보를 풍부하게 공유하는 현지 생활 전문가',
    icon: '🗺️',
    color: 'bg-green-100 text-green-700',
    criteria: '현지 정보 질문에 답변 30회 이상'
  },
  FIRST_POST: {
    type: 'FIRST_POST',
    name: '첫 발걸음',
    description: '커뮤니티에 첫 게시물을 작성한 용기 있는 시작',
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-700',
    criteria: '첫 게시물 작성'
  },
  HELPFUL_REVIEWER: {
    type: 'HELPFUL_REVIEWER',
    name: '도움되는 리뷰어',
    description: '정직하고 도움되는 상품 리뷰로 다른 분들을 돕는 리뷰 전문가',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-700',
    criteria: '상품 리뷰 15개 이상 작성'
  },
  COMMUNITY_VETERAN: {
    type: 'COMMUNITY_VETERAN',
    name: '커뮤니티 베테랑',
    description: '6개월 이상 활발하게 활동한 커뮤니티의 소중한 멤버',
    icon: '🏆',
    color: 'bg-purple-100 text-purple-700',
    criteria: '6개월 이상 활동 + 게시물 50개 이상'
  }
};

export class BadgeService {
  // 배지 획득 조건 확인 및 부여
  static async checkAndAwardBadges(userId: number) {
    const badges: BadgeType[] = [];

    // 첫 게시물 배지
    if (await this.checkFirstPostBadge(userId)) {
      badges.push(BadgeType.FIRST_POST);
    }

    // 요리 마스터 배지
    if (await this.checkCookingMasterBadge(userId)) {
      badges.push(BadgeType.COOKING_MASTER);
    }

    // 문화 가이드 배지
    if (await this.checkCultureGuideBadge(userId)) {
      badges.push(BadgeType.CULTURE_GUIDE);
    }

    // 친화 대사 배지
    if (await this.checkFriendlyAmbassadorBadge(userId)) {
      badges.push(BadgeType.FRIENDLY_AMBASSADOR);
    }

    // 현지 전문가 배지
    if (await this.checkLocalExpertBadge(userId)) {
      badges.push(BadgeType.LOCAL_EXPERT);
    }

    // 도움되는 리뷰어 배지
    if (await this.checkHelpfulReviewerBadge(userId)) {
      badges.push(BadgeType.HELPFUL_REVIEWER);
    }

    // 커뮤니티 베테랑 배지
    if (await this.checkCommunityVeteranBadge(userId)) {
      badges.push(BadgeType.COMMUNITY_VETERAN);
    }

    // 새 배지 부여
    const newBadges: BadgeType[] = [];
    for (const badgeType of badges) {
      const awarded = await this.awardBadge(userId, badgeType);
      if (awarded) {
        newBadges.push(badgeType);
      }
    }

    return newBadges;
  }

  // 배지 부여
  static async awardBadge(userId: number, badgeType: BadgeType): Promise<boolean> {
    try {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeType,
          metadata: {
            awardedAt: new Date().toISOString(),
            reason: BADGE_DEFINITIONS[badgeType].criteria
          }
        }
      });
      return true;
    } catch {
      // 이미 존재하는 배지인 경우 무시
      console.log(`Badge ${badgeType} already exists for user ${userId}`);
      return false;
    }
  }

  // 사용자 배지 조회
  static async getUserBadges(userId: number) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    });

    return userBadges.map(badge => ({
      ...badge,
      definition: BADGE_DEFINITIONS[badge.badgeType]
    }));
  }

  // 배지 조건 확인 함수들
  private static async checkFirstPostBadge(userId: number): Promise<boolean> {
    const postCount = await prisma.communityPost.count({
      where: { authorId: userId, status: 'PUBLISHED' }
    });
    return postCount >= 1;
  }

  private static async checkCookingMasterBadge(userId: number): Promise<boolean> {
    const recipeCount = await prisma.communityPost.count({
      where: {
        authorId: userId,
        type: 'RECIPE',
        status: 'PUBLISHED'
      }
    });
    return recipeCount >= 10;
  }

  private static async checkCultureGuideBadge(userId: number): Promise<boolean> {
    const tipCount = await prisma.communityPost.count({
      where: {
        authorId: userId,
        type: 'TIP',
        status: 'PUBLISHED'
      }
    });
    return tipCount >= 20;
  }

  private static async checkFriendlyAmbassadorBadge(userId: number): Promise<boolean> {
    const commentCount = await prisma.communityPostComment.count({
      where: { userId }
    });
    return commentCount >= 50;
  }

  private static async checkLocalExpertBadge(userId: number): Promise<boolean> {
    const answerCount = await prisma.communityPostComment.count({
      where: {
        userId,
        post: {
          type: 'QUESTION'
        }
      }
    });
    return answerCount >= 30;
  }

  private static async checkHelpfulReviewerBadge(userId: number): Promise<boolean> {
    const reviewCount = await prisma.communityPost.count({
      where: {
        authorId: userId,
        type: 'REVIEW',
        status: 'PUBLISHED'
      }
    });
    return reviewCount >= 15;
  }

  private static async checkCommunityVeteranBadge(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });

    if (!user) return false;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const isOldEnough = user.createdAt < sixMonthsAgo;

    const postCount = await prisma.communityPost.count({
      where: { authorId: userId, status: 'PUBLISHED' }
    });

    return isOldEnough && postCount >= 50;
  }
}