"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { resolveImageUrl } from "@/lib/imagekit";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface Recipe {
  id: number;
  slug: string;
  title: string;
  content: unknown;
  mainImageUrl?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cookingTime: number;
  servings: number;
  dietaryTags?: string[];
  koreanOrigin: boolean;
  turkeyAdapted: boolean;
  likesCount: number;
  isLiked: boolean;
  publishedAt?: string | null;
  author: {
    id: number;
    name: string;
  };
  ingredients: Array<{
    id: number;
    name: string;
    quantity: string;
    unit?: string | null;
    isEssential: boolean;
    alternatives?: unknown;
    product?: {
      id: number;
      slug: string;
      baseName: string;
      translations: unknown[];
      price: number;
      currency: string;
      imageUrl?: string | null;
      halalCertified: boolean;
      stock: number;
    } | null;
  }>;
}

interface RecipeDetailProps {
  recipe: Recipe;
  locale: string;
}

const difficultyColors = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function RecipeDetail({ recipe, locale }: RecipeDetailProps) {
  const { t, locale: activeLocale } = useI18n();
  const [liked, setLiked] = useState(recipe.isLiked);
  const [likesCount, setLikesCount] = useState(recipe.likesCount);
  const [liking, setLiking] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  const handleLikeToggle = async () => {
    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/recipes/${recipe.slug}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLiking(false);
    }
  };

  const renderContent = (content: unknown) => {
    if (typeof content === 'string') {
      return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    if (content && typeof content === 'object' && 'blocks' in content && content.blocks) {
      return (
        <div className="space-y-4">
          {(content as Record<string, unknown>).blocks && Array.isArray((content as Record<string, unknown>).blocks) ? ((content as Record<string, unknown>).blocks as unknown[]).map((block: unknown, index: number) => {
            const blockData = block as Record<string, unknown>;
            switch (blockData.type) {
              case 'paragraph':
                return (
                  <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {(blockData.data as Record<string, unknown>).text as string}
                  </p>
                );
              case 'header':
                const HeaderTag = `h${(blockData.data as Record<string, unknown>).level}` as keyof React.JSX.IntrinsicElements;
                return (
                  <HeaderTag key={index} className="font-bold text-slate-900 dark:text-white mt-6 mb-3">
                    {(blockData.data as Record<string, unknown>).text as string}
                  </HeaderTag>
                );
              case 'list':
                const ListTag = (blockData.data as Record<string, unknown>).style === 'ordered' ? 'ol' : 'ul';
                return (
                  <ListTag key={index} className={`space-y-2 text-slate-700 dark:text-slate-300 ${(blockData.data as Record<string, unknown>).style === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside`}>
                    {((blockData.data as Record<string, unknown>).items as string[]).map((item: string, itemIndex: number) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ListTag>
                );
              default:
                return null;
            }
          }) : null}
        </div>
      );
    }

    return <p className="text-slate-700 dark:text-slate-300">Content not available</p>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${difficultyColors[recipe.difficulty]}`}>
            {t(`recipes.difficulty.${recipe.difficulty.toLowerCase()}`)}
          </span>
          {recipe.koreanOrigin && (
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-lg">
              🇰🇷 한국 전통
            </span>
          )}
          {recipe.turkeyAdapted && (
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-lg">
              🇹🇷 터키 현지화
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {recipe.title}
        </h1>

        <div className="flex items-center justify-center gap-6 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(recipe.cookingTime)}
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {recipe.servings}인분
          </div>
          <div className="flex items-center gap-2">
            <span>by {recipe.author.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleLikeToggle}
            disabled={liking}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
              liked
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <svg
              className={`h-5 w-5 ${liked ? "text-red-500" : ""}`}
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likesCount}
          </button>
        </div>
      </div>

      {/* Main Image */}
      {recipe.mainImageUrl && (
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={resolveImageUrl(recipe.mainImageUrl, { width: 800, quality: 90 }) || '/default-recipe.jpg'}
            alt={recipe.title}
            fill
            sizes="(min-width: 768px) 800px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              재료 ({recipe.servings}인분)
            </h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${ingredient.isEssential ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                        {ingredient.name}
                      </span>
                      {!ingredient.isEssential && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">(선택)</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {ingredient.quantity} {ingredient.unit}
                    </div>
                  </div>
                  {ingredient.product && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-600">
                          {formatCurrency(ingredient.product.price, DEFAULT_CURRENCY, activeLocale)}
                        </div>
                        {ingredient.product.stock > 0 ? (
                          <AddToCartButton
                            productId={ingredient.product.id}
                            className="text-xs px-3 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          >
                            장바구니
                          </AddToCartButton>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">품절</span>
                        )}
                      </div>
                      <Link href={`/${locale}/products/${ingredient.product.slug}`} className="transition-transform hover:scale-105">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                          {ingredient.product.imageUrl ? (
                            <Image
                              src={resolveImageUrl(ingredient.product.imageUrl, { width: 40, quality: 80 }) || '/default-product.jpg'}
                              alt={ingredient.product.baseName}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              조리법
            </h2>
            <div className="space-y-6">
              {renderContent(recipe.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}