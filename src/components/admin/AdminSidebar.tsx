"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Calendar,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Shield,
  Database,
  ScrollText,
  Code,
  Activity,
  Archive,
  Monitor,
  Layout,
  Receipt,
  Truck,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof import("@/lib/admin-auth").AdminPermissions;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: "대시보드",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    name: "주문 관리",
    href: "/admin/orders",
    icon: ShoppingCart,
    permission: "canManageOrders",
  },
  {
    name: "상품 관리",
    href: "/admin/products",
    icon: Package,
    permission: "canManageProducts",
  },
  {
    name: "고객 관리",
    href: "/admin/customers",
    icon: Users,
    permission: "canManageUsers",
  },
  {
    name: "커뮤니티",
    href: "/admin/community",
    icon: MessageSquare,
    permission: "canManageCommunity",
  },
  {
    name: "이벤트",
    href: "/admin/events",
    icon: Calendar,
    permission: "canManageEvents",
  },
  {
    name: "콘텐츠 관리",
    href: "/admin/content",
    icon: FileText,
    permission: "canManageContent",
    children: [
      {
        name: "배너 관리",
        href: "/admin/content/banners",
        icon: Monitor,
      },
      {
        name: "페이지 관리",
        href: "/admin/content/pages",
        icon: Layout,
      },
    ],
  },
  {
    name: "분석",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "canViewAnalytics",
  },
  {
    name: "세금계산서",
    href: "/admin/invoices",
    icon: Receipt,
    permission: "canManageFinance",
  },
  {
    name: "배송 관리",
    href: "/admin/shipping",
    icon: Truck,
    permission: "canManageShipping",
  },
  {
    name: "시스템 관리",
    href: "/admin/settings",
    icon: Database,
    permission: "canManageSystem",
    children: [
      {
        name: "시스템 설정",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        name: "시스템 상태",
        href: "/admin/health",
        icon: Activity,
      },
      {
        name: "시스템 로그",
        href: "/admin/logs",
        icon: ScrollText,
      },
      {
        name: "백업 관리",
        href: "/admin/backups",
        icon: Archive,
      },
      {
        name: "데이터베이스",
        href: "/admin/database",
        icon: Database,
      },
      {
        name: "API 문서",
        href: "/admin/api-docs",
        icon: Code,
      },
    ],
  },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const pathname = usePathname();
  const { user, permissions } = useAdminAuth();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemVisible = (item: NavigationItem) => {
    if (!item.permission) return true;
    return permissions?.[item.permission] || false;
  };

  const isItemActive = (item: NavigationItem) => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return false;
  };

  const fetchOrderCount = async () => {
    try {
      const response = await fetch('/api/admin/orders/count');
      const data = await response.json();
      if (data.success) {
        setPendingOrdersCount(data.pendingOrders);
      }
    } catch (error) {
      console.error('Failed to fetch order count:', error);
    }
  };

  useEffect(() => {
    fetchOrderCount();
    // 30초마다 주문 수 업데이트
    const interval = setInterval(fetchOrderCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
        <div className={`flex items-center ${level > 0 ? 'pl-4' : ''}`}>
          <Link
            href={item.href}
            className={`flex-1 group flex items-center px-3 py-3 text-xl font-medium rounded-lg transition-colors ${
              isActive
                ? 'text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon
              className={`mr-3 flex-shrink-0 h-6 w-6 ${
                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            <span className="flex-1 admin-nav-text">{item.name}</span>
            {item.name === '주문 관리' && pendingOrdersCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-3 py-2 text-base font-bold leading-none text-white bg-red-600 rounded-full min-w-[2rem] h-8">
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </span>
            )}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 flex z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Main sidebar */}
      <div
        className={`flex flex-col w-60 bg-white border-r border-gray-200 h-full transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and close button */}
        <div className="admin-sidebar-logo">
          <div className="flex items-center">
            <Shield className="h-9 w-9 text-white" />
            <span className="ml-3 text-2xl font-bold text-white korean-text-loose">MutPark</span>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* User info */}
        <div className="admin-user-section">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-base font-medium">
                  {user?.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-base font-medium text-gray-700 admin-user-text">{user?.name}</p>
              <p className="text-sm text-gray-500 admin-user-text">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 space-y-2 overflow-y-auto">
          {navigation.map(item => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-2 left-2 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-white p-1.5 rounded-md shadow-md border border-gray-200"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </>
  );
}