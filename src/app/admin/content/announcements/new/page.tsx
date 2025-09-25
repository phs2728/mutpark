"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Megaphone,
  AlertCircle,
  Calendar,
  Users,
  Globe,
  Bell,
} from "lucide-react";

interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'event' | 'update' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'published' | 'draft' | 'scheduled';
  targetAudience: 'all' | 'customers' | 'sellers' | 'admins';
  languages: string[];
  startDate: string;
  endDate: string;
  showOnHomepage: boolean;
  sendEmail: boolean;
  sendPush: boolean;
}

const announcementTypes = {
  general: { label: '일반 공지', color: 'bg-blue-100 text-blue-800', icon: Megaphone },
  maintenance: { label: '시스템 점검', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  event: { label: '이벤트', color: 'bg-green-100 text-green-800', icon: Calendar },
  update: { label: '업데이트', color: 'bg-purple-100 text-purple-800', icon: Bell },
  urgent: { label: '긴급 공지', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const priorities = {
  low: { label: '낮음', color: 'bg-gray-100 text-gray-800' },
  medium: { label: '보통', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: '높음', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: '긴급', color: 'bg-red-100 text-red-800' },
};

const targetAudiences = {
  all: { label: '모든 사용자', icon: Globe },
  customers: { label: '고객', icon: Users },
  sellers: { label: '판매자', icon: Users },
  admins: { label: '관리자', icon: Users },
};

const languages = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export default function NewAnnouncement() {
  const { permissions } = useAdminAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    status: 'draft',
    targetAudience: 'all',
    languages: ['ko'],
    startDate: '',
    endDate: '',
    showOnHomepage: false,
    sendEmail: false,
    sendPush: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = '종료일은 시작일보다 나중이어야 합니다';
      }
    }

    if (formData.languages.length === 0) {
      newErrors.languages = '최소 하나의 언어를 선택해주세요';
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
      // Here you would normally save to your backend

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to announcements list
      router.push('/admin/content/announcements');
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(lang => lang !== language)
      }));
    }
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">콘텐츠 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">새 공지사항 작성</h1>
            <p className="text-gray-600">새로운 공지사항을 작성하고 발행하세요.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            미리보기
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="공지사항 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="공지사항 내용을 입력하세요. Markdown 문법을 사용할 수 있습니다."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.content}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공지 유형
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AnnouncementFormData['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(announcementTypes).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우선순위
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as AnnouncementFormData['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(priorities).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 사용자
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as AnnouncementFormData['targetAudience'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(targetAudiences).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                발행 상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AnnouncementFormData['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">임시보관</option>
                <option value="published">즉시 발행</option>
                <option value="scheduled">예약 발행</option>
              </select>
            </div>
          </div>

          {/* Languages */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어 *
            </label>
            <div className="space-y-2">
              {languages.map((language) => (
                <label key={language.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language.value)}
                    onChange={(e) => handleLanguageChange(language.value, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {language.flag} {language.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.languages && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.languages}
              </p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일시
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일시
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 옵션</h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showOnHomepage}
                onChange={(e) => setFormData(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">홈페이지에 표시</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">이메일 알림 전송</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sendPush}
                onChange={(e) => setFormData(prev => ({ ...prev, sendPush: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">푸시 알림 전송</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                공지사항 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}