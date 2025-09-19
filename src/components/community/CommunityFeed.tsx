"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/providers/I18nProvider";
import { resolveImageUrl } from "@/lib/imagekit";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

interface CommunityPost {
  id: number;
  type: "recipe" | "review" | "tip";
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  recipe?: {
    id: number;
    slug: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    cookingTime: number;
    servings: number;
  };
  product?: {
    id: number;
    slug: string;
    baseName: string;
    price: number;
    imageUrl?: string | null;
  };
  tags: string[];
}

interface CommunityFeedProps {
  locale: string;
  filter?: string;
}

const postTypeColors = {
  recipe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  tip: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const difficultyColors = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// Mock data for now - replace with API call
const mockPosts: CommunityPost[] = [
    {
      id: 1,
      type: "recipe",
      title: "터키에서 만드는 정통 김치찌개",
      content: "터키에서 구할 수 있는 재료들로 맛있는 김치찌개를 만드는 방법을 공유해요! 현지 슈퍼마켓에서 쉽게 찾을 수 있는 재료들을 사용했습니다.",
      imageUrl: "/recipe-kimchi-jjigae.jpg",
      createdAt: "2025-01-15T10:30:00Z",
      author: {
        id: 1,
        name: "김터키",
        avatar: "/avatar-1.jpg",
      },
      likes: 24,
      comments: 8,
      isLiked: false,
      recipe: {
        id: 1,
        slug: "kimchi-jjigae-turkey",
        difficulty: "MEDIUM",
        cookingTime: 45,
        servings: 4,
      },
      tags: ["김치찌개", "터키현지화", "쉬운레시피"],
    },
    {
      id: 2,
      type: "review",
      title: "신라면 블랙 후기",
      content: "드디어 찾았던 신라면 블랙! 맛이 정말 진하고 좋아요. 터키에서 이런 맛을 느낄 수 있다니 감동입니다.",
      imageUrl: "/review-nongshim.jpg",
      createdAt: "2025-01-14T15:20:00Z",
      author: {
        id: 2,
        name: "이스탄불김씨",
        avatar: "/avatar-2.jpg",
      },
      likes: 15,
      comments: 12,
      isLiked: true,
      product: {
        id: 5,
        slug: "nongshim-shin-ramyun-black",
        baseName: "농심 신라면 블랙",
        price: 25.90,
        imageUrl: "/product-shin-black.jpg",
      },
      tags: ["라면", "농심", "추천"],
    },
    {
      id: 3,
      type: "tip",
      title: "터키에서 한국 재료 구하는 꿀팁",
      content: "아시안 마켓 외에도 일반 슈퍼마켓에서 구할 수 있는 대체 재료들과 온라인 쇼핑몰 정보를 정리했어요!",
      createdAt: "2025-01-13T12:45:00Z",
      author: {
        id: 3,
        name: "앙카라한국인",
        avatar: "/avatar-3.jpg",
      },
      likes: 35,
      comments: 22,
      isLiked: false,
      tags: ["꿀팁", "쇼핑", "재료구하기"],
    },
  ];

export function CommunityFeed({ locale, filter }: CommunityFeedProps) {
  const { locale: activeLocale } = useI18n();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(filter || "all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredPosts = mockPosts;

      if (activeFilter !== "all") {
        filteredPosts = mockPosts.filter(post => post.type === activeFilter);
      }

      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: number) => {
    try {
      // Simulate API call
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full dark:bg-slate-700"></div>
              <div className="flex-1">
                <div className="bg-slate-200 rounded h-4 w-32 mb-2 dark:bg-slate-700"></div>
                <div className="bg-slate-200 rounded h-3 w-20 dark:bg-slate-700"></div>
              </div>
            </div>
            <div className="bg-slate-200 rounded h-48 mb-4 dark:bg-slate-700"></div>
            <div className="space-y-2">
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
      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "전체" },
              { key: "recipe", label: "레시피" },
              { key: "review", label: "후기" },
              { key: "tip", label: "꿀팁" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === key
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="커뮤니티 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-400 text-lg mb-2">게시물이 없습니다</div>
          <div className="text-slate-500 text-sm">첫 번째 글을 작성해보세요!</div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {post.author.avatar ? (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {post.author.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${postTypeColors[post.type]}`}>
                        {post.type === "recipe" ? "레시피" : post.type === "review" ? "후기" : "꿀팁"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {post.title}
                </h3>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="relative aspect-video mx-6 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(min-width: 768px) 600px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Recipe/Product Info */}
              {post.recipe && (
                <div className="mx-6 mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[post.recipe.difficulty]}`}>
                        {post.recipe.difficulty === "EASY" ? "쉬움" : post.recipe.difficulty === "MEDIUM" ? "보통" : "어려움"}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDuration(post.recipe.cookingTime)} · {post.recipe.servings}인분
                      </span>
                    </div>
                    <Link
                      href={`/${locale}/recipes/${post.recipe.slug}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      레시피 보기 →
                    </Link>
                  </div>
                </div>
              )}

              {post.product && (
                <div className="mx-6 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      {post.product.imageUrl ? (
                        <Image
                          src={resolveImageUrl(post.product.imageUrl, { width: 48, quality: 80 }) || '/default-product.jpg'}
                          alt={post.product.baseName}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900 dark:text-white">{post.product.baseName}</h5>
                      <div className="text-emerald-600 font-semibold">
                        {formatCurrency(post.product.price, DEFAULT_CURRENCY, activeLocale)}
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/products/${post.product.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      상품 보기 →
                    </Link>
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.isLiked
                          ? "text-red-500"
                          : "text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                      }`}
                    >
                      <svg
                        className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`}
                        fill={post.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                  </div>

                  <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load More Button */}
      <div className="text-center">
        <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
          더 많은 게시물 보기
        </button>
      </div>
    </div>
  );
}