"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { ProductCard } from "./ProductCard";

interface RecommendedProduct {
  id: number;
  slug: string;
  baseName: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  halalCertified: boolean;
  spiceLevel?: number | null;
  stock: number;
  freshnessStatus?: string | null;
  priceOriginal?: number | null;
  discountPercentage?: number;
  discountReason?: string | null;
  translations: any[];
  averageRating: number;
  recommendationReason: string;
  score: number;
}

interface RecommendedProductsProps {
  locale: string;
  title?: string;
  maxItems?: number;
}

export function RecommendedProducts({
  locale,
  title = "추천 상품",
  maxItems = 8
}: RecommendedProductsProps) {
  const { t } = useI18n();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<string>("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations?limit=${maxItems}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setProducts(data.products || []);
      setRecommendationType(data.type || "");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedProductName = (product: RecommendedProduct) => {
    const translation = product.translations?.find(t => t.language === locale);
    return translation?.name || product.baseName;
  };

  const getLocalizedDescription = (product: RecommendedProduct) => {
    const translation = product.translations?.find(t => t.language === locale);
    return translation?.description;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 rounded-xl h-48 dark:bg-slate-700"></div>
              <div className="mt-4 space-y-2">
                <div className="bg-slate-200 rounded h-4 dark:bg-slate-700"></div>
                <div className="bg-slate-200 rounded h-4 w-3/4 dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {recommendationType === "personalized"
              ? "회원님의 취향을 분석한 맞춤 추천"
              : "인기 상품 추천"
            }
          </p>
        </div>

        <Link
          href={`/${locale}/products`}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard
              locale={locale}
              product={{
                id: product.id,
                slug: product.slug,
                name: getLocalizedProductName(product),
                description: getLocalizedDescription(product),
                price: product.price,
                currency: product.currency,
                imageUrl: product.imageUrl,
                halalCertified: product.halalCertified,
                spiceLevel: product.spiceLevel,
                stock: product.stock,
                freshnessStatus: product.freshnessStatus,
                priceOriginal: product.priceOriginal,
                discountPercentage: product.discountPercentage,
                discountReason: product.discountReason,
              }}
            />

            {/* Recommendation reason badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {product.recommendationReason}
              </span>
            </div>

            {/* Rating display */}
            {product.averageRating > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}