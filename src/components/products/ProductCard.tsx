"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { useCartStore } from "@/hooks/useCartStore";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";

interface ProductCardProps {
  locale: string;
  product: {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    imageUrl?: string | null;
    halalCertified: boolean;
    spiceLevel?: number | null;
    stock: number;
    expiryDate?: string | null;
    isExpired?: boolean;
    expiresSoon?: boolean;
    isLowStock?: boolean;
    priceOriginal?: number | null;
    discountPercentage?: number;
    discountReason?: string | null;
    freshnessStatus?: string | null;
  };
}

export function ProductCard({ locale, product }: ProductCardProps) {
  const { t, locale: activeLocale } = useI18n();
  const { addItem } = useCartStore();

  const displayPrice = product.price;
  const originalPrice = product.priceOriginal ?? null;
  const imageSrc = resolveImageUrl(product.imageUrl, { width: 400, quality: 80 });

  const handleAddToCart = () => {
    void addItem(product.id, 1);
  };

  return (
    <div className="product-card overflow-hidden">
      <div className="relative h-48 w-full" style={{ background: "var(--mut-color-background-subtle)" }}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {product.name}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.halalCertified ? <span className="badge badge-success">{t("products.halal")}</span> : null}
          {product.isExpired ? (
            <span className="badge badge-error">{t("products.expired")}</span>
          ) : product.freshnessStatus === "EXPIRING" ? (
            <span className="badge badge-warning">{t("products.expiresSoon")}</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <p className="product-card__price text-lg font-semibold">
              {formatCurrency(displayPrice, DEFAULT_CURRENCY, activeLocale)}
            </p>
            {originalPrice && originalPrice > displayPrice ? (
              <p className="text-xs line-through" style={{ color: "var(--mut-color-text-secondary)" }}>
                {formatCurrency(originalPrice, DEFAULT_CURRENCY, activeLocale)}
              </p>
            ) : null}
            {product.isExpired ? (
              <p className="text-xs font-semibold text-red-600">{t("products.expired")}</p>
            ) : null}
            {!product.isExpired && product.freshnessStatus === "EXPIRING" ? (
              <p className="text-xs font-semibold text-amber-600">{t("products.expiresSoon")}</p>
            ) : null}
            {product.discountPercentage && product.discountPercentage > 0 && !product.isExpired ? (
              <p className="text-xs font-semibold" style={{ color: "var(--mut-color-accent-free)" }}>
                {t("products.expiresSoon")} (-{product.discountPercentage}%)
              </p>
            ) : null}
            {product.isLowStock && !product.isExpired ? (
              <p className="text-xs font-medium text-amber-600">
                {t("products.lowStock")}
              </p>
            ) : null}
            {product.spiceLevel ? (
              <p className="text-xs text-orange-500">
                {t("products.spiceLevel")}: {"🌶️".repeat(product.spiceLevel)}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link href={`/${locale}/products/${product.slug}`} className="btn-outline">
              {t("products.viewDetails")}
            </Link>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={product.isExpired}
            >
              {t("products.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
