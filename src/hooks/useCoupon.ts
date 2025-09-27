"use client";

import { useState } from "react";

interface CartItem {
  productId: number;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: number;
    code: string;
    name: string;
    description?: string;
    type: string;
  };
  discount?: {
    amount: number;
    freeShipping: boolean;
    applicableProducts: number;
    totalApplicableAmount: number;
  };
  error?: string;
  minimumAmount?: number;
}

export function useCoupon() {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  const validateCoupon = async (
    code: string,
    cartItems: CartItem[],
    userId?: number,
    email?: string
  ): Promise<CouponValidationResult> => {
    setIsValidating(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          cartItems,
          userId,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          error: result.error || "Failed to validate coupon",
          minimumAmount: result.minimumAmount,
        };
      }

      const validationResult = {
        valid: true,
        coupon: result.coupon,
        discount: result.discount,
      };

      setAppliedCoupon(validationResult);
      return validationResult;

    } catch (error) {
      console.error("Coupon validation error:", error);
      return {
        valid: false,
        error: "Network error occurred while validating coupon",
      };
    } finally {
      setIsValidating(false);
    }
  };

  const applyCoupon = async (
    couponId: number,
    userId: number | undefined,
    orderId: number,
    email: string | undefined,
    discountAmount: number,
    orderAmount: number
  ) => {
    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponId,
          userId,
          orderId,
          email,
          discountAmount,
          orderAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to apply coupon");
      }

      return result;
    } catch (error) {
      console.error("Coupon application error:", error);
      throw error;
    }
  };

  const getPublicCoupons = async () => {
    try {
      const response = await fetch("/api/coupons/public");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch coupons");
      }

      return result.coupons;
    } catch (error) {
      console.error("Public coupons fetch error:", error);
      throw error;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateTotalWithCoupon = (subtotal: number, shippingFee: number = 0): number => {
    if (!appliedCoupon || !appliedCoupon.discount) {
      return subtotal + shippingFee;
    }

    const { discount } = appliedCoupon;
    const discountAmount = discount.amount;
    const shipping = discount.freeShipping ? 0 : shippingFee;

    return Math.max(0, subtotal - discountAmount + shipping);
  };

  return {
    isValidating,
    appliedCoupon,
    validateCoupon,
    applyCoupon,
    getPublicCoupons,
    removeCoupon,
    calculateTotalWithCoupon,
  };
}