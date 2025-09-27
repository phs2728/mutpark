"use client";

import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalAddresses: number;
  totalWishlistItems: number;
  totalReviews: number;
  totalPoints: number;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface MyPageDashboardProps {
  locale: string;
  initialStats?: DashboardStats;
  recentOrders?: RecentOrder[];
}

export function MyPageDashboard({
  locale,
  initialStats,
  recentOrders = []
}: MyPageDashboardProps) {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats>(initialStats || {
    totalOrders: 0,
    pendingOrders: 0,
    totalAddresses: 0,
    totalWishlistItems: 0,
    totalReviews: 0,
    totalPoints: 0
  });

  const menuItems = [
    {
      href: `/${locale}/account/orders`,
      icon: "📦",
      title: t("mypage.menu.orders", "Siparişlerim"),
      description: t("mypage.menu.ordersDesc", "Sipariş geçmişi ve takip"),
      count: stats.totalOrders,
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null
    },
    {
      href: `/${locale}/account/profile`,
      icon: "👤",
      title: t("mypage.menu.profile", "Profil Bilgilerim"),
      description: t("mypage.menu.profileDesc", "Kişisel bilgilerim"),
      count: null,
      badge: null
    },
    {
      href: `/${locale}/account/addresses`,
      icon: "📍",
      title: t("mypage.menu.addresses", "Adreslerim"),
      description: t("mypage.menu.addressesDesc", "Teslimat adresleri"),
      count: stats.totalAddresses,
      badge: null
    },
    {
      href: `/${locale}/wishlist`,
      icon: "❤️",
      title: t("mypage.menu.wishlist", "Favorilerim"),
      description: t("mypage.menu.wishlistDesc", "Beğendiğim ürünler"),
      count: stats.totalWishlistItems,
      badge: null
    },
    {
      href: `/${locale}/account/reviews`,
      icon: "⭐",
      title: t("mypage.menu.reviews", "Değerlendirmelerim"),
      description: t("mypage.menu.reviewsDesc", "Yazdığım ürün yorumları"),
      count: stats.totalReviews,
      badge: null
    },
    {
      href: `/${locale}/account/points`,
      icon: "🎁",
      title: t("mypage.menu.points", "Puanlarım"),
      description: t("mypage.menu.pointsDesc", "Kazandığım puan ve hediyeler"),
      count: stats.totalPoints,
      badge: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-50';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-50';
      case 'DELIVERED':
        return 'text-green-600 bg-green-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t("order.status.pending", "Beklemede");
      case 'PROCESSING':
        return t("order.status.processing", "Hazırlanıyor");
      case 'SHIPPED':
        return t("order.status.shipped", "Kargoda");
      case 'DELIVERED':
        return t("order.status.delivered", "Teslim Edildi");
      case 'CANCELLED':
        return t("order.status.cancelled", "İptal Edildi");
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          👋 {t("mypage.welcome", "Hoş Geldiniz")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("mypage.subtitle", "Hesap bilgilerinizi ve siparişlerinizi buradan yönetebilirsiniz")}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-emerald-600">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("mypage.stats.totalOrders", "Toplam Sipariş")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("mypage.stats.pendingOrders", "Bekleyen Sipariş")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{stats.totalWishlistItems}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("mypage.stats.wishlistItems", "Favori Ürün")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("mypage.stats.points", "Puan")}
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{item.icon}</div>
              <div className="flex items-center gap-2">
                {item.count !== null && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
              {t("mypage.menu.goTo", "Git")} →
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📦 {t("mypage.recentOrders", "Son Siparişlerim")}
            </h2>
            <Link
              href={`/${locale}/account/orders`}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t("mypage.viewAll", "Tümünü Gör")} →
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    #{order.orderNumber}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {order.total.toFixed(2)} ₺
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ {t("mypage.quickActions", "Hızlı İşlemler")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/products`}
            className="btn-primary"
          >
            🛍️ {t("mypage.shopNow", "Alışverişe Başla")}
          </Link>
          <Link
            href={`/${locale}/account/addresses/new`}
            className="btn-outline"
          >
            📍 {t("mypage.addAddress", "Yeni Adres Ekle")}
          </Link>
          <Link
            href={`/${locale}/wishlist`}
            className="btn-outline"
          >
            ❤️ {t("mypage.viewWishlist", "Favorilerimi Gör")}
          </Link>
        </div>
      </div>
    </div>
  );
}