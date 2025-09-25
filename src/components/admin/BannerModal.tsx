"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Link as LinkIcon, Image as ImageIcon, Save, AlertCircle } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Banner, BANNER_STATUS_OPTIONS } from "@/types/banner";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: Banner) => void;
  banner?: Banner | null;
  positions: Array<{ value: string; label: string }>;
}


export default function BannerModal({
  isOpen,
  onClose,
  onSave,
  banner,
  positions
}: BannerModalProps) {
  const [formData, setFormData] = useState<Banner>({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    position: "HEADER",
    priority: 0,
    startDate: "",
    endDate: "",
    status: "DRAFT"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : "",
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        position: "HEADER",
        priority: 0,
        startDate: "",
        endDate: "",
        status: "DRAFT"
      });
    }
    setErrors({});
  }, [banner, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "이미지를 업로드해주세요";
    }

    if (!formData.position) {
      newErrors.position = "배너 위치를 선택해주세요";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = "종료일은 시작일보다 나중이어야 합니다";
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
      const bannerData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      onSave(bannerData);
    } catch (error) {
      console.error("Banner save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (images: string[]) => {
    if (images.length > 0) {
      setFormData({ ...formData, imageUrl: images[0] });
      if (errors.imageUrl) {
        setErrors({ ...errors, imageUrl: "" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {banner ? "배너 수정" : "새 배너 생성"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-300" : "border-gray-300"
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="배너에 대한 설명을 입력하세요"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 *
            </label>
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

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Position and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.position ? "border-red-300" : "border-gray-300"
                }`}
              >
                {positions.map((position) => (
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Banner["status"] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BANNER_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? "border-red-300" : "border-gray-300"
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

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <input
              type="number"
              min="0"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              낮은 숫자일수록 먼저 표시됩니다
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {banner ? "수정" : "생성"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}