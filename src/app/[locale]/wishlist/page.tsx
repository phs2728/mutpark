"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import Link from "next/link";

interface ProductTranslation {
  language: string;
  name: string;
  description?: string;
}

interface ProductImage {
  url: string;
  altText?: string;
  isMain: boolean;
}

interface WishlistProduct {
  id: number;
  sku: string;
  slug: string;
  baseName: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl?: string;
  translations: ProductTranslation[];
  images: ProductImage[];
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}

export default function WishlistPage() {
  const { wishlistItems, loading, error, removeFromWishlist } = useWishlist();
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      // Redirect to login with correct locale
      const locale = params.locale || 'ko';
      router.push(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, router, params]);

  if (isAuthenticated === null) {
    // Loading auth check
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  const getProductName = (product: WishlistProduct, locale: string = "ko") => {
    const translation = product.translations.find(t => t.language === locale);
    return translation?.name || product.baseName;
  };

  const getProductImage = (product: WishlistProduct) => {
    const mainImage = product.images.find(img => img.isMain);
    return mainImage?.url || product.imageUrl || "/placeholder-product.jpg";
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const locale = (params.locale as string) || 'ko';

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="korean-gradient-mountain rounded-2xl p-6 text-white shadow-lg">
            <h1 className="text-2xl font-bold">💖 위시리스트</h1>
            <p className="text-white/80 mt-2">마음에 드는 상품들을 저장해보세요</p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="korean-gradient-mountain rounded-2xl p-6 text-white shadow-lg">
            <h1 className="text-2xl font-bold">💖 위시리스트</h1>
            <p className="text-white/80 mt-2">마음에 드는 상품들을 저장해보세요</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="korean-gradient-mountain rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">💖 위시리스트</h1>
              <p className="text-white/80 mt-2">
                마음에 드는 상품들을 저장해보세요 ({wishlistItems.length}개)
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Link
                href={`/${locale}`}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                쇼핑 계속하기
              </Link>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">위시리스트가 비어있습니다</h3>
            <p className="text-gray-600 mb-6">
              마음에 드는 상품들을 위시리스트에 추가해보세요
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative">
                  <Link href={`/${locale}/products/${item.product.slug}`}>
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={getProductImage(item.product)}
                        alt={getProductName(item.product, locale)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2">
                    <WishlistButton
                      productId={item.product.id}
                      variant="icon"
                      className="bg-white shadow-md"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <Link href={`/${locale}/products/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-2">
                      {getProductName(item.product, locale)}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(item.product.price, item.product.currency)}
                    </span>
                    <span className={`text-sm ${
                      item.product.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {item.product.stock > 0 ? "재고 있음" : "품절"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/${locale}/products/${item.product.slug}`}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors text-center"
                    >
                      상품 보기
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      title="위시리스트에서 제거"
                    >
                      제거
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-xs text-gray-500">
                    추가일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}