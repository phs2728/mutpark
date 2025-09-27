"use client";

import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useI18n } from "@/providers/I18nProvider";
import { resolveImageUrl } from "@/lib/imagekit";
import { formatCurrency } from "@/lib/currency";

interface RecentlyViewedProductsProps {
  locale: string;
  className?: string;
}

export function RecentlyViewedProducts({ locale, className }: RecentlyViewedProductsProps) {
  const { t } = useI18n();
  const { recentlyViewed, removeProduct, clearAll } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-4 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {t("products.recentlyViewed", "Recently Viewed")}
        </h2>
        <button
          onClick={clearAll}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          {t("common.clearAll", "Clear All")}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentlyViewed.map((product) => {
          const imageSrc = resolveImageUrl(product.imageUrl, { width: 200, quality: 75 });

          return (
            <div key={product.id} className="group relative flex-shrink-0 w-40">
              <Link href={`/${locale}/products/${product.slug}`}>
                <div className="space-y-2">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    {imageSrc ? (
                      <LazyImage
                        src={imageSrc}
                        alt={product.name}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        quality={75}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeProduct(product.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${product.name} from recently viewed`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(product.price, product.currency)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}