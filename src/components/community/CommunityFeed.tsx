"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/imagekit";
import CommentSection from './CommentSection';

interface CommunityPost {
  id: number;
  type: "review" | "tip" | "question" | "recipe";
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  author: {
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;

  // 레시피 전용 필드
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  cookingTime?: number;
  servings?: number;
  ingredients?: Array<{
    id: string;
    name: string;
    quantity: string;
    unit: string;
    isEssential: boolean;
  }>;
  instructions?: Array<{
    id: string;
    step: number;
    description: string;
  }>;

  // 리뷰 전용 필드
  rating?: number;

  product?: {
    id: number;
    baseName: string;
    imageUrl?: string | null;
  } | null;
  tags: string[];
}

interface CommunityFeedProps {
  filter?: string;
  posts?: CommunityPost[];
  userId?: number;
}

const postTypeColors = {
  review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  tip: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  question: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  recipe: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const difficultyLabels = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움"
};

const difficultyColors = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-red-100 text-red-700"
};



export function CommunityFeed({ filter, posts: externalPosts, userId }: CommunityFeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(externalPosts || []);
  const [loading, setLoading] = useState(!externalPosts);
  const [activeFilter, setActiveFilter] = useState(filter || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNumber = 1, append = false) => {
    // Skip fetching if external posts are provided
    if (externalPosts) return;

    try {
      if (!append) {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (activeFilter !== "all") {
        params.append("type", activeFilter.toUpperCase());
      }
      params.append("page", pageNumber.toString());
      params.append("limit", "10");
      params.append("sortBy", sortBy);

      const response = await fetch(`/api/community/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      let filteredPosts = data.posts || [];

      // Client-side search filtering
      if (searchQuery) {
        filteredPosts = filteredPosts.filter((post: CommunityPost) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Tag filtering
      if (selectedTag) {
        filteredPosts = filteredPosts.filter((post: CommunityPost) =>
          post.tags.some((tag: string) => tag === selectedTag)
        );
      }

      if (append) {
        setPosts(prev => [...prev, ...filteredPosts]);
      } else {
        setPosts(filteredPosts);
        setPage(1);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery, selectedTag, sortBy, externalPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "20px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, page, fetchPosts]);

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId || 1 }), // Use provided userId or default to 1
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: data.liked,
              likesCount: data.liked ? post.likesCount + 1 : post.likesCount - 1
            }
          : post
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      // Check if user is authenticated
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const method = post.isBookmarked ? "DELETE" : "POST";
      const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method === "POST" ? JSON.stringify({ collectionName: "기본" }) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          return;
        }
        throw new Error("Failed to toggle bookmark");
      }

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              isBookmarked: !p.isBookmarked,
              bookmarksCount: p.isBookmarked ? p.bookmarksCount - 1 : p.bookmarksCount + 1
            }
          : p
      ));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  const handleCommentToggle = (postId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };


  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
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
              { key: "question", label: "질문" },
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

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
            <input
              type="text"
              placeholder="커뮤니티 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Selected Tag Filter */}
        {selectedTag && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">선택된 태그:</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <span>#{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
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
                    <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {post.author.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${postTypeColors[post.type]}`}>
                        {post.type === "recipe" ? "레시피" :
                         post.type === "review" ? "후기" :
                         post.type === "tip" ? "꿀팁" : "질문"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTimeAgo(post.publishedAt || post.createdAt)}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {post.title}
                </h3>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Recipe Info */}
                {post.type === "recipe" && (
                  <div className="flex flex-wrap gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    {post.difficulty && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 dark:text-green-400">난이도:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[post.difficulty]}`}>
                          {difficultyLabels[post.difficulty]}
                        </span>
                      </div>
                    )}
                    {post.cookingTime && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700 dark:text-green-300">{post.cookingTime}분</span>
                      </div>
                    )}
                    {post.servings && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm text-green-700 dark:text-green-300">{post.servings}인분</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Rating */}
                {post.type === "review" && post.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">평점:</span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < post.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({post.rating}/5)</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 ${
                        selectedTag === tag
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="relative aspect-video mx-6 mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(min-width: 768px) 600px, 100vw"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-post.jpg';
                    }}
                  />
                </div>
              )}

              {/* Product Info */}
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
                      <span className="text-sm text-slate-600 dark:text-slate-400">관련 상품</span>
                    </div>
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
                      <span>{post.likesCount}</span>
                    </button>

                    <button
                      onClick={() => handleCommentToggle(post.id)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.commentsCount}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      post.isBookmarked
                        ? "text-blue-500"
                        : "text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${post.isBookmarked ? "fill-current" : ""}`}
                      fill={post.isBookmarked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {post.bookmarksCount > 0 && <span>{post.bookmarksCount}</span>}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection
                postId={post.id}
                isOpen={expandedComments.has(post.id)}
                onClose={() => handleCommentToggle(post.id)}
              />
            </article>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            <span className="text-slate-600 dark:text-slate-400">더 많은 게시물을 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* End of Posts Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="text-slate-400 text-sm">모든 게시물을 확인했습니다</div>
        </div>
      )}
    </div>
  );
}