"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

interface TrackingEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
  location?: string;
  courierName?: string;
  courierPhone?: string;
}

interface OrderTrackingProps {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  events?: TrackingEvent[];
  onStatusUpdate?: (status: OrderStatus) => void;
}

export function OrderTracking({
  orderId,
  currentStatus,
  trackingNumber,
  estimatedDelivery,
  events = [],
  onStatusUpdate
}: OrderTrackingProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const statusSteps: { status: OrderStatus; label: string; icon: string; color: string }[] = [
    {
      status: "pending",
      label: t("tracking.status.pending", "Sipariş Alındı"),
      icon: "📋",
      color: "text-gray-500"
    },
    {
      status: "confirmed",
      label: t("tracking.status.confirmed", "Onaylandı"),
      icon: "✅",
      color: "text-blue-500"
    },
    {
      status: "preparing",
      label: t("tracking.status.preparing", "Hazırlanıyor"),
      icon: "📦",
      color: "text-yellow-500"
    },
    {
      status: "shipped",
      label: t("tracking.status.shipped", "Kargoya Verildi"),
      icon: "🚚",
      color: "text-orange-500"
    },
    {
      status: "out_for_delivery",
      label: t("tracking.status.outForDelivery", "Dağıtımda"),
      icon: "🏃‍♂️",
      color: "text-purple-500"
    },
    {
      status: "delivered",
      label: t("tracking.status.delivered", "Teslim Edildi"),
      icon: "🎉",
      color: "text-green-500"
    }
  ];

  const getCurrentStatusIndex = () => {
    return statusSteps.findIndex(step => step.status === currentStatus);
  };

  const isStatusCompleted = (stepIndex: number) => {
    return stepIndex <= getCurrentStatusIndex();
  };

  const isStatusCurrent = (status: OrderStatus) => {
    return status === currentStatus;
  };

  const refreshTracking = async () => {
    setIsLoading(true);
    try {
      // Simulated API call - replace with actual tracking API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, fetch latest tracking data
      console.log(`Refreshing tracking for order ${orderId}`);

      // Simulate status update for demo
      if (onStatusUpdate) {
        const currentIndex = getCurrentStatusIndex();
        const nextStep = statusSteps[currentIndex + 1];
        if (nextStep && Math.random() > 0.7) {
          onStatusUpdate(nextStep.status);
        }
      }
    } catch (error) {
      console.error("Failed to refresh tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📍 {t("tracking.title", "Sipariş Takibi")}
        </h3>
        <button
          onClick={refreshTracking}
          disabled={isLoading}
          className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              {t("tracking.refreshing", "Güncelleniyor...")}
            </span>
          ) : (
            t("tracking.refresh", "Yenile")
          )}
        </button>
      </div>

      {/* Order Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900/50 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t("tracking.orderId", "Sipariş No")}:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              #{orderId}
            </span>
          </div>
          {trackingNumber && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {t("tracking.trackingNumber", "Takip No")}:
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {trackingNumber}
              </span>
            </div>
          )}
          {estimatedDelivery && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {t("tracking.estimatedDelivery", "Tahmini Teslimat")}:
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {estimatedDelivery}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              {t("tracking.currentStatus", "Durum")}:
            </span>
            <span className={`ml-2 font-medium ${statusSteps.find(s => s.status === currentStatus)?.color || 'text-gray-900'}`}>
              {statusSteps.find(s => s.status === currentStatus)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${
                isStatusCompleted(index)
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isStatusCurrent(step.status)
                  ? "border-blue-500 bg-blue-50 text-blue-600 animate-pulse"
                  : "border-gray-300 bg-gray-100 text-gray-400"
              }`}>
                {step.icon}
                {index < statusSteps.length - 1 && (
                  <div className={`absolute top-6 left-12 w-full h-0.5 ${
                    isStatusCompleted(index) ? "bg-emerald-500" : "bg-gray-300"
                  }`} />
                )}
              </div>
              <span className={`mt-2 text-xs text-center font-medium ${
                isStatusCompleted(index) || isStatusCurrent(step.status)
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Events */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            {t("tracking.events", "Takip Geçmişi")}
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? "bg-blue-500" : "bg-gray-300"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                  {event.courierName && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      👤 {t("tracking.courier", "Kurye")}: {event.courierName}
                      {event.courierPhone && (
                        <span className="ml-2">📞 {event.courierPhone}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">❓</span>
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t("tracking.helpTitle", "Yardıma mı ihtiyacınız var?")}
            </p>
            <p className="text-blue-700 dark:text-blue-300 mb-2">
              {t("tracking.helpDesc", "Siparişinizle ilgili herhangi bir sorun yaşıyorsanız bizimle iletişime geçin.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:+908501234567"
                className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                📞 {t("tracking.callSupport", "Destek Hattı")}
              </a>
              <a
                href="mailto:destek@mutpark.com"
                className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                ✉️ {t("tracking.emailSupport", "E-posta")}
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                💬 {t("tracking.liveChat", "Canlı Destek")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      {currentStatus === "delivered" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600">🎉</span>
            <p className="font-medium text-green-800 dark:text-green-200">
              {t("tracking.deliveredTitle", "Siparişiniz teslim edildi!")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary text-sm"
            >
              {t("tracking.rateOrder", "Sipariş Değerlendir")}
            </button>
            <button
              type="button"
              className="btn-outline text-sm"
            >
              {t("tracking.reorder", "Tekrar Sipariş Ver")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}