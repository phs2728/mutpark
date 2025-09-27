"use client";

import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { useCoupon } from "@/hooks/useCoupon";

interface CouponInputProps {
  cartItems: Array<{
    productId: number;
    price: number;
    quantity: number;
    category?: string;
    brand?: string;
  }>;
  userId?: number;
  email?: string;
  onCouponApplied?: (discount: { amount: number; freeShipping: boolean }) => void;
  onCouponRemoved?: () => void;
}

export function CouponInput({
  cartItems,
  userId,
  email,
  onCouponApplied,
  onCouponRemoved
}: CouponInputProps) {
  const { t } = useI18n();
  const { isValidating, appliedCoupon, validateCoupon, removeCoupon } = useCoupon();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError(t("coupons.errors.codeRequired", "Please enter a coupon code"));
      return;
    }

    setError(null);
    const result = await validateCoupon(couponCode.trim(), cartItems, userId, email);

    if (result.valid && result.discount) {
      setCouponCode("");
      onCouponApplied?.(result.discount);
    } else {
      setError(result.error || t("coupons.errors.validationFailed", "Failed to validate coupon"));
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setError(null);
    onCouponRemoved?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyCoupon();
    }
  };

  return (
    <div className="space-y-4">
      {/* Coupon Input */}
      {!appliedCoupon && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("coupons.couponCode", "Coupon Code")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder={t("coupons.enterCode", "Enter coupon code")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={isValidating}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("common.loading", "Loading...")}
                </div>
              ) : (
                t("coupons.apply", "Apply")
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Applied Coupon */}
      {appliedCoupon && appliedCoupon.valid && appliedCoupon.coupon && appliedCoupon.discount && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-emerald-800 dark:text-emerald-200">
                  {t("coupons.applied", "Coupon Applied")}
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold">{appliedCoupon.coupon.code}</span>
                {appliedCoupon.coupon.name && ` - ${appliedCoupon.coupon.name}`}
              </p>
              {appliedCoupon.coupon.description && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {appliedCoupon.coupon.description}
                </p>
              )}
              <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">
                {appliedCoupon.discount.freeShipping && (
                  <span className="block">✓ {t("coupons.freeShipping", "Free shipping")}</span>
                )}
                {appliedCoupon.discount.amount > 0 && (
                  <span className="block">
                    ✓ {t("coupons.discount", "Discount")}: -{appliedCoupon.discount.amount.toFixed(2)} TRY
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
              title={t("coupons.remove", "Remove coupon")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}