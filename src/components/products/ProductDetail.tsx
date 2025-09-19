"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { useMemo, useState, type ReactNode } from "react";
import { useCurrency } from "@/providers/CurrencyProvider";
import { isCurrency } from "@/lib/currency";
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

export function ProductDetail({ locale, product, related }: ProductDetailProps) {
  const { t, locale: activeLocale } = useI18n();
  const { currency: displayCurrency, convert } = useCurrency();
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

  const mainImage = resolveImageUrl(product.imageUrl, { width: 800, quality: 85 });

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="card overflow-hidden">
          <div className="relative h-96 w-full" style={{ background: "var(--mut-color-background-subtle)" }}>
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                {product.name}
              </div>
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.halalCertified ? <span className="badge badge-success">{t("products.halal")}</span> : null}
              {product.isExpired ? (
                <span className="badge badge-error">{t("products.expired")}</span>
              ) : product.freshnessStatus === "EXPIRING" ? (
                <span className="badge badge-warning">{t("products.expiresSoon")}</span>
              ) : null}
            </div>
          </div>
          <div className="space-y-4 p-6">
            <h1 className="text-3xl font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
              {product.name}
            </h1>
            <p className="text-lg" style={{ color: "var(--mut-color-text-secondary)" }}>
              {product.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {(() => {
                const baseCurrency = isCurrency(product.currency) ? product.currency : displayCurrency;
                const priceValue = convert(product.price, baseCurrency);
                const originalValue =
                  product.priceOriginal && product.priceOriginal > product.price
                    ? convert(product.priceOriginal, baseCurrency)
                    : null;
                return (
                  <>
                    <span className="text-2xl font-bold" style={{ color: "var(--mut-color-primary)" }}>
                      {priceValue.toLocaleString(activeLocale, {
                        style: "currency",
                        currency: displayCurrency,
                        minimumFractionDigits: 0,
                      })}
                    </span>
                    {originalValue && originalValue > priceValue ? (
                      <span className="text-lg font-semibold line-through" style={{ color: "var(--mut-color-text-secondary)" }}>
                        {originalValue.toLocaleString(activeLocale, {
                          style: "currency",
                          currency: displayCurrency,
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    ) : null}
                  </>
                );
              })()}
              {product.spiceLevel ? (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                  {t("products.spiceLevel")}: {"🌶️".repeat(product.spiceLevel)}
                </span>
              ) : null}
              <span className="chip" style={{ background: "var(--mut-color-secondary)", border: "none" }}>
                {t("products.stock")}: {product.stock}
              </span>
              {product.isLowStock && !product.isExpired ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  {t("products.lowStock")}
                </span>
              ) : null}
              {product.isExpired ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-300">
                  {t("products.expired")}
                </span>
              ) : null}
              {!product.isExpired && product.freshnessStatus === "EXPIRING" ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                  {t("products.expiresSoon")}
                </span>
              ) : null}
            </div>
            {product.discountPercentage && product.discountPercentage > 0 && !product.isExpired ? (
              <p className="text-sm font-medium text-emerald-600">
                {t("products.expiresSoon")} (-{product.discountPercentage}%)
              </p>
            ) : null}
            {product.expiryDate ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {t("products.expiryDate", "Expiry date")}: {new Date(product.expiryDate).toLocaleDateString(locale)}
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
            </div>
            {product.isExpired ? (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t("products.expired")}
              </p>
            ) : null}
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("products.featured")}</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/products/${item.slug}`}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 hover:border-emerald-200 dark:hover:border-emerald-500"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="text-sm font-semibold text-emerald-500">
                  {(() => {
                    const base = isCurrency(item.currency) ? item.currency : displayCurrency;
                    const value = convert(item.price, base);
                    return value.toLocaleString(activeLocale, {
                      style: "currency",
                      currency: displayCurrency,
                      minimumFractionDigits: 0,
                    });
                  })()}
                </span>
              </Link>
            ))}
          </div>
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
    </div>
  );
}
