'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOfflineBookmarks, BookmarkItem } from '@/hooks/useOfflineBookmarks';
import { TouchButton } from '@/components/common/TouchButton';
import { MobileTabNavigation } from '@/components/common/MobileNavigation';
import { SwipeListItem } from '@/components/common/SwipeCard';
import { OfflineBookmarkButton } from '@/components/common/OfflineBookmarkButton';

export default function BookmarksPage() {
  const {
    bookmarks,
    isLoading,
    removeBookmark,
    getBookmarksByType,
    searchBookmarks,
    clearBookmarks,
    exportBookmarks,
    importBookmarks,
    lastSync,
  } = useOfflineBookmarks();

  const [activeTab, setActiveTab] = useState<'all' | 'product' | 'recipe' | 'post'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  const filteredBookmarks = React.useMemo(() => {
    let filtered = activeTab === 'all' ? bookmarks : getBookmarksByType(activeTab);

    if (searchQuery.trim()) {
      filtered = searchBookmarks(searchQuery);
      if (activeTab !== 'all') {
        filtered = filtered.filter(bookmark => bookmark.type === activeTab);
      }
    }

    return filtered.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
  }, [bookmarks, activeTab, searchQuery, getBookmarksByType, searchBookmarks]);

  const tabItems = [
    { label: '전체', value: 'all' as const },
    { label: '상품', value: 'product' as const },
    { label: '레시피', value: 'recipe' as const },
    { label: '게시물', value: 'post' as const },
  ];

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
  };

  const handleShareBookmark = (bookmark: BookmarkItem) => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        text: bookmark.description,
        url: window.location.origin + bookmark.url,
      });
    }
  };

  const handleExport = () => {
    const data = exportBookmarks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutpark-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importBookmarks(content, true)) {
        alert('북마크를 성공적으로 가져왔습니다.');
      } else {
        alert('북마크 파일을 읽는데 실패했습니다.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const getTypeIcon = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'recipe':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'post':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'product': return '상품';
      case 'recipe': return '레시피';
      case 'post': return '게시물';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">북마크를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">오프라인 북마크</h1>
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => setShowImportExport(!showImportExport)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </TouchButton>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="북마크 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tabs */}
          <MobileTabNavigation
            items={tabItems}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as any)}
            variant="pills"
          />

          {/* Stats */}
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              총 {filteredBookmarks.length}개의 북마크
              {lastSync && (
                <span className="ml-2">
                  • 마지막 동기화: {formatDate(lastSync)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Import/Export Panel */}
        {showImportExport && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-md mx-auto space-y-3">
              <TouchButton
                variant="outline"
                className="w-full"
                onClick={handleExport}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                북마크 내보내기
              </TouchButton>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <TouchButton
                  variant="outline"
                  className="w-full pointer-events-none"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  북마크 가져오기
                </TouchButton>
              </div>

              {bookmarks.length > 0 && (
                <TouchButton
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('모든 북마크를 삭제하시겠습니까?')) {
                      clearBookmarks();
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  모든 북마크 삭제
                </TouchButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks List */}
      <div className="max-w-md mx-auto">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '저장된 북마크가 없습니다'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? '다른 키워드로 검색해보세요'
                : '관심 있는 상품이나 레시피를 북마크해보세요'
              }
            </p>
            {!searchQuery && (
              <Link href="/">
                <TouchButton variant="primary">
                  홈으로 가기
                </TouchButton>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBookmarks.map((bookmark) => (
              <SwipeListItem
                key={bookmark.id}
                rightActions={[
                  {
                    label: '공유',
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    ),
                    color: 'bg-blue-500',
                    action: () => handleShareBookmark(bookmark),
                  },
                  {
                    label: '삭제',
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ),
                    color: 'bg-red-500',
                    action: () => handleDeleteBookmark(bookmark.id),
                  },
                ]}
                className="bg-white"
              >
                <Link href={bookmark.url}>
                  <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start gap-3">
                      {/* Image */}
                      {bookmark.imageUrl && (
                        <img
                          src={bookmark.imageUrl}
                          alt={bookmark.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500">
                            {getTypeIcon(bookmark.type)}
                          </span>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {getTypeLabel(bookmark.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(bookmark.bookmarkedAt)}
                          </span>
                        </div>

                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                          {bookmark.title}
                        </h3>

                        {bookmark.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {bookmark.description}
                          </p>
                        )}

                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {bookmark.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                            {bookmark.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{bookmark.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bookmark button */}
                      <div className="flex-shrink-0">
                        <OfflineBookmarkButton
                          item={bookmark}
                          variant="button"
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Offline indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">
                          오프라인 사용 가능
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwipeListItem>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
}