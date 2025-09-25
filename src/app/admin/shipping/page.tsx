"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  MapPin,
  Clock,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface ShippingProvider {
  id: number;
  name: string;
  code: string;
  logo?: string;
  website?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  supportsCOD: boolean;
  supportsTracking: boolean;
  baseRate: number;
  weightRate?: number;
  testMode: boolean;
  stats: {
    totalShipments: number;
    delivered: number;
    inTransit: number;
    failed: number;
  };
}

interface ShippingTracking {
  id: number;
  trackingNumber: string;
  status: "PENDING" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "RETURNED";
  currentLocation?: string;
  estimatedDelivery?: string;
  lastChecked: string;
  events: any[];
  order: {
    id: number;
    orderNumber: string;
    customer: {
      name: string;
      email: string;
    };
  };
  provider: {
    id: number;
    name: string;
    code: string;
    logo?: string;
  };
}

const STATUS_CONFIG = {
  PENDING: { label: "대기중", color: "bg-gray-100 text-gray-800", icon: Clock },
  IN_TRANSIT: { label: "배송중", color: "bg-blue-100 text-blue-800", icon: Truck },
  OUT_FOR_DELIVERY: { label: "배송출발", color: "bg-yellow-100 text-yellow-800", icon: Package },
  DELIVERED: { label: "배송완료", color: "bg-green-100 text-green-800", icon: Check },
  FAILED: { label: "배송실패", color: "bg-red-100 text-red-800", icon: X },
  RETURNED: { label: "반송", color: "bg-red-100 text-red-800", icon: ArrowRight },
};

export default function AdminShipping() {
  const { permissions } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"providers" | "tracking">("tracking");
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [trackings, setTrackings] = useState<ShippingTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "providers") {
      fetchProviders();
    } else {
      fetchTrackings();
    }
  }, [activeTab, selectedStatus, selectedProvider]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/shipping/providers", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }

      const data = await response.json();
      setProviders(data.providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (selectedProvider !== "ALL") params.append("providerId", selectedProvider);

      const response = await fetch(`/api/admin/shipping/tracking?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trackings");
      }

      const data = await response.json();
      setTrackings(data.trackings);
    } catch (error) {
      console.error("Error fetching trackings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (trackingNumber: string) => {
    try {
      setUpdating(trackingNumber);
      const response = await fetch(`/api/admin/shipping/tracking/${trackingNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ forceUpdate: true }),
      });

      if (response.ok) {
        fetchTrackings();
      }
    } catch (error) {
      console.error("Error updating tracking:", error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const filteredTrackings = trackings.filter((tracking) =>
    tracking.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tracking.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tracking.order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!permissions?.canManageOrders) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">배송 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">배송 관리</h1>
          <p className="mt-2 text-gray-600">
            배송 업체와 추적 정보를 관리하세요.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tracking"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            배송 추적
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "providers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Truck className="h-4 w-4 inline mr-2" />
            배송 업체
          </button>
        </nav>
      </div>

      {activeTab === "tracking" && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검색
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="운송장 번호, 주문번호, 고객명으로 검색..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                  <option value="PENDING">대기중</option>
                  <option value="IN_TRANSIT">배송중</option>
                  <option value="OUT_FOR_DELIVERY">배송출발</option>
                  <option value="DELIVERED">배송완료</option>
                  <option value="FAILED">배송실패</option>
                  <option value="RETURNED">반송</option>
                </select>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  업체별 필터
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">전체 업체</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id.toString()}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tracking Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      운송장 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      배송 업체
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      위치
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrackings.map((tracking) => {
                    const StatusIcon = STATUS_CONFIG[tracking.status].icon;
                    return (
                      <tr key={tracking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tracking.trackingNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              마지막 확인: {formatDate(tracking.lastChecked)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tracking.order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tracking.order.customer.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {tracking.provider.logo && (
                              <img
                                src={tracking.provider.logo}
                                alt={tracking.provider.name}
                                className="w-8 h-8 rounded mr-2"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tracking.provider.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {tracking.provider.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[tracking.status].color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[tracking.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            {tracking.currentLocation ? (
                              <>
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                {tracking.currentLocation}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateTracking(tracking.trackingNumber)}
                              disabled={updating === tracking.trackingNumber}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="추적 정보 업데이트"
                            >
                              <RefreshCw className={`h-4 w-4 ${updating === tracking.trackingNumber ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="상세 보기"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTrackings.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">배송 추적 정보가 없습니다</h3>
                <p className="text-gray-500">검색 조건을 변경해보세요.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "providers" && (
        <>
          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {provider.logo && (
                      <img
                        src={provider.logo}
                        alt={provider.name}
                        className="w-10 h-10 rounded mr-3"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-500">{provider.code}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {provider.status === "ACTIVE" ? "활성" : "비활성"}
                  </span>
                </div>

                {/* Provider Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {provider.stats.totalShipments}
                    </div>
                    <div className="text-sm text-gray-600">총 배송</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {provider.stats.delivered}
                    </div>
                    <div className="text-sm text-gray-600">완료</div>
                  </div>
                </div>

                {/* Provider Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>기본 요금</span>
                    <span className="font-medium">{formatCurrency(provider.baseRate)}</span>
                  </div>
                  {provider.weightRate && (
                    <div className="flex items-center justify-between text-sm">
                      <span>중량 요금</span>
                      <span className="font-medium">{formatCurrency(provider.weightRate)}/kg</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>착불 지원</span>
                    <span className={provider.supportsCOD ? "text-green-600" : "text-gray-400"}>
                      {provider.supportsCOD ? "지원" : "미지원"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>추적 지원</span>
                    <span className={provider.supportsTracking ? "text-green-600" : "text-gray-400"}>
                      {provider.supportsTracking ? "지원" : "미지원"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <Edit className="h-4 w-4 inline mr-1" />
                    편집
                  </button>
                  {provider.website && (
                    <button
                      onClick={() => window.open(provider.website, '_blank')}
                      className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      웹사이트
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {providers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">배송 업체가 없습니다</h3>
              <p className="text-gray-500">첫 번째 배송 업체를 추가해보세요.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}