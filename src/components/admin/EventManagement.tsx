'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Trophy, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Event {
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

interface EventFormData {
  name: string;
  description: string;
  type: 'challenge' | 'contest' | 'celebration' | 'promotion';
  startDate: string;
  endDate: string;
  icon: string;
  theme: string;
  rewards: string[];
  maxParticipants?: number;
  featured: boolean;
}

const EVENT_TYPES = [
  { value: 'challenge', label: '챌린지', icon: '🏆' },
  { value: 'contest', label: '대회', icon: '🎯' },
  { value: 'celebration', label: '축제', icon: '🎉' },
  { value: 'promotion', label: '프로모션', icon: '🎁' }
];

const THEME_OPTIONS = [
  'bg-gradient-to-br from-yellow-100 to-orange-100 border-orange-200',
  'bg-gradient-to-br from-green-100 to-red-100 border-green-200',
  'bg-gradient-to-br from-red-100 to-pink-100 border-red-200',
  'bg-gradient-to-br from-pink-100 to-green-100 border-pink-200',
  'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200',
  'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200'
];

function EventForm({
  event,
  onSave,
  onCancel
}: {
  event?: Event;
  onSave: (data: EventFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    description: event?.description || '',
    type: event?.type || 'challenge',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    icon: event?.icon || '🎉',
    theme: event?.theme || THEME_OPTIONS[0],
    rewards: event?.rewards || [''],
    maxParticipants: event?.maxParticipants,
    featured: event?.featured || false
  });

  const handleRewardChange = (index: number, value: string) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = value;
    setFormData({ ...formData, rewards: newRewards });
  };

  const addReward = () => {
    setFormData({ ...formData, rewards: [...formData.rewards, ''] });
  };

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    setFormData({ ...formData, rewards: newRewards });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedRewards = formData.rewards.filter(reward => reward.trim() !== '');
    onSave({ ...formData, rewards: cleanedRewards });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? '이벤트 수정' : '새 이벤트 생성'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이벤트 이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'challenge' | 'contest' | 'celebration' | 'promotion' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎉"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테마</label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((theme, index) => (
                <label key={index} className="cursor-pointer">
                  <input
                    type="radio"
                    value={theme}
                    checked={formData.theme === theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 ${theme} ${formData.theme === theme ? 'ring-2 ring-red-500' : ''}`}>
                    테마 {index + 1}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">보상 목록</label>
            {formData.rewards.map((reward, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={reward}
                  onChange={(e) => handleRewardChange(index, e.target.value)}
                  placeholder="보상 내용"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeReward(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReward}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              + 보상 추가
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최대 참가자 수 (선택사항)</label>
            <input
              type="number"
              value={formData.maxParticipants || ''}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
              추천 이벤트로 설정
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {event ? '수정' : '생성'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete }: { event: Event; onEdit: () => void; onDelete: () => void; }) {
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

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${event.theme} p-6`}>
      {event.featured && (
        <div className="absolute top-2 left-2">
          <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
            추천
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
          {getStatusText(event.status)}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-4 mt-6">
        <div className="text-4xl">{event.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.startDate).toLocaleDateString('ko-KR')} - {new Date(event.endDate).toLocaleDateString('ko-KR')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>참가자 {event.participantCount}명 {event.maxParticipants && `/ ${event.maxParticipants}명`}</span>
        </div>
      </div>

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

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          수정
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
      </div>
    </div>
  );
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

  const handleSaveEvent = async (formData: EventFormData) => {
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdById: 1, // Admin user ID from seed data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      setShowForm(false);
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('정말 이 이벤트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="text-gray-600 mt-2">커뮤니티 이벤트를 생성하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          새 이벤트 생성
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="text-red-900 font-medium">오류 발생</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => {
              setEditingEvent(event);
              setShowForm(true);
            }}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 이벤트가 없습니다</h3>
          <p className="text-gray-600 mb-4">첫 번째 이벤트를 생성해보세요!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            이벤트 생성하기
          </button>
        </div>
      )}

      {showForm && (
        <EventForm
          event={editingEvent || undefined}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}