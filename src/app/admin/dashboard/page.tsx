"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  AlertCircle,
  Eye,
} from "lucide-react";

interface DashboardData {
  overview: {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalPosts: number;
    periodRevenue: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  orders: {
    new: number;
    pending: number;
    processing: number;
    delivered: number;
    conversionRate: number;
  };
  products: {
    lowStock: number;
    outOfStock: number;
    topSelling: any[];
    categories: any[];
  };
  customers: {
    new: number;
    active: number;
    retentionRate: number;
  };
  community: {
    newPosts: number;
    newComments: number;
    newLikes: number;
    engagementRate: number;
  };
  events: {
    active: number;
    newParticipants: number;
  };
  activity: {
    recentOrders: any[];
    recentCustomers: any[];
  };
}

export default function AdminDashboard() {
  const { user, permissions } = useAdminAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/analytics/dashboard?period=30", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: "총 주문",
      value: dashboardData?.overview.totalOrders?.toLocaleString() || "0",
      change: `+${dashboardData?.orders.new || 0} 신규`,
      changeType: "increase" as const,
      icon: ShoppingCart,
      visible: permissions?.canManageOrders,
    },
    {
      name: "전체 상품",
      value: dashboardData?.overview.totalProducts?.toLocaleString() || "0",
      change: `${dashboardData?.products.lowStock || 0}개 부족`,
      changeType: dashboardData?.products.lowStock > 0 ? "decrease" : "increase",
      icon: Package,
      visible: permissions?.canManageProducts,
    },
    {
      name: "총 고객",
      value: dashboardData?.overview.totalCustomers?.toLocaleString() || "0",
      change: `+${dashboardData?.customers.new || 0} 신규`,
      changeType: "increase" as const,
      icon: Users,
      visible: permissions?.canManageUsers,
    },
    {
      name: "월간 매출",
      value: formatCurrency(dashboardData?.overview.periodRevenue || 0),
      change: `평균 ${formatCurrency(dashboardData?.overview.averageOrderValue || 0)}`,
      changeType: "increase" as const,
      icon: TrendingUp,
      visible: permissions?.canViewAnalytics,
    },
  ];

  const recentActivities = [
    ...(dashboardData?.activity.recentOrders?.slice(0, 3).map((order: any, index: number) => ({
      id: `order-${index}`,
      type: "order",
      message: `새 주문이 접수되었습니다 (${order.orderNumber})`,
      time: new Date(order.createdAt).toLocaleString("ko-KR"),
      icon: ShoppingCart,
    })) || []),
    ...(dashboardData?.activity.recentCustomers?.slice(0, 2).map((customer: any, index: number) => ({
      id: `customer-${index}`,
      type: "user",
      message: `새로운 고객이 가입했습니다: ${customer.name}`,
      time: new Date(customer.createdAt).toLocaleString("ko-KR"),
      icon: Users,
    })) || []),
  ].slice(0, 5);

  const quickActions = [
    {
      name: "주문 관리",
      description: "새 주문 확인 및 처리",
      href: "/admin/orders",
      icon: ShoppingCart,
      visible: permissions?.canManageOrders,
    },
    {
      name: "상품 추가",
      description: "새 상품 등록",
      href: "/admin/products/new",
      icon: Package,
      visible: permissions?.canManageProducts,
    },
    {
      name: "이벤트 관리",
      description: "커뮤니티 이벤트 관리",
      href: "/admin/events",
      icon: Calendar,
      visible: permissions?.canManageEvents,
    },
    {
      name: "분석 보기",
      description: "매출 및 사용자 분석",
      href: "/admin/analytics",
      icon: TrendingUp,
      visible: permissions?.canViewAnalytics,
    },
  ];

  return (
    <div className="admin-dashboard-content space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user?.name}님! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          오늘의 MutPark 운영 현황을 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats
          .filter(stat => stat.visible !== false)
          .map((stat) => (
            <div
              key={stat.name}
              className="stats-card bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p
                    className={`text-sm ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change} 전월 대비
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              모두 보기
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions
              .filter(action => action.visible !== false)
              .map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className="quick-action-card p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white border border-gray-200 rounded-lg group-hover:border-blue-300">
                      <action.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                        {action.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="system-status flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API 서버: 정상</span>
          </div>
          <div className="system-status flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">데이터베이스: 정상</span>
          </div>
          <div className="system-status flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">CDN: 지연 중</span>
          </div>
        </div>
      </div>
    </div>
  );
}