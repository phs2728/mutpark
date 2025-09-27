"use client";

import { useEffect, useState } from "react";

interface ComparisonProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  addedAt: number;
}

const STORAGE_KEY = "mutpark:product-compare";
const MAX_COMPARE_ITEMS = 3;

export function useProductComparison() {
  const [compareList, setCompareList] = useState<ComparisonProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ComparisonProduct[];
        setCompareList(parsed.slice(0, MAX_COMPARE_ITEMS));
      } catch (error) {
        console.error("Failed to parse comparison list:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (compareList.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [compareList]);

  // Listen for global compare list updates
  useEffect(() => {
    const handleCompareListUpdate = (event: CustomEvent) => {
      const productIds = event.detail.compareList as number[];

      // Filter existing products to match the updated list
      setCompareList(prev =>
        prev.filter(product => productIds.includes(product.id))
      );
    };

    window.addEventListener("compareListUpdated", handleCompareListUpdate as EventListener);

    return () => {
      window.removeEventListener("compareListUpdated", handleCompareListUpdate as EventListener);
    };
  }, []);

  const addProduct = (product: Omit<ComparisonProduct, "addedAt">) => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      throw new Error(`Cannot add more than ${MAX_COMPARE_ITEMS} products to comparison`);
    }

    setCompareList(prev => {
      // Remove existing entry of the same product
      const filtered = prev.filter(item => item.id !== product.id);

      // Add to beginning with current timestamp
      const newItem: ComparisonProduct = {
        ...product,
        addedAt: Date.now(),
      };

      return [newItem, ...filtered];
    });
  };

  const removeProduct = (productId: number) => {
    setCompareList(prev => prev.filter(item => item.id !== productId));
  };

  const clearAll = () => {
    setCompareList([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInComparison = (productId: number) => {
    return compareList.some(item => item.id === productId);
  };

  const canAddMore = () => {
    return compareList.length < MAX_COMPARE_ITEMS;
  };

  return {
    compareList,
    addProduct,
    removeProduct,
    clearAll,
    isInComparison,
    canAddMore,
    maxItems: MAX_COMPARE_ITEMS,
    count: compareList.length,
  };
}