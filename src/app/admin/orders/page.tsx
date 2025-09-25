"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MoreHorizontal,
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  currency: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  address: {
    recipientName: string;
    city: string;
    district: string;
    street: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    product: {
      id: number;
      baseName: string;
      imageUrl?: string;
    };
  }>;
  payment?: {
    provider: string;
    status: string;
  };
}

const statusConfig = {
  PENDING: { label: "대기중", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  AWAITING_PAYMENT: { label: "결제대기", color: "bg-orange-100 text-orange-800", icon: Clock },
  PAID: { label: "결제완료", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  PROCESSING: { label: "처리중", color: "bg-purple-100 text-purple-800", icon: Package },
  SHIPPED: { label: "배송중", color: "bg-orange-100 text-orange-800", icon: Truck },
  DELIVERED: { label: "배송완료", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "취소됨", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function AdminOrders() {
  const { permissions } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const ordersPerPage = 20;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ordersPerPage.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setTotalOrders(data.pagination.total);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleOrderClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleOrderUpdate = (updatedOrder: any) => {
    setOrders(orders.map(order =>
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleSelectOrder = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;

    try {
      setBulkUpdating(true);
      const response = await fetch("/api/admin/orders/bulk-update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: bulkStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update orders");
      }

      // 목록 새로고침
      await fetchOrders();
      setSelectedOrders(new Set());
      setIsBulkUpdateOpen(false);
      setBulkStatus("");
    } catch (error) {
      console.error("Error updating orders:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  if (!permissions?.canManageOrders) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">주문 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ordersPerPage;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {totalOrders}개의 주문이 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedOrders.size > 0 && (
            <button
              onClick={() => setIsBulkUpdateOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              선택한 {selectedOrders.size}개 주문 처리
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="주문번호, 고객명, 이메일로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="PENDING">대기중</option>
              <option value="AWAITING_PAYMENT">결제대기</option>
              <option value="PAID">결제완료</option>
              <option value="PROCESSING">처리중</option>
              <option value="SHIPPED">배송중</option>
              <option value="DELIVERED">배송완료</option>
              <option value="CANCELLED">취소됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrders.size === orders.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문일시
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length}개 상품
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(Number(order.totalAmount), order.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.payment?.provider || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOrderClick(order.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="주문 상세 보기"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + ordersPerPage, totalOrders)} / {totalOrders}개 표시
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
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderId(null);
        }}
        onOrderUpdate={handleOrderUpdate}
      />

      {/* Bulk Update Modal */}
      {isBulkUpdateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              일괄 상태 변경
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              선택한 {selectedOrders.size}개 주문의 상태를 변경합니다.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변경할 상태
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">상태 선택</option>
                <option value="PENDING">대기중</option>
                <option value="AWAITING_PAYMENT">결제대기</option>
                <option value="PAID">결제완료</option>
                <option value="PROCESSING">처리중</option>
                <option value="SHIPPED">배송중</option>
                <option value="DELIVERED">배송완료</option>
                <option value="CANCELLED">취소됨</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || bulkUpdating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkUpdating ? "처리중..." : "변경"}
              </button>
              <button
                onClick={() => {
                  setIsBulkUpdateOpen(false);
                  setBulkStatus("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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