"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  halalCertified: boolean;
  spiceLevel?: number | null;
  stock: number;
  category?: string | null;
  brand?: string | null;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

interface RelatedProductsProps {
  productId: number;
  locale: string;
}

export function RelatedProducts({ productId, locale }: RelatedProductsProps) {
  const { t, locale: activeLocale } = useI18n();
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productId}/related`);
        if (!response.ok) {
          throw new Error('관련 상품을 불러올 수 없습니다');
        }

        const result = await response.json();
        if (result.success) {
          setProducts(result.data.products);
        } else {
          throw new Error(result.message || '관련 상품 조회 실패');
        }
      } catch (err) {
        console.error('Related products fetch error:', err);
        setError(err instanceof Error ? err.message : '관련 상품 로딩 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  const getProductName = (product: RelatedProduct) => {
    const translation = product.translations.find(t => t.language === activeLocale);
    return translation?.name || product.name;
  };

  const getProductImage = (product: RelatedProduct) => {
    return resolveImageUrl(product.imageUrl, { width: 300, height: 300, quality: 80 });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("products.related")}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">관련 상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        🔄 {t("products.related")} ({products.length})
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const imageSrc = getProductImage(product);

          return (
            <div key={product.id} className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                <Link href={`/${locale}/products/${product.slug}`}>
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={getProductName(product)}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.halalCertified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✓ 할랄
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-2 right-2">
                  <WishlistButton
                    productId={product.id}
                    variant="icon"
                    className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <Link href={`/${locale}/products/${product.slug}`}>
                  <h4 className="font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2 text-sm mb-2">
                    {getProductName(product)}
                  </h4>
                </Link>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-600 text-sm">
                    {formatCurrency(product.price, DEFAULT_CURRENCY, activeLocale)}
                  </span>

                  <div className="flex items-center gap-1">
                    {product.spiceLevel && (
                      <span className="text-xs">
                        {"🌶️".repeat(Math.min(product.spiceLevel, 3))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {product.stock > 0 ? "재고 있음" : "품절"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}