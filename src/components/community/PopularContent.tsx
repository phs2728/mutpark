'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Heart, MessageCircle, Bookmark } from 'lucide-react';
import CommentSection from './CommentSection';

interface PopularPost {
  id: number;
  title: string;
  content: string;
  type: string;
  author: {
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  popularityScore: {
    score: number;
    breakdown: {
      likesScore: number;
      commentsScore: number;
      viewsScore: number;
      recencyScore: number;
      engagementRate: number;
    };
  };
  createdAt: string;
}

interface TrendingTag {
  tag: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrendingData {
  posts: PopularPost[];
  tags: TrendingTag[];
  meta: {
    postsCount: number;
    tagsCount: number;
    updatedAt: string;
  };
}

export default function PopularContent() {
  const [activeTab, setActiveTab] = useState<'popular' | 'trending'>('popular');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lightweight auth probe to guard actions in guest mode
  useEffect(() => {
    const probe = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        setIsAuthed(res.ok);
      } catch {
        setIsAuthed(false);
      }
    };
    probe();
  }, []);

  const fetchPopularPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/popular?timeRange=${timeRange}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setPopularPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching popular posts:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const fetchTrendingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/community/trending?limit=8');
      if (response.ok) {
        const data = await response.json();
        setTrendingData(data);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'popular') {
      fetchPopularPosts();
    } else {
      fetchTrendingData();
    }
  }, [activeTab, timeRange, fetchPopularPosts, fetchTrendingData]);

  const getPostTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'recipe': return '🍳';
      case 'review': return '⭐';
      case 'tip': return '💡';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  const getPostTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'recipe': return '레시피';
      case 'review': return '리뷰';
      case 'tip': return '꿀팁';
      case 'question': return '질문';
      default: return '게시글';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const handleLike = async (postId: number) => {
    if (!isAuthed) {
      alert('로그인이 필요합니다.');
      return;
    }
    // Locate current post from either list
    const current = popularPosts.find(p => p.id === postId) || trendingData?.posts.find(p => p.id === postId);
    if (!current) return;

    // Optimistic update using snapshot
    const snapshot = { isLiked: !!current.isLiked, likesCount: current.likesCount };
    const optimisticLiked = !snapshot.isLiked;
    const optimisticCount = optimisticLiked ? snapshot.likesCount + 1 : snapshot.likesCount - 1;

    const applyToAll = (updater: (p: PopularPost) => PopularPost) => {
      setPopularPosts(prev => prev.map(p => (p.id === postId ? updater(p) : p)));
      if (trendingData?.posts) {
        setTrendingData(prev => prev ? {
          ...prev,
          posts: prev.posts.map(p => (p.id === postId ? updater(p) : p))
        } : null);
      }
    };

    // Apply optimistic change
    applyToAll(p => ({ ...p, isLiked: optimisticLiked, likesCount: optimisticCount }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Rollback on 401 with login prompt
        if (response.status === 401) {
          applyToAll(p => ({ ...p, isLiked: snapshot.isLiked, likesCount: snapshot.likesCount }));
          alert('로그인이 필요합니다.');
          return;
        }
        // Rollback on other errors
        applyToAll(p => ({ ...p, isLiked: snapshot.isLiked, likesCount: snapshot.likesCount }));
        console.warn('Like toggle failed:', response.status, response.statusText);
        alert('좋아요 처리 중 오류가 발생했습니다.');
        return;
      }

      const data = await response.json(); // { liked, likesCount }

      // Trust server state
      applyToAll(p => ({ ...p, isLiked: data.liked, likesCount: data.likesCount }));
    } catch (error) {
      // Network error: rollback
      applyToAll(p => ({ ...p, isLiked: snapshot.isLiked, likesCount: snapshot.likesCount }));
      console.warn('Error toggling like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      if (!isAuthed) {
        alert('로그인이 필요합니다.');
        return;
      }
      const post = [...popularPosts, ...(trendingData?.posts || [])].find(p => p.id === postId);
      if (!post) return;

      const method = post.isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ collectionName: '기본' }) : undefined,
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          return;
        }
        throw new Error('Failed to toggle bookmark');
      }

      const updatePosts = (posts: PopularPost[]) => posts.map(p =>
        p.id === postId
          ? {
              ...p,
              isBookmarked: !p.isBookmarked,
              bookmarksCount: p.isBookmarked ? p.bookmarksCount - 1 : p.bookmarksCount + 1
            }
          : p
      );

      setPopularPosts(prev => updatePosts(prev));

      if (trendingData?.posts) {
        setTrendingData(prev => prev ? {
          ...prev,
          posts: updatePosts(prev.posts)
        } : null);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          🔥 인기 & 트렌딩 콘텐츠
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          지금 가장 인기 있는 게시글과 실시간 트렌딩 콘텐츠를 확인해보세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex justify-center">
        <div className="korean-border rounded-xl p-2 bg-white">
          <div className="flex space-x-2">
            {[
              { key: 'popular', label: '🏆 인기 게시물', desc: '높은 점수의 게시물' },
              { key: 'trending', label: '🚀 실시간 트렌딩', desc: '급상승 콘텐츠' }
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'popular' | 'trending')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'korean-traditional text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs opacity-75">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 시간 범위 필터 (인기 게시물용) */}
      {activeTab === 'popular' && (
        <div className="flex justify-center gap-2">
          {[
            { key: 'day', label: '오늘' },
            { key: 'week', label: '이번 주' },
            { key: 'month', label: '이번 달' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as 'day' | 'week' | 'month')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timeRange === key
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {activeTab === 'popular' ? (
        <div className="space-y-4">
          {popularPosts.length > 0 ? (
            popularPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 korean-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getPostTypeIcon(post.type)}</span>
                      <span className="text-sm font-medium text-blue-600">{getPostTypeName(post.type)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{post.author.name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {isClient
                          ? new Date(post.createdAt).toLocaleDateString('ko-KR')
                          : new Date(post.createdAt).toISOString().split('T')[0]
                        }
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            post.isLiked ? 'text-red-500' : 'hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </button>
                        <button
                          onClick={() => handleCommentToggle(post.id)}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </button>
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            post.isBookmarked ? 'text-blue-500' : 'hover:text-blue-500'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          <span>{post.bookmarksCount}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">
                          {post.popularityScore.score}점
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 댓글 섹션 */}
                <CommentSection
                  postId={post.id}
                  isOpen={expandedComments.has(post.id)}
                  onClose={() => handleCommentToggle(post.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">인기 게시물이 없습니다</h3>
              <p className="text-gray-600">선택한 기간에 충분한 활동이 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 트렌딩 게시물 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              🚀 급상승 게시물
              {trendingData && (
                <span className="text-sm font-normal text-gray-500">
                  ({trendingData.meta.postsCount}개)
                </span>
              )}
            </h3>

            {trendingData?.posts.length ? (
              <div className="space-y-3">
                {trendingData.posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{getPostTypeIcon(post.type)}</span>
                      <span className="text-sm font-medium text-red-600">{getPostTypeName(post.type)}</span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {post.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{post.author.name}</span>
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          post.isLiked ? 'text-red-500' : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 font-semibold">{post.popularityScore.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🚀</div>
                <p className="text-gray-600 text-sm">현재 트렌딩 게시물이 없습니다</p>
              </div>
            )}
          </div>

          {/* 트렌딩 태그 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              🏷️ 인기 태그
              {trendingData && (
                <span className="text-sm font-normal text-gray-500">
                  (실시간)
                </span>
              )}
            </h3>

            {trendingData?.tags.length ? (
              <div className="space-y-2">
                {trendingData.tags.map((tag, index) => (
                  <div
                    key={tag.tag}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">#{tag.tag}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{tag.count}개</span>
                        <span className="text-lg">{getTrendIcon(tag.trend)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏷️</div>
                <p className="text-gray-600 text-sm">트렌딩 태그 정보를 불러오는 중...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 업데이트 시간 */}
      {trendingData && activeTab === 'trending' && (
        <div className="text-center text-xs text-gray-500">
          마지막 업데이트: {isClient
            ? new Date(trendingData.meta.updatedAt).toLocaleString('ko-KR')
            : new Date(trendingData.meta.updatedAt).toISOString().replace('T', ' ').split('.')[0]
          }
        </div>
      )}
    </div>
  );
}