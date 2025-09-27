"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

interface WishlistProduct {
  id: number;
  sku: string;
  slug: string;
  baseName: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl?: string;
  translations: Array<{
    language: string;
    name: string;
    description?: string;
  }>;
  images: Array<{
    url: string;
    altText?: string;
    isMain: boolean;
  }>;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

export function useWishlist(): UseWishlistReturn {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  // Fetch wishlist items
  const refreshWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/wishlist");
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          setWishlistItems([]);
          return;
        }
        throw new Error(result.message || "위시리스트 조회 실패");
      }

      if (result.success) {
        setWishlistItems(result.data);
      } else {
        throw new Error(result.message || "위시리스트 조회 실패");
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setError(err instanceof Error ? err.message : "위시리스트 조회 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: number): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  // Add product to wishlist
  const addToWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, redirect to login with correct locale
          const locale = params.locale || 'ko';
          router.push(`/${locale}/auth/login`);
          return false;
        }
        throw new Error(result.message || "위시리스트 추가 실패");
      }

      if (result.success) {
        // Add the new item to the local state
        setWishlistItems(prev => [result.data, ...prev]);
        return true;
      } else {
        throw new Error(result.message || "위시리스트 추가 실패");
      }
    } catch (err) {
      console.error("Add to wishlist error:", err);
      setError(err instanceof Error ? err.message : "위시리스트 추가 중 오류가 발생했습니다");
      return false;
    }
  }, [router, params]);

  // Remove product from wishlist
  const removeFromWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, redirect to login with correct locale
          const locale = params.locale || 'ko';
          router.push(`/${locale}/auth/login`);
          return false;
        }
        throw new Error(result.message || "위시리스트 제거 실패");
      }

      if (result.success) {
        // Remove the item from the local state
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        return true;
      } else {
        throw new Error(result.message || "위시리스트 제거 실패");
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      setError(err instanceof Error ? err.message : "위시리스트 제거 중 오류가 발생했습니다");
      return false;
    }
  }, [router, params]);

  // Load wishlist on mount
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return {
    wishlistItems,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
    wishlistCount: wishlistItems.length,
  };
}