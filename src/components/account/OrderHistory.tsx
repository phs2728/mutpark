"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { OrderTracking } from "@/components/checkout/OrderTracking";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
  };
}

interface OrderHistoryProps {
  locale: string;
  initialOrders?: Order[];
}

export function OrderHistory({ locale, initialOrders = [] }: OrderHistoryProps) {
  const { t } = useI18n();
  // 안전하게 배열인지 확인하고 초기화
  const safeInitialOrders = Array.isArray(initialOrders) ? initialOrders : [];
  const [orders, setOrders] = useState<Order[]>(safeInitialOrders);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  const statusConfig = {
    PENDING: {
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      icon: "⏳",
      label: t("order.status.pending", "Beklemede")
    },
    CONFIRMED: {
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: "✅",
      label: t("order.status.confirmed", "Onaylandı")
    },
    PROCESSING: {
      color: "text-orange-600 bg-orange-50 border-orange-200",
      icon: "📦",
      label: t("order.status.processing", "Hazırlanıyor")
    },
    SHIPPED: {
      color: "text-purple-600 bg-purple-50 border-purple-200",
      icon: "🚚",
      label: t("order.status.shipped", "Kargoda")
    },
    DELIVERED: {
      color: "text-green-600 bg-green-50 border-green-200",
      icon: "🎉",
      label: t("order.status.delivered", "Teslim Edildi")
    },
    CANCELLED: {
      color: "text-red-600 bg-red-50 border-red-200",
      icon: "❌",
      label: t("order.status.cancelled", "İptal Edildi")
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        // 안전하게 배열인지 확인하고 설정
        const safeData = Array.isArray(data) ? data : [];
        setOrders(safeData);
      } else {
        // 응답이 실패한 경우에도 빈 배열로 설정
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // 에러 발생시 빈 배열로 설정
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowTracking(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelOrder = (status: string) => {
    return ['PENDING', 'CONFIRMED'].includes(status);
  };

  const canTrackOrder = (status: string) => {
    return ['SHIPPED', 'DELIVERED'].includes(status);
  };

  if (showTracking && selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTracking(false)}
            className="btn-outline"
          >
            ← {t("order.backToOrders", "Siparişlere Dön")}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("order.tracking", "Sipariş Takibi")} - #{selectedOrder.orderNumber}
          </h1>
        </div>

        <OrderTracking
          orderId={selectedOrder.orderNumber}
          currentStatus={selectedOrder.status as any}
          trackingNumber={selectedOrder.trackingNumber}
          estimatedDelivery={selectedOrder.estimatedDelivery}
          events={[
            {
              id: "1",
              status: "confirmed",
              timestamp: selectedOrder.createdAt,
              description: t("tracking.orderConfirmed", "Sipariş onaylandı")
            },
            // Add more tracking events based on order status
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📦 {t("order.history", "Sipariş Geçmişi")}
        </h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn-outline disabled:opacity-50"
        >
          {loading ? "🔄" : "🔄"} {t("order.refresh", "Yenile")}
        </button>
      </div>

      {/* Orders List */}
      {(!orders || !Array.isArray(orders) || orders.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("order.noOrders", "Henüz siparişiniz yok")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("order.startShopping", "Alışverişe başlayarak ilk siparişinizi verin!")}
          </p>
          <Link href={`/${locale}/products`} className="btn-primary">
            🛍️ {t("order.shopNow", "Alışverişe Başla")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders || []).map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                        {status.icon} {status.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.total, DEFAULT_CURRENCY, locale)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items.length} {t("order.items", "ürün")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          📦
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} × {formatCurrency(item.price, DEFAULT_CURRENCY, locale)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity, DEFAULT_CURRENCY, locale)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        +{order.items.length - 3} {t("order.moreItems", "ürün daha")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/${locale}/account/orders/${order.id}`}
                      className="btn-outline text-sm"
                    >
                      📋 {t("order.viewDetails", "Detayları Gör")}
                    </Link>

                    {canTrackOrder(order.status) && (
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="btn-outline text-sm"
                      >
                        📍 {t("order.trackOrder", "Sipariş Takibi")}
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <Link
                        href={`/${locale}/account/orders/${order.id}/review`}
                        className="btn-outline text-sm"
                      >
                        ⭐ {t("order.writeReview", "Değerlendir")}
                      </Link>
                    )}

                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => {/* Handle cancel */}}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        ❌ {t("order.cancel", "İptal Et")}
                      </button>
                    )}

                    <button
                      onClick={() => {/* Handle reorder */}}
                      className="btn-primary text-sm"
                    >
                      🔄 {t("order.reorder", "Tekrar Sipariş Ver")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {orders && Array.isArray(orders) && orders.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => {/* Load more orders */}}
            className="btn-outline"
          >
            {t("order.loadMore", "Daha Fazla Göster")}
          </button>
        </div>
      )}
    </div>
  );
}