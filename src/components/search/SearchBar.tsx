"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchSuggestion {
  id: number;
  name: string;
  category: {
    name: string;
    slug: string;
  };
  price: number;
  image: string | null;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showSuggestions?: boolean;
}

export default function SearchBar({
  placeholder = "한국 음식을 검색해보세요...",
  onSearch,
  className = "",
  showSuggestions = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2 || !showSuggestions) {
        setSuggestions([]);
        setShowSuggestionsList(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data?.products || []);
          setShowSuggestionsList(data.data?.products?.length > 0);
        }
      } catch (error) {
        console.error("검색 제안을 가져오는 중 오류:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, showSuggestions]);

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setShowSuggestionsList(false);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedSuggestion = suggestions[selectedIndex];
          router.push(`/products/${selectedSuggestion.id}`);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestionsList(false);
    router.push(`/products/${suggestion.id}`);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionListRef.current &&
        !suggestionListRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestionsList(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
        />

        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Loading/Search Button */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <button
              onClick={() => handleSearch()}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionListRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? "bg-red-50 border-red-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {suggestion.image && (
                  <img
                    src={suggestion.image}
                    alt={suggestion.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestion.category.name}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {suggestion.price.toLocaleString()}원
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* View All Results */}
          <div
            onClick={() => handleSearch()}
            className="px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border-t"
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>&quot;{query}&quot; 모든 검색 결과 보기</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}