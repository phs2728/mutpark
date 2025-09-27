"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";
import Link from "next/link";

interface EmptySearchStateProps {
  query?: string;
  onSuggestionClick?: (suggestion: string) => void;
  showAlternatives?: boolean;
}

interface PopularSearch {
  term: string;
  count: number;
}

interface CategorySuggestion {
  name: string;
  slug: string;
  icon: string;
}

export function EmptySearchState({
  query,
  onSuggestionClick,
  showAlternatives = true
}: EmptySearchStateProps) {
  const { t } = useI18n();
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAlternatives) {
      fetchPopularSearches();
      fetchCategories();
    }
  }, [showAlternatives]);

  const fetchPopularSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/search/popular');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPopularSearches(data.data.searches.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories.slice(0, 8));
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const getSearchTips = () => [
    t("search.tips.spelling"),
    t("search.tips.shorter"),
    t("search.tips.synonyms"),
    t("search.tips.categories")
  ];

  const defaultCategories: CategorySuggestion[] = [
    { name: "김치", slug: "kimchi", icon: "🥬" },
    { name: "라면", slug: "ramen", icon: "🍜" },
    { name: "고기", slug: "meat", icon: "🥩" },
    { name: "쌀", slug: "rice", icon: "🍚" },
    { name: "소스", slug: "sauce", icon: "🥄" },
    { name: "과자", slug: "snacks", icon: "🍘" },
    { name: "음료", slug: "drinks", icon: "🥤" },
    { name: "조미료", slug: "seasoning", icon: "🧂" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
      {/* Main Message */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {query ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("search.noResults")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("search.noResultsFor", { query: `"${query}"` })}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("search.startSearching")}
            </h2>
            <p className="text-gray-600">
              {t("search.startSearchingDescription")}
            </p>
          </div>
        )}
      </div>

      {/* Search Tips */}
      {query && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            💡 {t("search.tipsTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-200">
            {getSearchTips().map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Searches */}
      {showAlternatives && popularSearches.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            🔥 {t("search.popularSearches")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <button
                key={search.term}
                onClick={() => onSuggestionClick?.(search.term)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors duration-200"
              >
                {search.term} ({search.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Suggestions */}
      {showAlternatives && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">
            📂 {t("search.browseCategories")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(categories.length > 0 ? categories : defaultCategories).map((category) => (
              <button
                key={category.slug}
                onClick={() => onSuggestionClick?.(category.name)}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            🏠 {t("search.backToHome")}
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors duration-200"
          >
            🛍️ {t("search.allProducts")}
          </Link>
        </div>
      </div>
    </div>
  );
}