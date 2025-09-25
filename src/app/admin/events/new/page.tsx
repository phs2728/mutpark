"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface EventFormData {
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

export default function NewEvent() {
  const { permissions } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    type: "CHALLENGE",
    startDate: "",
    endDate: "",
    icon: "🍳",
    maxParticipants: undefined,
    featured: false,
    rewards: [""],
    hashtags: [""],
    difficulty: "",
    judging: "",
    season: "",
    collaboration: "",
  });

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

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: 'rewards' | 'hashtags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const handleArrayRemove = (field: 'rewards' | 'hashtags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (field: 'rewards' | 'hashtags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API 호출 시뮬레이션 (실제로는 API 엔드포인트 구현 필요)
      await new Promise(resolve => setTimeout(resolve, 1000));


      // 성공 시 이벤트 목록 페이지로 리다이렉트
      router.push("/admin/events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("이벤트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.description && formData.startDate && formData.endDate;

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
          <h1 className="text-2xl font-bold text-gray-900">새 이벤트 생성</h1>
          <p className="text-gray-600">커뮤니티 이벤트를 만들어 참여를 유도하세요.</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="예: 추석 전통음식 챌린지"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이벤트 설명 *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="이벤트에 대한 자세한 설명을 입력하세요..."
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 *
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
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
            disabled={!isFormValid || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                생성 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                이벤트 생성
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}