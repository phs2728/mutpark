"use client";

import { useI18n } from "@/providers/I18nProvider";
import { useEffect, useState } from "react";

interface ProductStockStatusProps {
  stock: number;
  isLowStock?: boolean;
  isExpired?: boolean;
  expiryDate?: string | null;
  freshnessStatus?: string | null;
  productId: number;
  productName: string;
}

export function ProductStockStatus({
  stock,
  isLowStock,
  isExpired,
  expiryDate,
  freshnessStatus,
  productId,
  productName
}: ProductStockStatusProps) {
  const { t, locale: activeLocale } = useI18n();
  const [currentStock, setCurrentStock] = useState(stock);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // 실시간 재고 업데이트 (실제 구현에서는 WebSocket이나 Server-Sent Events 사용)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setIsUpdating(true);
        const response = await fetch(`/api/products/${productId}/stock`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.stock !== currentStock) {
            setCurrentStock(data.data.stock);
          }
        }
      } catch (error) {
        console.error("재고 정보 업데이트 실패:", error);
      } finally {
        setIsUpdating(false);
      }
    }, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, [productId, currentStock]);

  const handleStockNotification = async () => {
    if (!email.trim()) {
      setShowEmailInput(true);
      return;
    }

    setIsNotifying(true);
    try {
      const response = await fetch(`/api/products/${productId}/stock-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          productName,
        }),
      });

      if (response.ok) {
        setIsNotified(true);
        setShowEmailInput(false);
        setEmail("");
      } else {
        throw new Error("Failed to set stock notification");
      }
    } catch (error) {
      console.error("Stock notification error:", error);
      alert(t("notifications.error", "Something went wrong. Please try again."));
    } finally {
      setIsNotifying(false);
    }
  };

  const getStockStatus = () => {
    if (isExpired) {
      return {
        status: "expired",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "⚠️",
        message: t("stock.expired", "유통기한 만료")
      };
    }

    if (currentStock === 0) {
      return {
        status: "out_of_stock",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "❌",
        message: t("stock.outOfStock", "품절")
      };
    }

    if (isLowStock || currentStock < 5) {
      return {
        status: "low_stock",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⚡",
        message: t("stock.lowStock", "재고 부족")
      };
    }

    return {
      status: "in_stock",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: "✅",
      message: t("stock.available", "구매 가능")
    };
  };

  const getExpiryStatus = () => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        status: "expired",
        color: "bg-red-100 text-red-800",
        icon: "⚠️",
        message: t("expiry.expired", "유통기한 만료"),
        date: expiry.toLocaleDateString(activeLocale)
      };
    }

    if (daysUntilExpiry <= 3) {
      return {
        status: "expiring_soon",
        color: "bg-orange-100 text-orange-800",
        icon: "🔔",
        message: t("expiry.expiringSoon", `${daysUntilExpiry}일 후 만료`),
        date: expiry.toLocaleDateString(activeLocale)
      };
    }

    if (daysUntilExpiry <= 7) {
      return {
        status: "fresh",
        color: "bg-yellow-100 text-yellow-800",
        icon: "📅",
        message: t("expiry.weekLeft", `${daysUntilExpiry}일 후 만료`),
        date: expiry.toLocaleDateString(activeLocale)
      };
    }

    return {
      status: "very_fresh",
      color: "bg-green-100 text-green-800",
      icon: "🌱",
      message: t("expiry.fresh", "신선함"),
      date: expiry.toLocaleDateString(activeLocale)
    };
  };

  const stockStatus = getStockStatus();
  const expiryStatus = getExpiryStatus();

  return (
    <div className="space-y-4">
      {/* 재고 상태 */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
            <span>{stockStatus.icon}</span>
            <span>{stockStatus.message}</span>
            {isUpdating && (
              <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {currentStock}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("stock.available_count", "개 재고")}
          </div>
        </div>
      </div>

      {/* 재고 진행 바 */}
      {currentStock > 0 && !isExpired && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{t("stock.availability", "재고 현황")}</span>
            <span>{currentStock} / {Math.max(currentStock + 10, 20)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                currentStock < 5
                  ? "bg-red-500"
                  : currentStock < 10
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min((currentStock / Math.max(currentStock + 10, 20)) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* 유통기한 정보 */}
      {expiryStatus && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${expiryStatus.color}`}>
                <span>{expiryStatus.icon}</span>
                <span>{expiryStatus.message}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {expiryStatus.date}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("expiry.date", "유통기한")}
              </div>
            </div>
          </div>

          {/* 유통기한 시각화 */}
          {expiryDate && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t("expiry.today", "오늘")}</span>
                <span>{t("expiry.expiryDate", "유통기한")}</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      expiryStatus.status === "expired"
                        ? "bg-red-500"
                        : expiryStatus.status === "expiring_soon"
                        ? "bg-orange-500"
                        : expiryStatus.status === "fresh"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(
                          ((new Date(expiryDate).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24 * 30)) * 100,
                          0
                        ),
                        100
                      )}%`
                    }}
                  />
                </div>
                <div
                  className="absolute top-0 w-2 h-2 bg-gray-400 rounded-full transform -translate-y-0.5"
                  style={{ left: "0%" }}
                />
                <div
                  className="absolute top-0 w-2 h-2 bg-red-400 rounded-full transform -translate-y-0.5"
                  style={{ right: "0%" }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 재고 알림 기능 */}
      {(currentStock === 0 || isExpired) && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {!isNotified ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>🔔</span>
                <span>{t("products.stockNotification", "Notify When Available")}</span>
              </div>

              {showEmailInput && (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("products.stockNotificationEmail", "Email Address")}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    disabled={isNotifying}
                  />
                </div>
              )}

              <button
                onClick={handleStockNotification}
                disabled={isNotifying}
                className="w-full px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/30 transition-colors"
              >
                {isNotifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("common.loading", "Loading...")}</span>
                  </div>
                ) : (
                  t("products.stockNotification", "Notify When Available")
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("products.stockNotificationSuccess", "We'll notify you when this product is back in stock")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 추가 정보 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>💡 {t("stock.updateInfo", "재고 정보는 30초마다 자동으로 업데이트됩니다.")}</p>
      </div>
    </div>
  );
}