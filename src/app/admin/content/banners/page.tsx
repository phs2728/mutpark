"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Filter,
  Download,
} from "lucide-react";
import BannerModal from "@/components/admin/BannerModal";
import { Banner, BANNER_STATUS_OPTIONS, BANNER_POSITION_OPTIONS } from "@/types/banner";

// Removed mock data - will fetch from API

const statusMap = Object.fromEntries(
  BANNER_STATUS_OPTIONS.map(option => [option.value, option])
);

const positionMap = Object.fromEntries(
  BANNER_POSITION_OPTIONS.map(option => [option.value, option])
);

const deviceTypes = {
  all: { label: '전체', icon: Monitor },
  desktop: { label: '데스크톱', icon: Monitor },
  mobile: { label: '모바일', icon: Smartphone },
  tablet: { label: '태블릿', icon: Tablet },
};

export default function AdminBanners() {
  const { permissions } = useAdminAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/banners", {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      setBanners(data.banners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Load banners on component mount
  useEffect(() => {
    if (permissions?.canManageContent) {
      fetchBanners();
    }
  }, [permissions]);

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (banner.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesPosition = filterPosition === "all" || banner.position === filterPosition;
    const matchesStatus = filterStatus === "all" || banner.status === filterStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const toggleBannerStatus = async (bannerId: number) => {
    try {
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;

      const newStatus = banner.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Banner status update failed:', response.status, errorData);
        throw new Error(`Failed to update banner status: ${response.status} - ${errorData}`);
      }

      // Update local state
      setBanners(prev => prev.map(banner =>
        banner.id === bannerId
          ? { ...banner, status: newStatus }
          : banner
      ));
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('배너 상태 변경에 실패했습니다.');
    }
  };

  const deleteBanner = async (bannerId: number) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }

      // Update local state
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('배너 삭제에 실패했습니다.');
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleBannerSave = async (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'viewCount' | 'clickCount'>) => {
    try {
      if (editingBanner) {
        // Edit existing banner
        const response = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(bannerData),
        });

        if (!response.ok) {
          throw new Error('Failed to update banner');
        }

        const result = await response.json();

        // Update local state
        setBanners(prev => prev.map(banner =>
          banner.id === editingBanner.id
            ? { ...banner, ...bannerData, updatedAt: new Date().toISOString() }
            : banner
        ));
      } else {
        // Add new banner
        const response = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(bannerData),
        });

        if (!response.ok) {
          throw new Error('Failed to create banner');
        }

        const result = await response.json();

        // Add to local state
        setBanners(prev => [...prev, result.banner]);
      }

      handleModalClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('배너 저장에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">콘텐츠 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">로딩 중...</h3>
          <p className="text-gray-600">배너 데이터를 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-16 w-16 text-red-400 mx-auto mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBanners}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
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
            웹사이트 배너를 관리하고 성과를 분석합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddBanner}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 배너 추가
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <Image className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{banners.length}</div>
              <div className="text-sm text-gray-600">총 배너</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {banners.filter(b => b.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">활성 배너</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {banners.reduce((sum, banner) => sum + banner.clickCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 클릭</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100 mr-3">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {calculateCTR(
                  banners.reduce((sum, banner) => sum + banner.clickCount, 0),
                  banners.reduce((sum, banner) => sum + banner.viewCount, 0)
                )}%
              </div>
              <div className="text-sm text-gray-600">평균 CTR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="제목 또는 설명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 위치</option>
              <option value="main">메인 배너</option>
              <option value="sidebar">사이드바</option>
              <option value="footer">푸터</option>
              <option value="popup">팝업</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="paused">일시정지</option>
              <option value="expired">만료</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {filteredBanners.length}개의 배너 (전체 {banners.length}개 중)
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-1" />
            성과 리포트 다운로드
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">배너 목록</h3>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="p-6 text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">배너가 없습니다</h3>
            <p className="text-gray-600 mb-4">새로운 배너를 추가해보세요.</p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 배너 추가
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              {filteredBanners.map((banner) => {
                const positionConfig = positionMap[banner.position];
                const statusConfig = statusMap[banner.status];
                const DeviceIcon = deviceTypes[banner.deviceType].icon;

                return (
                  <div
                    key={banner.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Banner Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{banner.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{banner.description}</p>

                            <div className="flex items-center space-x-4 mt-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${positionConfig.color}`}>
                                {positionConfig.label}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <DeviceIcon className="h-3 w-3 mr-1" />
                                {deviceTypes[banner.deviceType].label}
                              </div>
                            </div>

                            {banner.linkUrl && (
                              <div className="mt-2">
                                <a
                                  href={banner.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  {banner.linkUrl}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleBannerStatus(banner.id)}
                              className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                                banner.status === 'ACTIVE'
                                  ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                  : 'text-green-700 bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              {banner.status === 'ACTIVE' ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  일시정지
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  활성화
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEditBanner(banner)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              편집
                            </button>
                            <button
                              onClick={() => deleteBanner(banner.id)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {banner.clickCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">클릭 수</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {banner.viewCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">노출 수</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {calculateCTR(banner.clickCount, banner.viewCount)}%
                            </div>
                            <div className="text-xs text-gray-500">클릭률</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatDate(banner.updatedAt)}
                            </div>
                            <div className="text-xs text-gray-500">최종 수정</div>
                          </div>
                        </div>

                        {/* Schedule Info */}
                        {banner.startDate && banner.endDate && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-sm text-blue-700">
                              <Calendar className="h-4 w-4 mr-2" />
                              기간: {formatDate(banner.startDate)} ~ {formatDate(banner.endDate)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Banner Modal */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleBannerSave}
        banner={editingBanner}
        positions={BANNER_POSITION_OPTIONS}
      />
    </div>
  );
}