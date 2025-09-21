'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, Search, TrendingUp, Clock, Heart, MessageCircle, ChevronDown } from 'lucide-react';
import { CommunityFeed } from './CommunityFeed';

interface FilterOptions {
  type: 'all' | 'recipe' | 'review' | 'tip' | 'question';
  sortBy: 'latest' | 'popular' | 'trending';
  timeRange: 'day' | 'week' | 'month' | 'all';
}

interface InteractiveFeedProps {
  userId?: number;
  showPersonalized?: boolean;
}

export default function InteractiveFeed({ userId, showPersonalized = false }: InteractiveFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    sortBy: 'latest',
    timeRange: 'week'
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 게시물 로드
  const loadPosts = useCallback(async (reset = false) => {
    if (loading) return;

    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      let url = '';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.type !== 'all' && { postType: filters.type }),
        ...(filters.timeRange !== 'all' && { timeRange: filters.timeRange })
      });

      // API 엔드포인트 선택
      if (showPersonalized && userId) {
        url = `/api/community/personalized-feed?userId=${userId}&${params.toString()}`;
      } else if (filters.sortBy === 'popular') {
        url = `/api/community/popular?${params.toString()}`;
      } else if (filters.sortBy === 'trending') {
        url = `/api/community/trending?${params.toString()}`;
      } else {
        url = `/api/community/posts?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (reset) {
        setPosts(data.posts || []);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore((data.posts || []).length === 20);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters, userId, showPersonalized, loading]);

  // 필터 변경 시 리셋
  useEffect(() => {
    setPage(1);
    loadPosts(true);
  }, [filters, searchQuery]);

  // 검색 디바운스
  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 500);
  };

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts();
        }
      },
      { threshold: 0.1 }
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
  }, [loadPosts, hasMore, loading]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recipe': return '🍳';
      case 'review': return '⭐';
      case 'tip': return '💡';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'popular': return <Heart className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 검색 */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {showPersonalized ? '맞춤 피드' : '커뮤니티 피드'}
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            필터
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="게시물 검색..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* 게시물 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">게시물 타입</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: '전체', icon: '📝' },
                  { key: 'recipe', label: '레시피', icon: '🍳' },
                  { key: 'review', label: '리뷰', icon: '⭐' },
                  { key: 'tip', label: '꿀팁', icon: '💡' },
                  { key: 'question', label: '질문', icon: '❓' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange('type', key)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === key
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 정렬 방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'latest', label: '최신순' },
                  { key: 'popular', label: '인기순' },
                  { key: 'trending', label: '급상승' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange('sortBy', key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.sortBy === key
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getSortIcon(key)}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 시간 범위 (인기순/급상승일 때만) */}
            {(filters.sortBy === 'popular' || filters.sortBy === 'trending') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'day', label: '오늘' },
                    { key: 'week', label: '이번 주' },
                    { key: 'month', label: '이번 달' },
                    { key: 'all', label: '전체' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleFilterChange('timeRange', key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.timeRange === key
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 현재 필터 표시 */}
      {(filters.type !== 'all' || filters.sortBy !== 'latest' || searchQuery) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>필터:</span>
          {filters.type !== 'all' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
              {getTypeIcon(filters.type)}
              {filters.type === 'recipe' ? '레시피' :
               filters.type === 'review' ? '리뷰' :
               filters.type === 'tip' ? '꿀팁' : '질문'}
            </span>
          )}
          {filters.sortBy !== 'latest' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {getSortIcon(filters.sortBy)}
              {filters.sortBy === 'popular' ? '인기순' : '급상승'}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
              "{searchQuery}"
            </span>
          )}
          <button
            onClick={() => {
              setFilters({ type: 'all', sortBy: 'latest', timeRange: 'week' });
              setSearchQuery('');
            }}
            className="text-red-600 hover:text-red-700 ml-2"
          >
            초기화
          </button>
        </div>
      )}

      {/* 피드 */}
      <CommunityFeed posts={posts} userId={userId} />

      {/* 로딩 및 더보기 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="h-4" />

      {/* 더 이상 게시물이 없는 경우 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          모든 게시물을 확인했어요! 🎉
        </div>
      )}

      {/* 게시물이 없는 경우 */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? '검색 결과가 없습니다' : '아직 게시물이 없어요'}
          </h3>
          <p className="text-gray-600">
            {searchQuery ? '다른 검색어를 시도해보세요' : '첫 번째 게시물을 작성해보세요!'}
          </p>
        </div>
      )}
    </div>
  );
}