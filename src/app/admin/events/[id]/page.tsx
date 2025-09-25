"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Flag,
  Hash,
  Gift,
  MapPin,
  Award,
  User,
  MessageSquare,
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

interface Participant {
  id: number;
  user: {
    name: string;
    email: string;
  };
  joinedAt: string;
  submissionCount: number;
  lastActivity: string;
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

export default function EventDetail() {
  const { permissions } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'submissions'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    // 모의 데이터 (실제로는 API에서 가져와야 함)
    const mockEvent: Event = {
      id: eventId,
      name: "추석 전통음식 챌린지",
      description: "집에서 만드는 추석 전통음식 레시피를 공유하고 따뜻한 마음을 나눠요. 전통 요리를 통해 한국 문화를 터키에서도 함께 즐겨보세요. 이번 챌린지는 단순히 요리를 만드는 것을 넘어서, 우리의 전통과 문화를 이어가는 의미 있는 시간이 될 것입니다.",
      type: "CHALLENGE",
      status: "ENDED",
      startDate: "2024-09-15T00:00:00Z",
      endDate: "2024-09-18T23:59:59Z",
      icon: "🥮",
      theme: "bg-gradient-to-br from-yellow-100 to-orange-100 border-orange-200",
      rewards: [
        "특별 배지: 전통음식 마스터",
        "한국 전통차 세트 (1등)",
        "커뮤니티 명예의 전당 등록",
        "한국 전통 그릇 세트 (2등)",
        "한국 조미료 선물세트 (3등)"
      ],
      participantCount: 127,
      featured: true,
      createdById: 1,
      createdBy: { name: "관리자" },
      createdAt: "2024-08-15T10:00:00Z",
      updatedAt: "2024-09-18T23:59:59Z",
      metadata: {
        hashtags: ["추석", "전통음식", "레시피", "한국문화", "터키"],
        difficulty: "중급",
        judging: "커뮤니티 투표 + 전문가 심사",
        season: "autumn",
        collaboration: "한국문화원 터키지부"
      }
    };

    const mockParticipants: Participant[] = [
      {
        id: 1,
        user: { name: "김터키", email: "kimturkey@example.com" },
        joinedAt: "2024-09-15T08:30:00Z",
        submissionCount: 3,
        lastActivity: "2024-09-18T20:15:00Z"
      },
      {
        id: 2,
        user: { name: "이스탄불김씨", email: "istanbulkim@example.com" },
        joinedAt: "2024-09-15T10:45:00Z",
        submissionCount: 2,
        lastActivity: "2024-09-18T18:30:00Z"
      },
      {
        id: 3,
        user: { name: "앙카라한국인", email: "ankarakorean@example.com" },
        joinedAt: "2024-09-15T14:20:00Z",
        submissionCount: 1,
        lastActivity: "2024-09-17T22:10:00Z"
      }
    ];

    setTimeout(() => {
      setEvent(mockEvent);
      setParticipants(mockParticipants);
      setLoading(false);
    }, 1000);
  }, [eventId]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">이벤트를 찾을 수 없습니다</h3>
          <p className="text-gray-600">요청하신 이벤트가 존재하지 않습니다.</p>
          <Link
            href="/admin/events"
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            이벤트 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = eventTypeConfig[event.type].icon;
  const StatusIcon = statusConfig[event.status].icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  const handleEdit = () => {
    router.push(`/admin/events/${event.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // 실제로는 API 호출

      setShowDeleteConfirm(false);
      router.push("/admin/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("이벤트 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/events"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">이벤트 상세정보</h1>
            <p className="text-gray-600">이벤트의 상세 정보와 참가자 현황을 확인하세요.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            편집
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </button>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="event-icon-display">
                {event.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                  {event.featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${eventTypeConfig[event.type].color}`}>
                    <TypeIcon className="h-4 w-4 mr-1" />
                    {eventTypeConfig[event.type].label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[event.status].color}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusConfig[event.status].label}
                  </span>
                </div>

                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">이벤트 기간</span>
                    </div>
                    <p className="text-gray-900">{formatDateRange(event.startDate, event.endDate)}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">참가자</span>
                    </div>
                    <p className="text-gray-900">
                      {event.participantCount}명
                      {event.maxParticipants && ` / ${event.maxParticipants}명`}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">생성자</span>
                    </div>
                    <p className="text-gray-900">{event.createdBy?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: MessageSquare },
            { id: 'participants', label: '참가자', icon: Users },
            { id: 'submissions', label: '제출물', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 h-4 w-4 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
                {tab.id === 'participants' && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {event.participantCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
            <div className="space-y-4">
              {event.metadata?.difficulty && (
                <div>
                  <span className="text-sm font-medium text-gray-700">난이도:</span>
                  <span className="ml-2 text-gray-900">{event.metadata.difficulty}</span>
                </div>
              )}
              {event.metadata?.judging && (
                <div>
                  <span className="text-sm font-medium text-gray-700">심사 방식:</span>
                  <span className="ml-2 text-gray-900">{event.metadata.judging}</span>
                </div>
              )}
              {event.metadata?.collaboration && (
                <div>
                  <span className="text-sm font-medium text-gray-700">협력 기관:</span>
                  <span className="ml-2 text-gray-900">{event.metadata.collaboration}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">생성일:</span>
                <span className="ml-2 text-gray-900">{formatDate(event.createdAt)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">수정일:</span>
                <span className="ml-2 text-gray-900">{formatDate(event.updatedAt)}</span>
              </div>
            </div>

            {event.metadata?.hashtags && (
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-700 mb-3 block">해시태그</span>
                <div className="flex flex-wrap gap-2">
                  {event.metadata.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">보상</h3>
            <div className="space-y-3">
              {event.rewards.map((reward, index) => (
                <div key={index} className="flex items-start">
                  <Gift className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-900 text-sm">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">참가자 목록</h3>
            <p className="text-sm text-gray-600 mt-1">총 {participants.length}명이 참가했습니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참가자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참가일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제출물
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 활동
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(participant.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.submissionCount}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(participant.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">제출물 관리</h3>
            <p className="text-gray-600">이벤트 제출물 관리 기능은 추후 구현 예정입니다.</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                  <span className="font-semibold">"{event.name}"</span> 이벤트를 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  이 작업은 되돌릴 수 없으며, 참가자 {event.participantCount}명의 데이터도 함께 삭제됩니다.
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                onClick={confirmDelete}
              >
                삭제하기
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={() => setShowDeleteConfirm(false)}
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