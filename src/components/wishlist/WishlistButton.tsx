"use client";

import { useState } from "react";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  productId: number;
  variant?: "icon" | "button" | "compact";
  className?: string;
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  variant = "icon",
  className = "",
  showLabel = false
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getBaseClasses = () => {
    const baseClasses = "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50";

    switch (variant) {
      case "button":
        return `${baseClasses} px-4 py-2 rounded-lg font-medium ${
          inWishlist
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`;
      case "compact":
        return `${baseClasses} p-2 rounded-md ${
          inWishlist
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-500 hover:bg-gray-100"
        }`;
      default: // icon
        return `${baseClasses} p-2 rounded-full ${
          inWishlist
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-400 hover:bg-gray-100"
        }`;
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      );
    }

    return (
      <svg
        className="w-5 h-5"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={inWishlist ? 0 : 2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    );
  };

  const getLabel = () => {
    if (!showLabel) return null;

    if (variant === "button") {
      return (
        <span className="ml-2">
          {inWishlist ? "위시리스트에서 제거" : "위시리스트에 추가"}
        </span>
      );
    }

    return null;
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${getBaseClasses()} ${className} ${
        isLoading ? "cursor-not-allowed opacity-50" : ""
      }`}
      title={inWishlist ? "위시리스트에서 제거" : "위시리스트에 추가"}
      aria-label={inWishlist ? "위시리스트에서 제거" : "위시리스트에 추가"}
    >
      <div className="flex items-center justify-center">
        {getIcon()}
        {getLabel()}
      </div>
    </button>
  );
}