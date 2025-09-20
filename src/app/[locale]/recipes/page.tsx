"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  description?: string;
  mainImageUrl?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cookingTime: number;
  servings: number;
  category?: string;
  featured: boolean;
  viewsCount: number;
  likesCount: number;
  author: {
    name: string;
  };
  _count: {
    likes: number;
  };
}

interface RecipesPageProps {
  params: Promise<{ locale: string }>;
}

export default function RecipesPage({ params }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // params is available but not currently used in UI
  void params;

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (selectedDifficulty !== "all") {
        params.append("difficulty", selectedDifficulty);
      }
      params.append("featured", "true"); // Show featured recipes first

      const response = await fetch(`/api/recipes?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const categories = [
    { key: "all", label: "전체" },
    { key: "국물요리", label: "국물요리" },
    { key: "반찬", label: "반찬" },
    { key: "메인요리", label: "메인요리" },
    { key: "간식", label: "간식" },
    { key: "음료", label: "음료" },
  ];

  const difficulties = [
    { key: "all", label: "모든 난이도" },
    { key: "EASY", label: "쉬움" },
    { key: "MEDIUM", label: "보통" },
    { key: "HARD", label: "어려움" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "MEDIUM": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "HARD": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "쉬움";
      case "MEDIUM": return "보통";
      case "HARD": return "어려움";
      default: return difficulty;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            한국 요리 레시피
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            터키에서 만드는 정통 한국 요리 레시피
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                카테고리
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === key
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                난이도
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedDifficulty === key
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="aspect-video bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-6 space-y-3">
                  <div className="bg-slate-200 rounded h-4 dark:bg-slate-700"></div>
                  <div className="bg-slate-200 rounded h-4 w-3/4 dark:bg-slate-700"></div>
                  <div className="flex gap-2">
                    <div className="bg-slate-200 rounded h-6 w-16 dark:bg-slate-700"></div>
                    <div className="bg-slate-200 rounded h-6 w-16 dark:bg-slate-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              레시피가 없습니다
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              아직 등록된 레시피가 없어요. 관리자가 곧 맛있는 레시피를 준비할 예정입니다!
            </p>
            <Link
              href="/ko/community"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              커뮤니티에서 레시피 보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/ko/recipes/${recipe.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Recipe Image */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  {recipe.mainImageUrl ? (
                    <Image
                      src={recipe.mainImageUrl}
                      alt={recipe.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-post.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {recipe.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                        추천
                      </span>
                    </div>
                  )}
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {recipe.title}
                  </h3>

                  {recipe.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.cookingTime}분
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings}인분
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {recipe._count.likes}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                    {recipe.category && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                        {recipe.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
