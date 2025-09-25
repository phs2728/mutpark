"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Check,
  X,
  Clock,
  AlertTriangle,
  Building2,
  User,
} from "lucide-react";
import InvoiceModal from "@/components/admin/InvoiceModal";

interface TaxInvoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  status: "PENDING" | "ISSUED" | "CANCELLED" | "FAILED";
  tckn?: string;
  vkn?: string;
  taxOffice?: string;
  companyName?: string;
  companyAddress: string;
  customerName: string;
  customerAddress: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  issuedAt?: string;
  cancelledAt?: string;
  order: {
    id: number;
    orderNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
}

const STATUS_CONFIG = {
  PENDING: { label: "대기중", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  ISSUED: { label: "발행됨", color: "bg-green-100 text-green-800", icon: Check },
  CANCELLED: { label: "취소됨", color: "bg-red-100 text-red-800", icon: X },
  FAILED: { label: "실패", color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function AdminInvoices() {
  const { permissions } = useAdminAuth();
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<TaxInvoice | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, [selectedStatus, pagination.page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/admin/invoices?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm("세금계산서를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleSaveInvoice = async (invoiceData: any) => {
    try {
      if (editingInvoice) {
        // Update existing invoice
        const response = await fetch(`/api/admin/invoices/${editingInvoice.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(invoiceData),
        });

        if (response.ok) {
          fetchInvoices();
          setEditingInvoice(null);
        }
      } else {
        // Create new invoice
        const response = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(invoiceData),
        });

        if (response.ok) {
          fetchInvoices();
          setShowCreateModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!permissions?.canManageFinance) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">세금계산서 관리 권한이 필요합니다.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">세금계산서 관리</h1>
          <p className="mt-2 text-gray-600">
            터키 세법에 따른 세금계산서를 관리하고 발행하세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 세금계산서
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
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
              <option value="ISSUED">발행됨</option>
              <option value="CANCELLED">취소됨</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
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
                placeholder="계산서 번호, 고객명, 주문번호로 검색..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계산서 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  세무 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = STATUS_CONFIG[invoice.status].icon;
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          주문: {invoice.order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-400">
                          생성: {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.order.user.email}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-48">
                          {invoice.customerAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {invoice.tckn && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-3 w-3 mr-1" />
                            TCKN: {invoice.tckn}
                          </div>
                        )}
                        {invoice.vkn && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 className="h-3 w-3 mr-1" />
                            VKN: {invoice.vkn}
                          </div>
                        )}
                        {invoice.taxOffice && (
                          <div className="text-xs text-gray-500">
                            {invoice.taxOffice}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          세전: {formatCurrency(invoice.subtotalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          세액: {formatCurrency(invoice.taxAmount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[invoice.status].color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {STATUS_CONFIG[invoice.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {invoice.status === "PENDING" && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, "ISSUED")}
                            className="text-green-600 hover:text-green-900"
                            title="발행"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {invoice.status === "ISSUED" && (
                          <button
                            onClick={() => updateInvoiceStatus(invoice.id, "CANCELLED")}
                            className="text-red-600 hover:text-red-900"
                            title="취소"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="다운로드"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(invoice.status === "PENDING" || invoice.status === "FAILED") && (
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">세금계산서가 없습니다</h3>
            <p className="text-gray-500">첫 번째 세금계산서를 생성해보세요.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 계산서</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">발행됨</p>
              <p className="text-2xl font-semibold text-gray-900">
                {invoices.filter(i => i.status === "ISSUED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">대기중</p>
              <p className="text-2xl font-semibold text-gray-900">
                {invoices.filter(i => i.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 text-purple-600 font-bold text-lg">₺</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 세액</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(invoices.reduce((sum, i) => sum + i.taxAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <InvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveInvoice}
      />

      {/* Edit Invoice Modal */}
      <InvoiceModal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSave={handleSaveInvoice}
        invoice={editingInvoice}
      />
    </div>
  );
}