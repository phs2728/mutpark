"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { useI18n } from "@/providers/I18nProvider";

interface ProductGridProps {
  locale: string;
  products: Array<{
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
    freshnessStatus?: string | null;
    expiryDate?: string | null;
    isExpired?: boolean;
    expiresSoon?: boolean;
    isLowStock?: boolean;
    priceOriginal?: number | null;
    discountPercentage?: number;
    discountReason?: string | null;
  }>;
  meta?: {
    total: number;
    sort: string;
    page: number;
    pageSize: number;
  };
}

const sortLabels: Record<string, string> = {
  newest: "products.filters.sortNewest",
  "price-asc": "products.filters.sortPriceAsc",
  "price-desc": "products.filters.sortPriceDesc",
};

export function ProductGrid({ locale, products, meta }: ProductGridProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      {meta ? (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <span>{t("products.resultsCount").replace("{count}", meta.total.toString())}</span>
          <span className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-400">{t("products.filters.sortLabel", "Sort")}</span>
            <SortLabel sortKey={meta.sort} />
          </span>
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} locale={locale} product={product} />
        ))}
      </div>
    </div>
  );
}

function SortLabel({ sortKey }: { sortKey: string }) {
  const { t } = useI18n();
  const labelKey = sortLabels[sortKey] ?? sortLabels.newest;
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{t(labelKey)}</span>;
}
