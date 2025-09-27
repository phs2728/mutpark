"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductReviews } from "@/components/products/ProductReviews";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductNutritionInfo } from "@/components/products/ProductNutritionInfo";
import { ProductStockStatus } from "@/components/products/ProductStockStatus";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { WishlistButton } from "@/components/products/WishlistButton";
import { useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";

interface ProductDetailProps {
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
    brand?: string | null;
    category?: string | null;
    expiryDate?: string | null;
    isExpired?: boolean;
    expiresSoon?: boolean;
    isLowStock?: boolean;
    priceOriginal?: number | null;
    discountPercentage?: number;
    discountReason?: string | null;
    metadata?: Record<string, unknown> | null;
    freshnessStatus?: string | null;
  };
  related: Array<{
    id: number;
    slug: string;
    name: string;
    price: number;
    currency: string;
  }>;
  currentUserId?: number | null;
}

type DetailTab = "details" | "ingredients" | "nutrition" | "recipes";

function renderContent(value: unknown, emptyFallback: string): ReactNode {
  if (value === null || value === undefined) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">{emptyFallback}</p>;
  }

  if (typeof value === "string") {
    return <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{value}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-slate-500 dark:text-slate-300">{emptyFallback}</p>;
    }
    if (value.every((item) => typeof item === "string")) {
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {renderContent(item, emptyFallback)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <p className="text-sm text-slate-500 dark:text-slate-300">{emptyFallback}</p>;
    }
    return (
      <dl className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        {entries.map(([key, val]) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="font-semibold capitalize text-slate-500 dark:text-slate-400">{key}</dt>
            <dd>{renderContent(val, emptyFallback)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p className="text-sm text-slate-600 dark:text-slate-300">{String(value)}</p>;
}

export function ProductDetail({ locale, product, related, currentUserId }: ProductDetailProps) {
  const { t, locale: activeLocale } = useI18n();
  const [activeTab, setActiveTab] = useState<DetailTab>("details");

  const metadata = useMemo(() => (product.metadata ?? {}) as Record<string, unknown>, [product.metadata]);
  const detailsContent = useMemo(
    () => (
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>{product.description}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {product.brand ? (
            <div>
              <p className="text-xs uppercase text-slate-400">{t("productDetail.brand")}</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">{product.brand}</p>
            </div>
          ) : null}
          {product.category ? (
            <div>
              <p className="text-xs uppercase text-slate-400">{t("productDetail.category")}</p>
              <p className="font-medium text-slate-700 dark:text-slate-200">{product.category}</p>
            </div>
          ) : null}
        </div>
      </div>
    ),
    [product.description, product.brand, product.category, t],
  );

  const emptyFallback = t("productDetail.empty");
  const ingredientsContent = renderContent(metadata["ingredients"], emptyFallback);
  const nutritionContent = renderContent(metadata["nutrition"], emptyFallback);
  const recipesContent = renderContent(metadata["recipes"], emptyFallback);

  const tabContent: Record<DetailTab, React.ReactNode> = {
    details: detailsContent,
    ingredients: ingredientsContent,
    nutrition: nutritionContent,
    recipes: recipesContent,
  };

  const tabs = useMemo(
    () => [
      { id: "details" as const, label: t("productDetail.details") },
      { id: "ingredients" as const, label: t("productDetail.ingredients") },
      { id: "nutrition" as const, label: t("productDetail.nutrition") },
      { id: "recipes" as const, label: t("productDetail.recipes") },
    ],
    [t],
  );

  // 이미지 갤러리용 이미지 배열 생성
  const galleryImages = product.imageUrl
    ? [{ url: product.imageUrl, altText: product.name }]
    : [];

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {/* 개선된 이미지 갤러리 */}
          <div className="card overflow-hidden">
            <ProductImageGallery
              images={galleryImages}
              productName={product.name}
            />
          </div>

          {/* 영양 정보 및 인증 정보 */}
          <div className="card p-6">
            <ProductNutritionInfo
              nutrition={metadata.nutrition as any}
              halalCertified={product.halalCertified}
              metadata={metadata}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* 상품 기본 정보 */}
          <div className="space-y-4 p-6">
            <h1 className="text-3xl font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
              {product.name}
            </h1>
            <p className="text-lg" style={{ color: "var(--mut-color-text-secondary)" }}>
              {product.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <>
                <span className="text-2xl font-bold" style={{ color: "var(--mut-color-primary)" }}>
                  {formatCurrency(product.price, DEFAULT_CURRENCY, activeLocale)}
                </span>
                {product.priceOriginal && product.priceOriginal > product.price ? (
                  <span className="text-lg font-semibold line-through" style={{ color: "var(--mut-color-text-secondary)" }}>
                    {formatCurrency(product.priceOriginal, DEFAULT_CURRENCY, activeLocale)}
                  </span>
                ) : null}
              </>
              {product.spiceLevel ? (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                  {t("products.spiceLevel")}: {"🌶️".repeat(product.spiceLevel)}
                </span>
              ) : null}
            </div>
            {product.discountPercentage && product.discountPercentage > 0 && !product.isExpired ? (
              <p className="text-sm font-medium text-emerald-600">
                {t("products.discount")} (-{product.discountPercentage}%)
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <AddToCartButton
                productId={product.id}
                className="px-8 py-3 text-base"
                disabled={product.isExpired}
              >
                {t("productDetail.actions.addToCart")}
              </AddToCartButton>
              <Link
                href={`/${locale}/checkout?productId=${product.id}`}
                className="rounded-full border border-emerald-500 px-8 py-3 text-base font-semibold text-emerald-600 hover:bg-emerald-50"
              >
                {t("productDetail.actions.checkout")}
              </Link>
              <WishlistButton
                productId={product.id}
                variant="button"
                className="px-8 py-3 text-base"
              />
            </div>
            {product.isExpired ? (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t("products.expired")}
              </p>
            ) : null}
          </div>
          {/* 실시간 재고 상태 */}
          <div className="card p-6">
            <ProductStockStatus
              stock={product.stock}
              isLowStock={product.isLowStock}
              isExpired={product.isExpired}
              expiryDate={product.expiryDate}
              freshnessStatus={product.freshnessStatus}
              productId={product.id}
              productName={product.name}
            />
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <RelatedProducts productId={product.id} locale={locale} />
        </aside>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          {tabContent[activeTab]}
        </div>
      </section>
      <ProductReviews productId={product.id} locale={locale} currentUserId={currentUserId} />
    </div>
  );
}
