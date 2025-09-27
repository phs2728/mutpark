"use client";

import { useEffect, useState } from "react";

interface RecentlyViewedProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  viewedAt: number;
}

const STORAGE_KEY = "mutpark:recently-viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedProduct[];
        setRecentlyViewed(parsed.slice(0, MAX_ITEMS));
      } catch (error) {
        console.error("Failed to parse recently viewed products:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  const addProduct = (product: Omit<RecentlyViewedProduct, "viewedAt">) => {
    setRecentlyViewed((prev) => {
      // Remove existing entry of the same product
      const filtered = prev.filter((item) => item.id !== product.id);

      // Add to beginning with current timestamp
      const newItem: RecentlyViewedProduct = {
        ...product,
        viewedAt: Date.now(),
      };

      // Keep only the most recent MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  const removeProduct = (productId: number) => {
    setRecentlyViewed((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearAll = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentlyViewed,
    addProduct,
    removeProduct,
    clearAll,
  };
}