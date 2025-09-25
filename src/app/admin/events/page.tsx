"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";

interface Event {
  id: number;
  name: string;
  description: string;
  type: "CHALLENGE" | "CONTEST" | "CELEBRATION";
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  startDate: string;
  endDate: string;
  icon: string;
  theme: string;
  rewards: string[];
  participantCount: number;
  maxParticipants?: number;
  featured: boolean;
  createdById: number;
  createdBy?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  metadata?: {
    hashtags?: string[];
    difficulty?: string;
    judging?: string;
    season?: string;
    collaboration?: string;
  };
}

const eventTypeConfig = {
  CHALLENGE: { label: "챌린지", color: "bg-blue-100 text-blue-800", icon: Trophy },
  CONTEST: { label: "콘테스트", color: "bg-purple-100 text-purple-800", icon: Star },
  CELEBRATION: { label: "축제", color: "bg-green-100 text-green-800", icon: Calendar },
};

const statusConfig = {
  UPCOMING: { label: "예정", color: "bg-gray-100 text-gray-800", icon: Clock },
  ACTIVE: { label: "진행중", color: "bg-green-100 text-green-800", icon: Play },
  ENDED: { label: "종료", color: "bg-red-100 text-red-800", icon: CheckCircle },
};

export default function AdminEvents() {
  const { permissions } = useAdminAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // 모의 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 1,
        name: "추석 전통음식 챌린지",
        description: "집에서 만드는 추석 전통음식 레시피를 공유하고 따뜻한 마음을 나눠요. 전통 요리를 통해 한국 문화를 터키에서도 함께 즐겨보세요.",
        type: "CHALLENGE",
        status: "ENDED",
        startDate: "2024-09-15T00:00:00Z",
        endDate: "2024-09-18T23:59:59Z",
        icon: "🥮",
        theme: "bg-gradient-to-br from-yellow-100 to-orange-100 border-orange-200",
        rewards: [
          "특별 배지: 전통음식 마스터",
          "한국 전통차 세트",
          "커뮤니티 명예의 전당"
        ],
        participantCount: 127,
        featured: true,
        createdById: 1,
        createdBy: { name: "관리자" },
        createdAt: "2024-08-15T10:00:00Z",
        updatedAt: "2024-09-18T23:59:59Z",
        metadata: {
          hashtags: ["추석", "전통음식", "레시피"],
          difficulty: "중급"
        }
      },
      {
        id: 2,
        name: "김장철 대회",
        description: "터키에서도 맛있는 김치 담그기! 나만의 김치 레시피와 노하우를 공유해주세요. 겨울을 준비하는 한국의 전통을 함께 나누어요.",
        type: "CONTEST",
        status: "ACTIVE",
        startDate: "2024-11-20T00:00:00Z",
        endDate: "2024-12-10T23:59:59Z",
        icon: "🥬",
        theme: "bg-gradient-to-br from-green-100 to-red-100 border-green-200",
        rewards: [
          "우승자: 한국식품 패키지",
          "특별 배지: 김치 마스터",
          "김치냉장고 할인 쿠폰"
        ],
        participantCount: 89,
        maxParticipants: 200,
        featured: true,
        createdById: 1,
        createdBy: { name: "관리자" },
        createdAt: "2024-11-01T10:00:00Z",
        updatedAt: "2024-11-25T14:30:00Z",
        metadata: {
          hashtags: ["김장", "김치", "겨울준비"],
          judging: "커뮤니티 투표"
        }
      },
      {
        id: 3,
        name: "설날 떡국 축제",
        description: "새해를 맞이하여 전통 떡국과 함께하는 축제입니다. 각자의 특별한 떡국 레시피를 공유하고 새해 복을 나누어요.",
        type: "CELEBRATION",
        status: "UPCOMING",
        startDate: "2025-01-28T00:00:00Z",
        endDate: "2025-02-02T23:59:59Z",
        icon: "🍜",
        theme: "bg-gradient-to-br from-red-100 to-pink-100 border-red-200",
        rewards: [
          "새해 복 배지",
          "전통 떡 선물세트",
          "한국 전통 그릇 세트"
        ],
        participantCount: 0,
        featured: true,
        createdById: 1,
        createdBy: { name: "관리자" },
        createdAt: "2024-12-01T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
        metadata: {
          hashtags: ["설날", "떡국", "새해"],
        }
      },
      {
        id: 4,
        name: "봄맞이 나물반찬 특집",
        description: "봄철 건강한 나물반찬으로 가족 건강을 챙겨보세요. 제철 재료를 활용한 다양한 나물 요리법을 공유합니다.",
        type: "CHALLENGE",
        status: "UPCOMING",
        startDate: "2025-03-15T00:00:00Z",
        endDate: "2025-04-15T23:59:59Z",
        icon: "🌱",
        theme: "bg-gradient-to-br from-green-100 to-yellow-100 border-green-200",
        rewards: [
          "건강 요리사 배지",
          "유기농 재료 할인 쿠폰",
          "나물 요리 도구 세트"
        ],
        participantCount: 0,
        maxParticipants: 150,
        featured: false,
        createdById: 1,
        createdBy: { name: "관리자" },
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-01-15T10:00:00Z",
        metadata: {
          hashtags: ["봄", "나물", "건강"],
          season: "spring"
        }
      },
      {
        id: 5,
        name: "터키 현지재료 활용 대회",
        description: "터키에서 구할 수 있는 현지 재료로 한국 요리를 만들어보는 창의적인 대회입니다. 로컬 푸드로 K-푸드를 재해석해보세요!",
        type: "CONTEST",
        status: "UPCOMING",
        startDate: "2025-05-01T00:00:00Z",
        endDate: "2025-05-31T23:59:59Z",
        icon: "🇹🇷",
        theme: "bg-gradient-to-br from-blue-100 to-red-100 border-blue-200",
        rewards: [
          "크리에이티브 셰프 배지",
          "터키-한국 요리 도구 세트",
          "현지 식재료 탐방 투어"
        ],
        participantCount: 0,
        maxParticipants: 100,
        featured: false,
        createdById: 1,
        createdBy: { name: "관리자" },
        createdAt: "2025-01-10T10:00:00Z",
        updatedAt: "2025-01-10T10:00:00Z",
        metadata: {
          hashtags: ["터키", "현지재료", "창의"],
          collaboration: "터키-한국 문화교류"
        }
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  if (!permissions?.canManageEvents) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">이벤트 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || event.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || event.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const displayedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`;
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysUntilEvent = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return "오늘 시작";
    if (diffDays === 1) return "내일 시작";
    return `${diffDays}일 후 시작`;
  };

  const handleViewEvent = (eventId: number) => {
    router.push(`/admin/events/${eventId}`);
  };

  const handleEditEvent = (eventId: number) => {
    router.push(`/admin/events/${eventId}/edit`);
  };

  const handleDeleteEvent = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      // 실제로는 API 호출을 해야 함

      // 모의 삭제 (로컬 상태에서 제거)
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));

      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("이벤트 삭제 중 오류가 발생했습니다.");
    }
  };

  const cancelDeleteEvent = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {filteredEvents.length}개의 이벤트가 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/admin/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            이벤트 생성
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">진행중 이벤트</p>
              <p className="text-lg font-bold text-gray-900">
                {events.filter(e => e.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">예정 이벤트</p>
              <p className="text-lg font-bold text-gray-900">
                {events.filter(e => e.status === "UPCOMING").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 참가자</p>
              <p className="text-lg font-bold text-gray-900">
                {events.reduce((sum, e) => sum + e.participantCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">추천 이벤트</p>
              <p className="text-lg font-bold text-gray-900">
                {events.filter(e => e.featured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이벤트명, 설명으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">전체 유형</option>
              <option value="CHALLENGE">챌린지</option>
              <option value="CONTEST">콘테스트</option>
              <option value="CELEBRATION">축제</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="UPCOMING">예정</option>
              <option value="ACTIVE">진행중</option>
              <option value="ENDED">종료</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        {displayedEvents.map((event) => {
          const TypeIcon = eventTypeConfig[event.type].icon;
          const StatusIcon = statusConfig[event.status].icon;
          const daysUntil = getDaysUntilEvent(event.startDate);

          return (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="event-icon-display">
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.name}
                        </h3>
                        {event.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventTypeConfig[event.type].color}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {eventTypeConfig[event.type].label}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[event.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[event.status].label}
                        </span>
                        {daysUntil && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {daysUntil}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">기간:</span>
                          <p className="text-gray-600">
                            {formatDateRange(event.startDate, event.endDate)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">참가자:</span>
                          <p className="text-gray-600">
                            {event.participantCount}명
                            {event.maxParticipants && ` / ${event.maxParticipants}명`}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">생성자:</span>
                          <p className="text-gray-600">{event.createdBy?.name}</p>
                        </div>
                      </div>

                      {event.metadata?.hashtags && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {event.metadata.hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewEvent(event.id);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer border border-transparent hover:border-blue-200 rounded-md"
                      title="이벤트 보기"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors cursor-pointer border border-transparent hover:border-green-200 rounded-md"
                      title="이벤트 편집"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200 rounded-md"
                      title="이벤트 삭제"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {event.rewards.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">보상:</span>
                    <div className="space-y-1">
                      {event.rewards.slice(0, 2).map((reward, index) => (
                        <p key={index} className="text-sm text-gray-600">• {reward}</p>
                      ))}
                      {event.rewards.length > 2 && (
                        <p className="text-sm text-gray-500">외 {event.rewards.length - 2}개</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(startIndex + eventsPerPage, filteredEvents.length)} / {filteredEvents.length}개 표시
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                이벤트 삭제 확인
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">"{eventToDelete.name}"</span> 이벤트를 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  이 작업은 되돌릴 수 없으며, 참가자 {eventToDelete.participantCount}명의 데이터도 함께 삭제됩니다.
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                onClick={confirmDeleteEvent}
              >
                삭제하기
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={cancelDeleteEvent}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}