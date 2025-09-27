"use client";

import { ReactNode } from "react";

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

export function SearchHighlight({
  text,
  searchTerm,
  className = "",
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 font-semibold rounded px-1"
}: SearchHighlightProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isHighlight = regex.test(part);
        return isHighlight ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </span>
  );
}

interface SearchResultCardProps {
  product: any;
  searchTerm: string;
  locale: string;
}

export function SearchResultCard({ product, searchTerm, locale }: SearchResultCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">
            <SearchHighlight
              text={product.name}
              searchTerm={searchTerm}
              highlightClassName="bg-yellow-200 dark:bg-yellow-800 font-bold px-1 rounded"
            />
          </h3>

          {product.category && (
            <p className="text-sm text-gray-500">
              <SearchHighlight
                text={product.category.name}
                searchTerm={searchTerm}
                highlightClassName="bg-blue-100 dark:bg-blue-800 font-medium px-1 rounded"
              />
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-red-600">
              {product.price?.toLocaleString()} TRY
            </span>

            {product.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-orange-600 font-medium">
              재고 부족 (남은 수량: {product.stock}개)
            </p>
          )}

          {product.stock === 0 && (
            <p className="text-xs text-red-600 font-medium">품절</p>
          )}
        </div>
      </div>
    </div>
  );
}