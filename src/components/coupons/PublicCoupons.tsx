"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { useCoupon } from "@/hooks/useCoupon";

interface PublicCoupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  currency: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  usageRemaining?: number;
  firstTimeCustomerOnly: boolean;
}

interface PublicCouponsProps {
  onCouponSelect?: (code: string) => void;
  className?: string;
}

export function PublicCoupons({ onCouponSelect, className = "" }: PublicCouponsProps) {
  const { t } = useI18n();
  const { getPublicCoupons } = useCoupon();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCoupons = await getPublicCoupons();
      setCoupons(fetchedCoupons);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      setError(t("coupons.errors.loadFailed", "Failed to load coupons"));
    } finally {
      setLoading(false);
    }
  };

  const formatCouponValue = (coupon: PublicCoupon) => {
    switch (coupon.type) {
      case "PERCENTAGE":
        return `${coupon.value}% ${t("coupons.off", "off")}`;
      case "FIXED_AMOUNT":
        return `${coupon.value} ${coupon.currency} ${t("coupons.off", "off")}`;
      case "FREE_SHIPPING":
        return t("coupons.freeShipping", "Free shipping");
      default:
        return "";
    }
  };

  const getExpiryText = (validUntil: string) => {
    const expiry = new Date(validUntil);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return t("coupons.expired", "Expired");
    } else if (diffDays === 1) {
      return t("coupons.expiresIn1Day", "Expires in 1 day");
    } else if (diffDays <= 7) {
      return t("coupons.expiresInDays", "Expires in {days} days", { days: diffDays });
    } else {
      return t("coupons.expiresOn", "Expires on {date}", {
        date: expiry.toLocaleDateString()
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("coupons.availableCoupons", "Available Coupons")}
        </h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadCoupons}
            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
          >
            {t("common.retry", "Try again")}
          </button>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("coupons.availableCoupons", "Available Coupons")}
        </h3>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p>{t("coupons.noCouponsAvailable", "No coupons available at the moment")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("coupons.availableCoupons", "Available Coupons")}
      </h3>
      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="relative p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 dark:border-gray-700"
          >
            {/* Coupon Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full dark:bg-emerald-800 dark:text-emerald-100">
                {formatCouponValue(coupon)}
              </span>
            </div>

            <div className="pr-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {coupon.name}
              </h4>

              {coupon.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {coupon.description}
                </p>
              )}

              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {coupon.minimumOrderAmount && (
                  <p>
                    {t("coupons.minimumOrder", "Minimum order")}: {coupon.minimumOrderAmount} {coupon.currency}
                  </p>
                )}

                {coupon.maxDiscountAmount && coupon.type !== "FREE_SHIPPING" && (
                  <p>
                    {t("coupons.maxDiscount", "Maximum discount")}: {coupon.maxDiscountAmount} {coupon.currency}
                  </p>
                )}

                {coupon.firstTimeCustomerOnly && (
                  <p className="text-amber-600 dark:text-amber-400">
                    {t("coupons.firstTimeOnly", "First-time customers only")}
                  </p>
                )}

                {coupon.usageRemaining && (
                  <p>
                    {t("coupons.usesLeft", "Uses left")}: {coupon.usageRemaining}
                  </p>
                )}

                <p className={getExpiryText(coupon.validUntil).includes("Expires in") ? "text-amber-600" : ""}>
                  {getExpiryText(coupon.validUntil)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => copyToClipboard(coupon.code)}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <span className="font-mono font-semibold">{coupon.code}</span>
              </button>

              {onCouponSelect && (
                <button
                  onClick={() => onCouponSelect(coupon.code)}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  {t("coupons.use", "Use")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}