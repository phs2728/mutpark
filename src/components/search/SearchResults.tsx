"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchHighlight } from "./SearchHighlight";
import { EmptySearchState } from "./EmptySearchState";
import { useI18n } from "@/providers/I18nProvider";

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string | null;
  averageRating: number;
  reviewCount: number;
  category: {
    name: string;
    slug: string;
  };
  slug: string;
  stock: number;
  featured: boolean;
}

interface SearchResultsData {
  products: Product[];
  total: number;
  hasMore: boolean;
  query: string;
}

export default function SearchResults() {
  const { t, locale } = useI18n();
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [offset, setOffset] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";

  // Fetch search results
  const fetchResults = async (searchQuery: string, searchCategory: string = "all", sort: string = "relevance", resetResults: boolean = true) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    if (resetResults) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const currentOffset = resetResults ? 0 : offset;
      const params = new URLSearchParams({
        q: searchQuery,
        limit: "20",
        offset: currentOffset.toString(),
      });

      if (searchCategory !== "all") {
        params.set("category", searchCategory);
      }

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error("검색 요청에 실패했습니다");
      }

      const data = await response.json();
      if (data.success) {
        if (resetResults) {
          setResults(data.data);
        } else {
          setResults(prev => prev ? {
            ...data.data,
            products: [...prev.products, ...data.data.products]
          } : data.data);
        }
        setOffset(currentOffset + 20);
      } else {
        throw new Error(data.message || "검색 중 오류가 발생했습니다");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more results
  const loadMore = () => {
    if (query && results && results.hasMore && !loadingMore) {
      fetchResults(query, category, sortBy, false);
    }
  };

  // Load results on mount and when params change
  useEffect(() => {
    if (query) {
      fetchResults(query, category, sortBy);
    }
  }, [query, category, sortBy]);

  // Handle new search
  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    params.set("q", newQuery);

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    router.push(`/search?${params}`);
  };

  // Handle category filter
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (newCategory !== "all") params.set("category", newCategory);

    router.push(`/search?${params}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SearchBar
          onSearch={handleSearch}
          className="max-w-2xl mx-auto"
          showSuggestions={false}
        />
      </div>

      {/* Search Info & Filters */}
      {query && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t("search.resultsFor")} "<SearchHighlight
                  text={query}
                  searchTerm={query}
                  highlightClassName="bg-yellow-200 font-bold px-1 rounded"
                />"
              </h1>
              {results && (
                <p className="text-sm text-gray-600 mt-1">
                  {t("search.foundProducts", { count: results.total.toLocaleString() })}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">모든 카테고리</option>
                <option value="main-dish">메인 요리</option>
                <option value="side-dish">반찬</option>
                <option value="soup">국물 요리</option>
                <option value="dessert">디저트</option>
                <option value="beverage">음료</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="relevance">관련성순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="price-high">높은 가격순</option>
                <option value="rating">평점순</option>
                <option value="reviews">리뷰 많은순</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 오류</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchResults(query, category, sortBy)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && results && results.products.length === 0 && (
        <EmptySearchState
          query={query}
          onSuggestionClick={handleSearch}
          showAlternatives={true}
        />
      )}

      {/* Search Results */}
      {!loading && !error && results && results.products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard
                locale="ko"
                product={{
                  ...product,
                  currency: "TRY",
                  halalCertified: true,
                  imageUrl: product.image,
                  spiceLevel: 3,
                  stock: product.stock || 10,
                }}
                searchHighlight={{
                  searchTerm: query,
                  highlightName: true,
                  highlightCategory: true,
                  highlightDescription: true
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!loading && results && results.hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2"
          >
            {loadingMore ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>로딩 중...</span>
              </>
            ) : (
              <span>더 많은 상품 보기</span>
            )}
          </button>
        </div>
      )}

      {/* Empty State (No query) */}
      {!query && !loading && (
        <EmptySearchState
          onSuggestionClick={handleSearch}
          showAlternatives={true}
        />
      )}
    </div>
  );
}