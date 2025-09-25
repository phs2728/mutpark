"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface BannerFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: 'HEADER' | 'HERO' | 'SIDEBAR' | 'FOOTER' | 'MODAL' | 'FLOATING';
  priority: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  deviceType: 'all' | 'desktop' | 'mobile' | 'tablet';
  targetAudience: 'all' | 'customers' | 'guests';
  locale: string;
}

const BANNER_POSITIONS = [
  { value: 'HEADER', label: '헤더', color: 'bg-blue-100 text-blue-800' },
  { value: 'HERO', label: '메인 배너', color: 'bg-purple-100 text-purple-800' },
  { value: 'SIDEBAR', label: '사이드바', color: 'bg-green-100 text-green-800' },
  { value: 'FOOTER', label: '푸터', color: 'bg-gray-100 text-gray-800' },
  { value: 'MODAL', label: '모달/팝업', color: 'bg-orange-100 text-orange-800' },
  { value: 'FLOATING', label: '플로팅', color: 'bg-red-100 text-red-800' },
];

const BANNER_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '임시보관' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
];

const DEVICE_TYPES = [
  { value: 'all', label: '모든 기기' },
  { value: 'desktop', label: '데스크톱' },
  { value: 'mobile', label: '모바일' },
  { value: 'tablet', label: '태블릿' },
];

const TARGET_AUDIENCES = [
  { value: 'all', label: '모든 사용자' },
  { value: 'customers', label: '회원' },
  { value: 'guests', label: '비회원' },
];

const LOCALES = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export default function NewBanner() {
  const { permissions } = useAdminAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'HERO',
    priority: 0,
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    deviceType: 'all',
    targetAudience: 'all',
    locale: 'tr',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = '이미지를 업로드해주세요';
    }

    if (!formData.position) {
      newErrors.position = '배너 위치를 선택해주세요';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = '종료일은 시작일보다 나중이어야 합니다';
      }
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

      // Redirect to banners list
      router.push('/admin/content/banners');
    } catch (error) {
      console.error('Error saving banner:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    if (images.length > 0) {
      setFormData(prev => ({ ...prev, imageUrl: images[0] }));
      if (errors.imageUrl) {
        setErrors(prev => ({ ...prev, imageUrl: '' }));
      }
    }
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
            <h1 className="text-2xl font-bold text-gray-900">새 배너 만들기</h1>
            <p className="text-gray-600">새로운 배너를 작성하고 발행하세요.</p>
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
                placeholder="배너 제목을 입력하세요"
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
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="배너에 대한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                링크 URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이미지 *</h3>

          <ImageUpload
            images={formData.imageUrl ? [formData.imageUrl] : []}
            onImagesChange={handleImageChange}
            maxImages={1}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            className="mb-2"
          />
          {errors.imageUrl && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.imageUrl}
            </p>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as BannerFormData['position'] }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.position ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {BANNER_POSITIONS.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.position}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BannerFormData['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BANNER_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기기 유형
              </label>
              <select
                value={formData.deviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, deviceType: e.target.value as BannerFormData['deviceType'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as BannerFormData['targetAudience'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TARGET_AUDIENCES.map((audience) => (
                  <option key={audience.value} value={audience.value}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                언어
              </label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LOCALES.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.flag} {locale.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우선순위
              </label>
              <input
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                낮은 숫자일수록 먼저 표시됩니다
              </p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
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
                배너 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}