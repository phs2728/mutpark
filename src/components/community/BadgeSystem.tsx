'use client';

import { useState, useEffect } from 'react';
import { BADGE_DEFINITIONS, BadgeDefinition } from '@/lib/badge-service';
import { BadgeType } from '@prisma/client';

interface UserBadge {
  id: number;
  badgeType: BadgeType;
  earnedAt: string;
  metadata?: any;
  definition: BadgeDefinition;
}

interface BadgeSystemProps {
  userId: number;
}

export function BadgeDisplay({ badge }: { badge: UserBadge }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${badge.definition.color} border`}>
      <span className="text-lg">{badge.definition.icon}</span>
      <span>{badge.definition.name}</span>
    </div>
  );
}

export function BadgeTooltip({ badge }: { badge: UserBadge }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{badge.definition.icon}</span>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{badge.definition.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(badge.earnedAt).toLocaleDateString('ko-KR')} 획득
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        {badge.definition.description}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        달성 조건: {badge.definition.criteria}
      </p>
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: UserBadge[] }) {
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-gray-600 dark:text-gray-400">아직 획득한 배지가 없습니다</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          커뮤니티에 참여해서 배지를 모아보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        획득한 배지 ({badges.length}개)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setSelectedBadge(badge)}
            onMouseLeave={() => setSelectedBadge(null)}
          >
            <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${badge.definition.color} border-current`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{badge.definition.icon}</span>
                <div>
                  <h4 className="font-semibold">{badge.definition.name}</h4>
                  <p className="text-xs opacity-75">
                    {new Date(badge.earnedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            {selectedBadge?.id === badge.id && (
              <div className="absolute top-full left-0 mt-2 z-10">
                <BadgeTooltip badge={badge} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BadgeProgress() {
  const allBadges = Object.values(BADGE_DEFINITIONS);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        배지 도감
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allBadges.map((badge) => (
          <div
            key={badge.type}
            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl grayscale">{badge.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{badge.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {badge.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  달성 조건: {badge.criteria}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BadgeSystem({ userId }: BadgeSystemProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/badges`);
      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/users/${userId}/badges`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.newBadges.length > 0) {
          // 새 배지 알림 표시
          alert(data.message);
          await fetchBadges(); // 배지 목록 새로고침
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">배지 시스템</h2>
        <button
          onClick={checkForNewBadges}
          disabled={checking}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm"
        >
          {checking ? '확인 중...' : '새 배지 확인'}
        </button>
      </div>

      <BadgeGrid badges={badges} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <BadgeProgress />
      </div>
    </div>
  );
}