"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Calendar,
  Trophy,
  Star,
  Users,
  Gift,
  Hash,
  ArrowLeft,
  Save,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";

interface EventFormData {
  id: number;
  name: string;
  description: string;
  type: "CHALLENGE" | "CONTEST" | "CELEBRATION";
  startDate: string;
  endDate: string;
  icon: string;
  maxParticipants?: number;
  featured: boolean;
  rewards: string[];
  hashtags: string[];
  difficulty?: string;
  judging?: string;
  season?: string;
  collaboration?: string;
}

const eventTypeOptions = [
  { value: "CHALLENGE", label: "챌린지", icon: Trophy, description: "참가자들이 도전하는 이벤트" },
  { value: "CONTEST", label: "콘테스트", icon: Star, description: "경쟁을 통한 우승자 선발" },
  { value: "CELEBRATION", label: "축제", icon: Calendar, description: "함께 즐기는 축제 이벤트" },
];

const iconOptions = [
  "🍳", "🥮", "🥬", "🍜", "🌱", "🇹🇷", "🇰🇷", "🍲", "🥟", "🍱",
  "🍙", "🍘", "🥡", "🍛", "🍝", "🥗", "🍕", "🍔", "🌮", "🥪"
];

export default function EditEvent() {
  const { permissions } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!eventId) return;

    // 모의 데이터 로딩 (실제로는 API에서 가져와야 함)
    const mockEventData: EventFormData = {
      id: eventId,
      name: "추석 전통음식 챌린지",
      description: "집에서 만드는 추석 전통음식 레시피를 공유하고 따뜻한 마음을 나눠요. 전통 요리를 통해 한국 문화를 터키에서도 함께 즐겨보세요.",
      type: "CHALLENGE",
      startDate: "2024-09-15T00:00",
      endDate: "2024-09-18T23:59",
      icon: "🥮",
      maxParticipants: 200,
      featured: true,
      rewards: [
        "특별 배지: 전통음식 마스터",
        "한국 전통차 세트",
        "커뮤니티 명예의 전당"
      ],
      hashtags: ["추석", "전통음식", "레시피"],
      difficulty: "중급",
      judging: "커뮤니티 투표 + 전문가 심사",
      season: "autumn",
      collaboration: "한국문화원 터키지부"
    };

    setTimeout(() => {
      setFormData(mockEventData);
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
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">이벤트를 찾을 수 없습니다</h3>
          <p className="text-gray-600">요청하신 이벤트가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayAdd = (field: 'rewards' | 'hashtags') => {
    setFormData(prev => prev ? {
      ...prev,
      [field]: [...prev[field], ""]
    } : null);
  };

  const handleArrayRemove = (field: 'rewards' | 'hashtags', index: number) => {
    setFormData(prev => prev ? {
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    } : null);
  };

  const handleArrayChange = (field: 'rewards' | 'hashtags', index: number, value: string) => {
    setFormData(prev => prev ? {
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    } : null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이벤트명은 필수입니다.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '이벤트 설명은 필수입니다.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작일은 필수입니다.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료일은 필수입니다.';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = '종료일은 시작일보다 늦어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // API 호출 시뮬레이션 (실제로는 API 엔드포인트 구현 필요)
      await new Promise(resolve => setTimeout(resolve, 1500));


      // 성공 시 상세 페이지로 리다이렉트
      router.push(`/admin/events/${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("이벤트 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이벤트 편집</h1>
          <p className="text-gray-600">이벤트 정보를 수정하세요.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이벤트명 *
              </label>
              <input
                type="text"
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="예: 추석 전통음식 챌린지"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이벤트 설명 *
              </label>
              <textarea
                required
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="이벤트에 대한 자세한 설명을 입력하세요..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이벤트 유형 *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value as EventFormData["type"])}
              >
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이벤트 아이콘
              </label>
              <div className="grid grid-cols-10 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`event-icon-selector p-3 border rounded-md hover:bg-gray-50 transition-colors ${
                      formData.icon === icon ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                    onClick={() => handleInputChange("icon", icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                선택된 아이콘: <span className="emoji text-xl">{formData.icon}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 *
              </label>
              <input
                type="datetime-local"
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 *
              </label>
              <input
                type="datetime-local"
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 참가자 수
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.maxParticipants || ""}
                onChange={(e) => handleInputChange("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="제한 없음"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                추천 이벤트로 설정
              </label>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">보상</h2>
            <button
              type="button"
              onClick={() => handleArrayAdd("rewards")}
              className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              보상 추가
            </button>
          </div>

          <div className="space-y-3">
            {formData.rewards.map((reward, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Gift className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={reward}
                  onChange={(e) => handleArrayChange("rewards", index, e.target.value)}
                  placeholder="예: 특별 배지: 전통음식 마스터"
                />
                {formData.rewards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("rewards", index)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.difficulty || ""}
                onChange={(e) => handleInputChange("difficulty", e.target.value)}
              >
                <option value="">선택 안함</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                심사 방식
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.judging || ""}
                onChange={(e) => handleInputChange("judging", e.target.value)}
                placeholder="예: 커뮤니티 투표, 전문가 심사"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시즌
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.season || ""}
                onChange={(e) => handleInputChange("season", e.target.value)}
                placeholder="예: spring, summer, fall, winter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                협력 기관
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.collaboration || ""}
                onChange={(e) => handleInputChange("collaboration", e.target.value)}
                placeholder="예: 터키-한국 문화교류"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                해시태그
              </label>
              <button
                type="button"
                onClick={() => handleArrayAdd("hashtags")}
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                태그 추가
              </button>
            </div>

            <div className="space-y-3">
              {formData.hashtags.map((hashtag, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={hashtag}
                    onChange={(e) => handleArrayChange("hashtags", index, e.target.value)}
                    placeholder="예: 추석, 전통음식, 레시피"
                  />
                  {formData.hashtags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("hashtags", index)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                변경사항 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}