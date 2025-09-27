"use client";

import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";

interface ProductCompareButtonProps {
  productId: number;
  isInComparison?: boolean;
  onToggle?: (productId: number, isInComparison: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
}

export function ProductCompareButton({
  productId,
  isInComparison = false,
  onToggle,
  className = "",
  size = "md",
  variant = "icon"
}: ProductCompareButtonProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [inComparison, setInComparison] = useState(isInComparison);

  const handleToggleComparison = async () => {
    setIsLoading(true);
    try {
      // 로컬 스토리지를 사용한 간단한 비교 목록 관리
      const compareKey = "mutpark:product-compare";
      const existing = JSON.parse(localStorage.getItem(compareKey) || "[]") as number[];

      let newCompareList: number[];
      if (inComparison) {
        newCompareList = existing.filter(id => id !== productId);
      } else {
        // 최대 3개까지만 비교 가능
        if (existing.length >= 3) {
          alert(t("compare.maxItemsReached", "You can compare up to 3 products"));
          return;
        }
        newCompareList = [...existing, productId];
      }

      localStorage.setItem(compareKey, JSON.stringify(newCompareList));

      const newState = !inComparison;
      setInComparison(newState);
      onToggle?.(productId, newState);

      // 전역 상태 업데이트 이벤트 발송
      window.dispatchEvent(new CustomEvent("compareListUpdated", {
        detail: { compareList: newCompareList }
      }));

    } catch (error) {
      console.error("Product comparison toggle error:", error);
      alert(t("notifications.error", "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleComparison}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          inComparison
            ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        } ${className}`}
        title={inComparison ? t("compare.removeFromComparison", "Remove from Comparison") : t("compare.addToComparison", "Add to Comparison")}
      >
        {isLoading ? (
          <div className={`${iconSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
        ) : (
          <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleComparison}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        inComparison
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      } ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )}
      <span>
        {inComparison
          ? t("compare.removeFromComparison", "Remove from Comparison")
          : t("compare.addToComparison", "Add to Comparison")
        }
      </span>
    </button>
  );
}