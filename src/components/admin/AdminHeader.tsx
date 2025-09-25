"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminAuthProvider";
import { Bell, LogOut, User, ChevronDown, AlertTriangle, ShoppingCart, UserPlus, CreditCard, MessageSquare } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  priority: string;
  link: string;
  data: any;
}

interface NotificationSummary {
  total: number;
  unread: number;
  high: number;
  normal: number;
  low: number;
  types: {
    orders: number;
    warnings: number;
    errors: number;
    info: number;
    reviews: number;
  };
}

export function AdminHeader() {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAdminAuth();

  // Get page title based on pathname
  const getPageTitle = () => {
    switch (pathname) {
      case '/admin/dashboard':
        return '관리자 대시보드';
      case '/admin/orders':
        return '주문 관리';
      case '/admin/products':
        return '상품 관리';
      case '/admin/customers':
        return '고객 관리';
      case '/admin/community':
        return '커뮤니티 관리';
      case '/admin/events':
        return '이벤트 관리';
      case '/admin/content':
        return '콘텐츠 관리';
      case '/admin/content/banners':
        return '배너 관리';
      case '/admin/analytics':
        return '분석';
      case '/admin/settings':
        return '시스템 설정';
      default:
        return '관리자 대시보드';
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    // Navigate to the link
    if (notification.link) {
      window.location.href = notification.link;
    }

    setNotificationMenuOpen(false);
  };

  const toggleNotifications = () => {
    if (!notificationMenuOpen) {
      fetchNotifications();
    }
    setNotificationMenuOpen(!notificationMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <UserPlus className="h-4 w-4" />;
      case 'review': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (priority: string, type: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50';
    if (type === 'warning') return 'text-orange-600 bg-orange-50';
    if (type === 'error') return 'text-red-600 bg-red-50';
    if (type === 'info') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatTimeAgo = (time: string) => {
    const now = new Date();
    const notificationTime = new Date(time);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 admin-header-padding relative z-10">
      <div className="flex items-center justify-between">
        {/* Page title - 동적으로 업데이트 가능 */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 admin-header-title">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              {summary && summary.unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {summary.unread > 99 ? '99+' : summary.unread}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 admin-nav-text">알림</h3>
                      {summary && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>총 {summary.total}개</span>
                          {summary.high > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full">
                              긴급 {summary.high}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loading state */}
                  {loading && (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm">알림을 불러오는 중...</p>
                    </div>
                  )}

                  {/* Notifications list */}
                  {!loading && (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">새로운 알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${getNotificationColor(notification.priority, notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-2">
                                    {formatTimeAgo(notification.time)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                {notification.priority === 'high' && (
                                  <div className="flex items-center mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      긴급
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => {
                          setNotificationMenuOpen(false);
                          window.location.href = '/admin/notifications';
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium admin-nav-text"
                      >
                        모든 알림 보기
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-700 admin-user-text">{user?.name}</p>
                <p className="text-xs text-gray-500 admin-user-text">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 admin-user-text">{user?.name}</p>
                      <p className="text-xs text-gray-500 admin-user-text">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // 프로필 페이지 이동
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors admin-nav-text"
                    >
                      <User className="h-4 w-4 mr-5" />
                      프로필 설정
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors admin-nav-text"
                    >
                      <LogOut className="h-4 w-4 mr-5" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}