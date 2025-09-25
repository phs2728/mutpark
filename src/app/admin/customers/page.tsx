"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  MapPin,
  X,
} from "lucide-react";

interface Customer {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  locale: string;
  currency: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  addresses: {
    city: string;
    country: string;
  }[];
  socialAccounts: {
    provider: string;
  }[];
}

const statusConfig = {
  ACTIVE: { label: "활성", color: "bg-green-100 text-green-800", icon: CheckCircle },
  INACTIVE: { label: "비활성", color: "bg-gray-100 text-gray-800", icon: Ban },
  SUSPENDED: { label: "정지", color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function AdminCustomers() {
  const { permissions } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [localeFilter, setLocaleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const customersPerPage = 20;

  // 모의 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: 1,
        email: "kim.miyoung@email.com",
        name: "김미영",
        phone: "+90 532 123 4567",
        role: "CUSTOMER",
        locale: "ko",
        currency: "TRY",
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: "2025-01-21T08:30:00Z",
        createdAt: "2024-12-15T10:00:00Z",
        orderCount: 12,
        totalSpent: 1247.50,
        addresses: [{ city: "İstanbul", country: "TR" }],
        socialAccounts: [{ provider: "GOOGLE" }],
      },
      {
        id: 2,
        email: "park.sera@email.com",
        name: "박세라",
        phone: "+90 533 987 6543",
        role: "CUSTOMER",
        locale: "ko",
        currency: "TRY",
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: "2025-01-20T15:45:00Z",
        createdAt: "2024-11-20T14:30:00Z",
        orderCount: 8,
        totalSpent: 892.30,
        addresses: [{ city: "Ankara", country: "TR" }],
        socialAccounts: [],
      },
      {
        id: 3,
        email: "ahmet.yilmaz@email.com",
        name: "Ahmet Yılmaz",
        phone: "+90 534 555 1234",
        role: "CUSTOMER",
        locale: "tr",
        currency: "TRY",
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: "2025-01-19T12:20:00Z",
        createdAt: "2024-10-05T09:15:00Z",
        orderCount: 15,
        totalSpent: 2134.75,
        addresses: [{ city: "İzmir", country: "TR" }],
        socialAccounts: [{ provider: "GOOGLE" }],
      },
      {
        id: 4,
        email: "lee.hyunsu@email.com",
        name: "이현수",
        phone: "+90 535 777 8888",
        role: "CUSTOMER",
        locale: "ko",
        currency: "TRY",
        isEmailVerified: false,
        isActive: true,
        lastLoginAt: "2025-01-18T20:10:00Z",
        createdAt: "2024-12-01T16:45:00Z",
        orderCount: 3,
        totalSpent: 345.20,
        addresses: [{ city: "Bursa", country: "TR" }],
        socialAccounts: [],
      },
      {
        id: 5,
        email: "fatma.demir@email.com",
        name: "Fatma Demir",
        phone: "+90 536 999 0000",
        role: "CUSTOMER",
        locale: "tr",
        currency: "TRY",
        isEmailVerified: true,
        isActive: false,
        lastLoginAt: "2024-12-20T11:30:00Z",
        createdAt: "2024-09-15T13:20:00Z",
        orderCount: 6,
        totalSpent: 678.90,
        addresses: [{ city: "Antalya", country: "TR" }],
        socialAccounts: [{ provider: "GOOGLE" }],
      },
    ];

    // 더 많은 모의 데이터 생성
    const additionalCustomers = Array.from({ length: 45 }, (_, i) => ({
      id: i + 6,
      email: `customer${i + 1}@email.com`,
      name: `고객 ${i + 1}`,
      phone: `+90 53${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      role: "CUSTOMER",
      locale: Math.random() > 0.6 ? "ko" : "tr",
      currency: "TRY",
      isEmailVerified: Math.random() > 0.2,
      isActive: Math.random() > 0.1,
      lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      orderCount: Math.floor(Math.random() * 20),
      totalSpent: Math.floor(Math.random() * 3000),
      addresses: [{ city: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"][Math.floor(Math.random() * 5)], country: "TR" }],
      socialAccounts: Math.random() > 0.5 ? [{ provider: "GOOGLE" }] : [],
    }));

    setTimeout(() => {
      setCustomers([...mockCustomers, ...additionalCustomers]);
      setLoading(false);
    }, 1000);
  }, []);

  if (!permissions?.canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">고객 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));

    const matchesStatus = statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && customer.isActive) ||
      (statusFilter === "INACTIVE" && !customer.isActive);

    const matchesLocale = localeFilter === "ALL" || customer.locale === localeFilter;

    return matchesSearch && matchesStatus && matchesLocale;
  });

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const startIndex = (currentPage - 1) * customersPerPage;
  const displayedCustomers = filteredCustomers.slice(startIndex, startIndex + customersPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "로그인 기록 없음";

    const now = new Date();
    const loginDate = new Date(dateString);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return formatDate(dateString);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getCustomerStatus = (customer: Customer) => {
    if (!customer.isActive) return "INACTIVE";
    return "ACTIVE";
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleEmailCustomer = (customer: Customer) => {
    const subject = encodeURIComponent(`MutPark 고객 문의 - ${customer.name}님`);
    const body = encodeURIComponent(`안녕하세요 ${customer.name}님,\n\n`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleToggleCustomerStatus = (customerId: number) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === customerId
        ? { ...customer, isActive: !customer.isActive }
        : customer
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {filteredCustomers.length}명의 고객이 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 고객</p>
              <p className="text-lg font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">활성 고객</p>
              <p className="text-lg font-bold text-gray-900">
                {customers.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">이메일 미인증</p>
              <p className="text-lg font-bold text-gray-900">
                {customers.filter(c => !c.isEmailVerified).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">평균 주문금액</p>
              <p className="text-lg font-bold text-gray-900">
                ₺{Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.filter(c => c.orderCount > 0).length || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="이메일, 이름, 전화번호로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={localeFilter}
              onChange={(e) => setLocaleFilter(e.target.value)}
            >
              <option value="ALL">전체 언어</option>
              <option value="ko">한국어</option>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문내역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 로그인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedCustomers.map((customer) => {
                const status = getCustomerStatus(customer);
                const StatusIcon = statusConfig[status].icon;
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                          <div className="flex items-center mt-1 space-x-1">
                            {customer.socialAccounts.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                소셜로그인
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {customer.locale.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.phone || "전화번호 없음"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {customer.addresses[0]?.city}, {customer.addresses[0]?.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[status].label}
                        </span>
                        {!customer.isEmailVerified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            이메일 미인증
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.orderCount}건
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(customer.totalSpent, customer.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastLogin(customer.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="고객 상세 보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEmailCustomer(customer)}
                          className="text-green-600 hover:text-green-900"
                          title="이메일 보내기"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        {customer.isActive ? (
                          <button
                            onClick={() => handleToggleCustomerStatus(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="고객 비활성화"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleCustomerStatus(customer.id)}
                            className="text-green-600 hover:text-green-900"
                            title="고객 활성화"
                          >
                            <CheckCircle className="h-4 w-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + customersPerPage, filteredCustomers.length)} / {filteredCustomers.length}명 표시
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

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">고객 상세 정보</h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">기본 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이름</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이메일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">전화번호</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.phone || "등록되지 않음"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">역할</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">언어</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.locale.toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">통화</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCustomer.currency}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">계정 상태</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24">활성 상태:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCustomer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {selectedCustomer.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 w-24">이메일 인증:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCustomer.isEmailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedCustomer.isEmailVerified ? "인증됨" : "미인증"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">주문 내역</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-700">총 주문 건수</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedCustomer.orderCount}건</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-700">총 구매 금액</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(selectedCustomer.totalSpent, selectedCustomer.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">주소 정보</h4>
                {selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((address, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {address.city}, {address.country}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">등록된 주소가 없습니다.</p>
                )}
              </div>

              {/* Social Accounts */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">소셜 계정</h4>
                {selectedCustomer.socialAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.socialAccounts.map((account, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {account.provider}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">연결된 소셜 계정이 없습니다.</p>
                )}
              </div>

              {/* Activity Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">활동 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가입일</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">마지막 로그인</label>
                    <p className="mt-1 text-sm text-gray-900">{formatLastLogin(selectedCustomer.lastLoginAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => handleEmailCustomer(selectedCustomer)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                이메일 보내기
              </button>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}