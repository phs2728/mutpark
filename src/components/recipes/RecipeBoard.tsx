"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/providers/I18nProvider";
import { resolveImageUrl } from "@/lib/imagekit";

interface Recipe {
  id: number;
  slug: string;
  title: string;
  mainImageUrl?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cookingTime: number;
  servings: number;
  dietaryTags?: string[];
  koreanOrigin: boolean;
  turkeyAdapted: boolean;
  likesCount: number;
  publishedAt?: string | null;
  author: {
    id: number;
    name: string;
  };
  _count: {
    likes: number;
  };
}

interface RecipeBoardProps {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

const difficultyColors = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function RecipeBoard({ locale, searchParams }: RecipeBoardProps) {
  const { t } = useI18n();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    search: (searchParams.search as string) || "",
    difficulty: (searchParams.difficulty as string) || "",
    featured: searchParams.featured === "true",
  });

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.featured && { featured: "true" }),
      });

      const response = await fetch(`/api/recipes?${params}`);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const data = await response.json();
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-200 rounded-xl h-48 dark:bg-slate-700"></div>
            <div className="mt-4 space-y-2">
              <div className="bg-slate-200 rounded h-4 dark:bg-slate-700"></div>
              <div className="bg-slate-200 rounded h-4 w-3/4 dark:bg-slate-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder={t("recipes.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange({ difficulty: e.target.value })}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all duration-200"
          >
            <option value="">{t("recipes.allDifficulties")}</option>
            <option value="EASY">{t("recipes.difficulty.easy")}</option>
            <option value="MEDIUM">{t("recipes.difficulty.medium")}</option>
            <option value="HARD">{t("recipes.difficulty.hard")}</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange({ featured: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("recipes.featuredOnly")}
            </span>
          </label>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          {pagination.total}개의 레시피
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-400 text-lg mb-2">{t("recipes.noRecipes")}</div>
          <div className="text-slate-500 text-sm">새로운 레시피를 기다리고 있습니다</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/${locale}/recipes/${recipe.slug}`}
              className="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 shadow-lg"
            >
              {/* Recipe Image */}
              <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                {recipe.mainImageUrl ? (
                  <Image
                    src={resolveImageUrl(recipe.mainImageUrl, { width: 400, quality: 80 }) || '/default-recipe.jpg'}
                    alt={recipe.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879a3 3 0 014.242 0L18 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${difficultyColors[recipe.difficulty]}`}>
                    {t(`recipes.difficulty.${recipe.difficulty.toLowerCase()}`)}
                  </span>
                  {recipe.koreanOrigin && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-lg backdrop-blur-sm">
                      🇰🇷 한국 전통
                    </span>
                  )}
                  {recipe.turkeyAdapted && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-lg backdrop-blur-sm">
                      🇹🇷 터키 현지화
                    </span>
                  )}
                </div>
              </div>

              {/* Recipe Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-3">
                  {recipe.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(recipe.cookingTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings}인분
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    by {recipe.author.name}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {recipe.likesCount}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={!pagination.hasPrev}
            className="px-6 py-3 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            이전
          </button>

          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={!pagination.hasNext}
            className="px-6 py-3 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}