'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Trophy, Clock, Users } from 'lucide-react';

interface SeasonalEvent {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'challenge' | 'contest' | 'celebration' | 'promotion';
  icon: string;
  theme: string;
  rewards: string[];
  participantCount: number;
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'ended';
  featured: boolean;
}


function EventCard({ event }: { event: SeasonalEvent }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행 중';
      case 'upcoming': return '예정';
      case 'ended': return '종료';
      default: return '알 수 없음';
    }
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (event.status === 'upcoming') {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days}일 후 시작`;
    } else if (event.status === 'active') {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days}일 남음`;
    }
    return null;
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${event.theme} p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
      {/* 상태 배지 */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
          {getStatusText(event.status)}
        </span>
      </div>

      {/* 이벤트 헤더 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{event.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
        </div>
      </div>

      {/* 이벤트 정보 */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.startDate).toLocaleDateString('ko-KR')} - {new Date(event.endDate).toLocaleDateString('ko-KR')}</span>
        </div>

        {getDaysRemaining() && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{getDaysRemaining()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>참가자 {event.participantCount}명</span>
        </div>
      </div>

      {/* 보상 정보 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          보상
        </h4>
        <ul className="space-y-1">
          {event.rewards.map((reward, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              {reward}
            </li>
          ))}
        </ul>
      </div>

      {/* 참가 버튼 */}
      <div className="flex gap-2">
        {event.status === 'active' && (
          <button className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all">
            지금 참가하기
          </button>
        )}
        {event.status === 'upcoming' && (
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all">
            알림 설정
          </button>
        )}
        {event.status === 'ended' && (
          <button className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
            종료된 이벤트
          </button>
        )}
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
          자세히 보기
        </button>
      </div>
    </div>
  );
}

export default function SeasonalEvents() {
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(event =>
    filter === 'all' || event.status === filter
  );

  const activeEvents = events.filter(event => event.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">이벤트를 불러오는 중...</h3>
          <p className="text-gray-600">잠시만 기다려주세요!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-900 mb-2">이벤트를 불러올 수 없습니다</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          🎉 계절별 특별 이벤트
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          한국의 아름다운 전통과 계절감을 터키에서도 함께 느껴보세요.
          특별한 이벤트에 참여하고 소중한 추억과 보상을 받아가세요!
        </p>
      </div>

      {/* 활성 이벤트 하이라이트 */}
      {activeEvents.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            🔥 지금 진행 중인 이벤트 ({activeEvents.length}개)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex justify-center gap-2">
        {[
          { key: 'all', label: '전체' },
          { key: 'active', label: '진행 중' },
          { key: 'upcoming', label: '예정' },
          { key: 'ended', label: '종료' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'active' | 'upcoming' | 'ended')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === key
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 이벤트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">해당하는 이벤트가 없습니다</h3>
          <p className="text-gray-600">다른 필터를 선택해보세요!</p>
        </div>
      )}

      {/* 이벤트 제안 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 이벤트 아이디어가 있으신가요?
        </h3>
        <p className="text-blue-700 mb-4">
          커뮤니티에서 함께하고 싶은 특별한 이벤트나 챌린지를 제안해주세요!
        </p>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          이벤트 제안하기
        </button>
      </div>
    </div>
  );
}