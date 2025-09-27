"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { ProductCard } from "./ProductCard";
import Link from "next/link";

interface PopularProduct {
  id: number;
  slug: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  discountPrice?: number;
  stock: number;
  category: string;
  images: string;
  halalCertified: boolean;
  spiceLevel: number;
  averageRating: number;
  reviewCount: number;
  popularityScore: number;
}

interface PopularProductsProps {
  locale: string;
  maxItems?: number;
  showTitle?: boolean;
  className?: string;
}

export function PopularProducts({
  locale,
  maxItems = 8,
  showTitle = true,
  className = ""
}: PopularProductsProps) {
  const { t } = useI18n();
  const [products, setProducts] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/products/popular?limit=${maxItems}&locale=${locale}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch popular products: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.products) {
          setProducts(data.data.products);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching popular products:", err);
        setError(err instanceof Error ? err.message : "Failed to load popular products");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, [locale, maxItems]);

  if (loading) {
    return (
      <section className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between">
            <div className="h-8 bg-slate-200 rounded w-48 animate-pulse dark:bg-slate-700"></div>
            <div className="h-6 bg-slate-200 rounded w-24 animate-pulse dark:bg-slate-700"></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: Math.min(maxItems, 8) }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="bg-slate-200 rounded-xl h-48 animate-pulse dark:bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse dark:bg-slate-700"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse dark:bg-slate-700"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`space-y-6 ${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("products.popular", "Popular Products")}
          </h2>
        )}
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>{t("notifications.error", "Something went wrong. Please try again.")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-emerald-600 hover:text-emerald-700 underline"
          >
            {t("common.retry", "Try again")}
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={`space-y-6 ${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("products.popular", "Popular Products")}
          </h2>
        )}
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>{t("products.empty", "No products have been added yet.")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("products.popular", "Popular Products")}
            </h2>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full dark:bg-emerald-900 dark:text-emerald-200">
              {t("products.trending", "Trending")}
            </span>
          </div>
          <Link
            href={`/${locale}/products?sort=popular`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
          >
            {t("account.viewAll", "View All")}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div key={product.id} className="relative">
            {/* Popularity badge for top 3 */}
            {index < 3 && (
              <div className="absolute top-2 left-2 z-10">
                <div className={`px-2 py-1 text-xs font-bold rounded-full text-white shadow-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                  'bg-gradient-to-r from-amber-400 to-amber-600'
                }`}>
                  #{index + 1}
                </div>
              </div>
            )}

            {/* Rating badge */}
            {product.averageRating > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium shadow-md">
                  <span className="text-yellow-500">⭐</span>
                  <span>{product.averageRating.toFixed(1)}</span>
                  <span className="text-slate-500">({product.reviewCount})</span>
                </div>
              </div>
            )}

            <ProductCard
              product={product}
              locale={locale}
              showQuickActions={true}
            />
          </div>
        ))}
      </div>

      {/* Popular categories quick links */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("products.popularCategories", "Popular Categories")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Kimchi", emoji: "🥬", category: "SideDish" },
              { name: "Ramen", emoji: "🍜", category: "Noodles" },
              { name: "Sauce", emoji: "🥄", category: "Sauce" },
              { name: "Snacks", emoji: "🍿", category: "Snack" },
              { name: "Drinks", emoji: "🥤", category: "Beverage" },
            ].map((item) => (
              <Link
                key={item.category}
                href={`/${locale}/products?category=${item.category}`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:border-emerald-300 hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}