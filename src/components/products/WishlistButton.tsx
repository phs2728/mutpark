"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

interface WishlistButtonProps {
  productId: number;
  isInWishlist?: boolean;
  onToggle?: (productId: number, isInWishlist: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
}

export function WishlistButton({
  productId,
  isInWishlist = false,
  onToggle,
  className = "",
  size = "md",
  variant = "icon"
}: WishlistButtonProps) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);

  const handleToggleWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: inWishlist ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const newState = !inWishlist;
        setInWishlist(newState);
        onToggle?.(productId, newState);
      } else if (response.status === 401) {
        // Redirect to login with correct locale
        const locale = params.locale || 'ko';
        router.push(`/${locale}/auth/login`);
      } else {
        throw new Error("Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
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
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          inWishlist
            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        } ${className}`}
        title={inWishlist ? t("wishlist.removeFromWishlist", "Remove from Wishlist") : t("wishlist.addToWishlist", "Add to Wishlist")}
      >
        {isLoading ? (
          <div className={`${iconSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
        ) : (
          <svg className={iconSizes[size]} fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={inWishlist ? 0 : 2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        inWishlist
          ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      } ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={inWishlist ? 0 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      <span>
        {inWishlist
          ? t("wishlist.removeFromWishlist", "Remove from Wishlist")
          : t("wishlist.addToWishlist", "Add to Wishlist")
        }
      </span>
    </button>
  );
}