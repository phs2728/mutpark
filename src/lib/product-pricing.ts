import { differenceInCalendarDays } from "date-fns";
import type { Product } from "@prisma/client";
import { decimalToNumber } from "@/lib/serializers";

export const LOW_STOCK_THRESHOLD = 10;
export const EXPIRY_WINDOW_DAYS = 7;
const NEAR_EXPIRY_DISCOUNT_PERCENT = 20;

export type DiscountReason = "nearExpiry" | null;

export interface ProductPricingInfo {
  price: number;
  priceOriginal: number | null;
  discountPercentage: number;
  discountReason: DiscountReason;
  expiryDate: string | null;
  isExpired: boolean;
  expiresSoon: boolean;
  isLowStock: boolean;
}

export function computeProductPricing(product: Product): ProductPricingInfo {
  const basePrice = decimalToNumber(product.price);
  const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
  const today = new Date();
  const isExpired = expiryDate ? expiryDate < today : false;
  const expiresSoon =
    expiryDate && !isExpired ? differenceInCalendarDays(expiryDate, today) <= EXPIRY_WINDOW_DAYS : false;

  let discountPercentage = 0;
  let discountReason: DiscountReason = null;

  if (expiresSoon && !isExpired) {
    discountPercentage = NEAR_EXPIRY_DISCOUNT_PERCENT;
    discountReason = "nearExpiry";
  }

  const discountRate = discountPercentage / 100;
  const discountedPrice = basePrice * (1 - discountRate);
  const price = Number(discountedPrice.toFixed(2));
  const priceOriginal = discountPercentage > 0 ? basePrice : null;

  return {
    price,
    priceOriginal,
    discountPercentage,
    discountReason,
    expiryDate: expiryDate?.toISOString() ?? null,
    isExpired,
    expiresSoon,
    isLowStock: product.stock <= LOW_STOCK_THRESHOLD,
  };
}
