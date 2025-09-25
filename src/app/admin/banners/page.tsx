"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Users,
  BarChart3,
} from "lucide-react";
import BannerModal from "@/components/admin/BannerModal";
import { Banner, BANNER_STATUS_OPTIONS, BANNER_POSITION_OPTIONS } from "@/types/banner";

const BANNER_POSITIONS = BANNER_POSITION_OPTIONS.map(option => ({
  ...option,
  icon: getPositionIcon(option.value),
  description: getPositionDescription(option.value)
}));

function getPositionIcon(position: string) {
  switch(position) {
    case "HEADER": return "📋";
    case "HERO": return "🎯";
    case "SIDEBAR": return "📑";
    case "FOOTER": return "📄";
    case "MODAL": return "💬";
    case "FLOATING": return "🎈";
    default: return "📋";
  }
}

function getPositionDescription(position: string) {
  switch(position) {
    case "HEADER": return "페이지 상단 헤더 영역";
    case "HERO": return "메인 페이지 대형 배너";
    case "SIDEBAR": return "페이지 우측 사이드바";
    case "FOOTER": return "페이지 하단 영역";
    case "MODAL": return "팝업 모달 창";
    case "FLOATING": return "떠다니는 배너";
    default: return "배너 위치";
  }
}

const STATUS_CONFIG = Object.fromEntries(
  BANNER_STATUS_OPTIONS.map(option => [option.value, option])
);

export default function AdminBanners() {
  const { permissions } = useAdminAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [draggedBanner, setDraggedBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBanners();
  }, [selectedPosition, selectedStatus]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPosition !== "ALL") params.append("position", selectedPosition);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);

      const response = await fetch(`/api/admin/banners?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      setBanners(data.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, banner: Banner) => {
    setDraggedBanner(banner);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetPosition: string) => {
    e.preventDefault();

    if (!draggedBanner || draggedBanner.position === targetPosition) {
      setDraggedBanner(null);
      return;
    }

    try {
      // Get the next order number for the target position
      const bannersInTarget = getBannersByPosition(targetPosition);
      const newOrder = bannersInTarget.length;

      const response = await fetch("/api/admin/banners/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bannerId: draggedBanner.id,
          newPosition: targetPosition,
          newOrder: newOrder,
        }),
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Error updating banner position:", error);
    } finally {
      setDraggedBanner(null);
    }
  };

  const toggleBannerStatus = async (bannerId: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Error updating banner status:", error);
    }
  };

  const deleteBanner = async (bannerId: number) => {
    if (!confirm("배너를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const calculateCTR = (views: number, clicks: number) => {
    return views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";
  };

  const getBannersByPosition = (position: string) => {
    return banners
      .filter(banner => banner.position === position)
      .sort((a, b) => a.order - b.order);
  };

  const handleSaveBanner = async (bannerData: Partial<Banner>) => {
    try {
      if (editingBanner) {
        // Update existing banner
        const response = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bannerData),
        });

        if (response.ok) {
          fetchBanners();
          setEditingBanner(null);
        }
      } else {
        // Create new banner
        const response = await fetch("/api/admin/banners", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bannerData),
        });

        if (response.ok) {
          fetchBanners();
          setShowCreateModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">배너 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">배너 관리</h1>
          <p className="mt-2 text-gray-600">
            웹사이트 배너를 위치별로 관리하고 성과를 추적하세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 배너 추가
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위치별 필터
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">전체 위치</option>
              {BANNER_POSITIONS.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.icon} {position.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태별 필터
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="PAUSED">일시정지</option>
              <option value="DRAFT">초안</option>
              <option value="EXPIRED">만료됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner Positions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {BANNER_POSITIONS.map((position) => (
          <div
            key={position.value}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, position.value)}
          >
            {/* Position Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {position.icon} {position.label}
                  </h3>
                  <p className="text-sm text-gray-600">{position.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {getBannersByPosition(position.value).length}개
                </div>
              </div>
            </div>

            {/* Banners List */}
            <div className="p-4 space-y-3 min-h-[200px]">
              {getBannersByPosition(position.value).length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">배너가 없습니다</p>
                  </div>
                </div>
              ) : (
                getBannersByPosition(position.value).map((banner, index) => (
                  <div
                    key={banner.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, banner)}
                    className="bg-gray-50 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Banner Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </div>

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {banner.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${STATUS_CONFIG[banner.status].color}`}>
                            {STATUS_CONFIG[banner.status].label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {banner.viewCount.toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {calculateCTR(banner.viewCount, banner.clickCount)}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            순서: {banner.order}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            {banner.startDate && banner.endDate
                              ? `${formatDate(banner.startDate)} ~ ${formatDate(banner.endDate)}`
                              : "날짜 미설정"
                            }
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => toggleBannerStatus(banner.id, banner.status)}
                              className="text-gray-400 hover:text-gray-600"
                              title={banner.status === "ACTIVE" ? "일시정지" : "활성화"}
                            >
                              {banner.status === "ACTIVE" ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingBanner(banner)}
                              className="text-gray-400 hover:text-blue-600"
                              title="편집"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteBanner(banner.id)}
                              className="text-gray-400 hover:text-red-600"
                              title="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 요약</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {banners.length}
            </div>
            <div className="text-sm text-gray-600">총 배너 수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {banners.filter(b => b.status === "ACTIVE").length}
            </div>
            <div className="text-sm text-gray-600">활성 배너</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {banners.reduce((sum, b) => sum + b.viewCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">총 노출 수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {calculateCTR(
                banners.reduce((sum, b) => sum + b.viewCount, 0),
                banners.reduce((sum, b) => sum + b.clickCount, 0)
              )}%
            </div>
            <div className="text-sm text-gray-600">평균 CTR</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 사용 팁</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 배너를 드래그하여 다른 위치로 이동할 수 있습니다</li>
          <li>• 같은 위치의 배너들은 우선순위에 따라 정렬됩니다</li>
          <li>• 활성/일시정지 버튼으로 배너를 즉시 제어할 수 있습니다</li>
          <li>• CTR(클릭률)을 확인하여 배너 성과를 모니터링하세요</li>
        </ul>
      </div>

      {/* Create Banner Modal */}
      <BannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveBanner}
        positions={BANNER_POSITIONS}
      />

      {/* Edit Banner Modal */}
      <BannerModal
        isOpen={!!editingBanner}
        onClose={() => setEditingBanner(null)}
        onSave={handleSaveBanner}
        banner={editingBanner}
        positions={BANNER_POSITIONS}
      />
    </div>
  );
}