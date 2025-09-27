"use client";

import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import { useI18n } from "@/providers/I18nProvider";
import { useCartStore } from "@/hooks/useCartStore";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";
import { WishlistButton } from "@/components/products/WishlistButton";
import { ProductCompareButton } from "@/components/products/ProductCompareButton";
import { SearchHighlight } from "@/components/search/SearchHighlight";

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
  searchHighlight?: {
    searchTerm: string;
    highlightName?: boolean;
    highlightCategory?: boolean;
    highlightDescription?: boolean;
  };
}

export function ProductCard({ locale, product, searchHighlight }: ProductCardProps) {
  const { t, locale: activeLocale } = useI18n();
  const { addItem } = useCartStore();

  const displayPrice = product.price;
  const originalPrice = product.priceOriginal ?? null;
  const imageSrc = resolveImageUrl(product.imageUrl, { width: 400, quality: 80 });

  const handleAddToCart = () => {
    void addItem(product.id, 1);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {imageSrc ? (
          <LazyImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            quality={80}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.halalCertified && (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              ✓ {t("products.halal")}
            </span>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Status badges */}
        {(product.isExpired || product.freshnessStatus === "EXPIRING" || product.isLowStock) && (
          <div className="absolute right-3 top-3 flex flex-col gap-1">
            {product.isExpired && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                {t("products.expired")}
              </span>
            )}
            {!product.isExpired && product.freshnessStatus === "EXPIRING" && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                {t("products.expiresSoon")}
              </span>
            )}
            {product.isLowStock && !product.isExpired && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                {t("products.lowStock")}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ProductCompareButton
            productId={product.id}
            variant="icon"
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          />
          <WishlistButton
            productId={product.id}
            variant="icon"
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
            {searchHighlight?.highlightName ? (
              <SearchHighlight
                text={product.name}
                searchTerm={searchHighlight.searchTerm}
                highlightClassName="bg-yellow-200 dark:bg-yellow-800 font-bold px-1 rounded"
              />
            ) : (
              product.name
            )}
          </h3>
          {product.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {searchHighlight?.highlightDescription ? (
                <SearchHighlight
                  text={product.description}
                  searchTerm={searchHighlight.searchTerm}
                  highlightClassName="bg-yellow-200 dark:bg-yellow-800 font-medium px-1 rounded"
                />
              ) : (
                product.description
              )}
            </p>
          )}
        </div>

        {/* Price and metadata */}
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(displayPrice, DEFAULT_CURRENCY, activeLocale)}
              </span>
              {originalPrice && originalPrice > displayPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatCurrency(originalPrice, DEFAULT_CURRENCY, activeLocale)}
                </span>
              )}
            </div>

            {/* Spice level */}
            {product.spiceLevel && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {t("products.spiceLevel")}:
                </span>
                <span className="text-sm">{"🌶️".repeat(product.spiceLevel)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("products.viewDetails")}
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.isExpired}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19a1 1 0 100 2 1 1 0 000-2zM20 19a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
