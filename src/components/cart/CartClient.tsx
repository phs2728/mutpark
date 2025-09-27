"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";
import { useDebounce } from "@/hooks/useDebounce";
import { CouponInput } from "@/components/checkout/CouponInput";
import { RecommendedProducts } from "@/components/products/RecommendedProducts";

interface QuantityInputState {
  [productId: number]: number;
}

export function CartClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { t, locale: activeLocale } = useI18n();
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const optimisticUpdating = useCartStore((state) => state.optimisticUpdating);
  const error = useCartStore((state) => state.error);
  const clearError = useCartStore((state) => state.clearError);

  // Local state for quantity inputs
  const [quantityInputs, setQuantityInputs] = useState<QuantityInputState>({});
  const debouncedQuantities = useDebounce(quantityInputs, 500);

  // Coupon and shipping state
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; freeShipping: boolean } | null>(null);
  const [shippingCost, setShippingCost] = useState(29.99); // Default shipping cost in TRY
  const [freeShippingThreshold] = useState(199); // Free shipping threshold in TRY

  // Calculate subtotal with optimistic updates for immediate feedback
  const subtotalDisplay = items.reduce((acc, item) => {
    const currentQuantity = quantityInputs[item.productId] || item.quantity;
    return acc + item.product.price * currentQuantity;
  }, 0);

  // Calculate shipping cost (free if over threshold or coupon applied)
  const finalShippingCost = appliedDiscount?.freeShipping || subtotalDisplay >= freeShippingThreshold ? 0 : shippingCost;

  // Calculate final total
  const discountAmount = appliedDiscount?.amount || 0;
  const finalTotal = Math.max(0, subtotalDisplay - discountAmount + finalShippingCost);

  // Calculate line totals with optimistic updates
  const getLineTotal = useCallback((item: typeof items[0]) => {
    const currentQuantity = quantityInputs[item.productId] || item.quantity;
    return item.product.price * currentQuantity;
  }, [quantityInputs]);

  // Handle coupon apply/remove
  const handleCouponApplied = useCallback((discount: { amount: number; freeShipping: boolean }) => {
    setAppliedDiscount(discount);
  }, []);

  const handleCouponRemoved = useCallback(() => {
    setAppliedDiscount(null);
  }, []);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  // Initialize quantity inputs when items change
  useEffect(() => {
    const newInputs: QuantityInputState = {};
    items.forEach(item => {
      newInputs[item.productId] = item.quantity;
    });
    setQuantityInputs(newInputs);
  }, [items]);

  // Handle debounced quantity updates
  useEffect(() => {
    Object.entries(debouncedQuantities).forEach(([productIdStr, quantity]) => {
      const productId = parseInt(productIdStr);
      const currentItem = items.find(item => item.productId === productId);
      if (currentItem && currentItem.quantity !== quantity && quantity > 0) {
        updateItem(productId, quantity);
      }
    });
  }, [debouncedQuantities, items, updateItem]);

  const handleQuantityChange = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantityInputs(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  }, []);

  const handleRemove = useCallback((productId: number) => {
    removeItem(productId);
  }, [removeItem]);

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p style={{ color: "var(--mut-color-text-secondary)" }}>{t("cart.empty")}</p>
        <button type="button" className="btn-primary mt-6" onClick={() => router.push(`/${locale}`)}>
          {t("cart.continue")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="오류 메시지 닫기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => {
            const isUpdating = optimisticUpdating.has(item.productId);
            return (
              <div
                key={item.id}
                className={`card flex flex-col gap-4 p-4 sm:flex-row transition-all duration-200 ${
                  isUpdating ? 'opacity-75 scale-[0.98]' : 'opacity-100 scale-100'
                }`}
              >
                {/* Loading overlay for updating items */}
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {(() => {
                const imageSrc = resolveImageUrl(item.product.imageUrl, { width: 320, height: 320, quality: 80 });
                if (!imageSrc) return null;
                return (
                  <Image
                    src={imageSrc}
                    alt={item.product.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                );
              })()}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/${locale}/products/${item.product.slug}`}
                    className="text-lg font-semibold"
                    style={{ color: "var(--mut-color-text-primary)" }}
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
                    {formatCurrency(item.product.price, DEFAULT_CURRENCY, activeLocale)} {t("cart.each")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold" style={{ color: "var(--mut-color-primary)" }}>
                      {formatCurrency(getLineTotal(item), DEFAULT_CURRENCY, activeLocale)}
                    </p>
                    {quantityInputs[item.productId] !== item.quantity && !isUpdating && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                        {t("cart.updating")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleRemove(item.productId)}
                  disabled={isUpdating}
                >
                  {t("cart.remove")}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
                  {t("cart.quantity")}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={quantityInputs[item.productId] || item.quantity}
                    onChange={(event) => handleQuantityChange(item.productId, Number(event.target.value))}
                    className={`input-field w-20 ${isUpdating ? 'opacity-50' : ''}`}
                    disabled={isUpdating}
                  />
                  {quantityInputs[item.productId] !== item.quantity && !isUpdating && (
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
              </div>
            );
          })}
        </div>
        <aside className="card space-y-6 p-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
            {t("cart.summary", "Order Summary")}
          </h2>

          {/* Items count */}
          <div className="flex items-center justify-between text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
            <span>{t("cart.items")} ({items.length})</span>
            <span>{items.reduce((acc, item) => acc + (quantityInputs[item.productId] || item.quantity), 0)} {t("cart.total", "총 개수")}</span>
          </div>

          {/* Coupon Input */}
          <CouponInput
            cartItems={items.map(item => ({
              productId: item.productId,
              price: item.product.price,
              quantity: quantityInputs[item.productId] || item.quantity,
              category: item.product.category || undefined,
              brand: item.product.brand || undefined,
            }))}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
          />

          {/* Order breakdown */}
          <div className="space-y-3 pt-4 border-t">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span>{t("cart.subtotal", "소계")}</span>
              <div className="flex items-center gap-2">
                <span className="transition-all duration-300">
                  {formatCurrency(subtotalDisplay, DEFAULT_CURRENCY, activeLocale)}
                </span>
                {Object.values(quantityInputs).some((qty, index) => qty !== items[index]?.quantity) && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-emerald-600">
                <span>{t("cart.discount", "할인")}</span>
                <span>-{formatCurrency(discountAmount, DEFAULT_CURRENCY, activeLocale)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center justify-between text-sm">
              <span>{t("cart.shipping", "배송비")}</span>
              <div className="text-right">
                {finalShippingCost === 0 ? (
                  <span className="text-emerald-600 font-medium">
                    {t("cart.freeShipping", "무료배송")}
                  </span>
                ) : (
                  <span>{formatCurrency(finalShippingCost, DEFAULT_CURRENCY, activeLocale)}</span>
                )}
              </div>
            </div>

            {/* Free shipping progress */}
            {!appliedDiscount?.freeShipping && subtotalDisplay < freeShippingThreshold && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span>🚚</span>
                  <span className="text-amber-800">
                    {formatCurrency(freeShippingThreshold - subtotalDisplay, DEFAULT_CURRENCY, activeLocale)}{" "}
                    {t("cart.moreForFreeShipping", "더 주문하면 무료배송")}
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(subtotalDisplay / freeShippingThreshold) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-lg font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
                {t("cart.finalTotal", "총 결제금액")}
              </span>
              <span className="text-xl font-bold" style={{ color: "var(--mut-color-primary)" }}>
                {formatCurrency(finalTotal, DEFAULT_CURRENCY, activeLocale)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${locale}/checkout`)}
            className="btn-primary w-full"
            disabled={items.length === 0}
          >
            {t("cart.checkout", "주문하기")} ({formatCurrency(finalTotal, DEFAULT_CURRENCY, activeLocale)})
          </button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>{t("cart.secureCheckout", "안전결제")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📦</span>
              <span>{t("cart.fastDelivery", "빠른배송")}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Recommended Products Section */}
      {items.length > 0 && (
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <RecommendedProducts
            locale={locale}
            maxItems={8}
          />
        </div>
      )}
    </div>
  );
}
