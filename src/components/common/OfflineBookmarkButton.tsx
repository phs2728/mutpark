'use client';

import React, { useState } from 'react';
import { TouchIconButton } from './TouchButton';
import { useOfflineBookmarks, BookmarkItem } from '@/hooks/useOfflineBookmarks';
import { triggerHapticFeedback } from '@/utils/touch/gestures';

interface OfflineBookmarkButtonProps {
  item: Omit<BookmarkItem, 'bookmarkedAt'>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'icon' | 'button' | 'heart';
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function OfflineBookmarkButton({
  item,
  size = 'md',
  showLabel = false,
  variant = 'icon',
  className = '',
  onBookmarkChange,
}: OfflineBookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useOfflineBookmarks();
  const [isAnimating, setIsAnimating] = useState(false);

  const bookmarked = isBookmarked(item.id);

  const handleToggle = async () => {
    setIsAnimating(true);
    triggerHapticFeedback(bookmarked ? 25 : 50);

    try {
      const newBookmarkState = toggleBookmark(item);
      onBookmarkChange?.(newBookmarkState);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'heart':
        return (
          <svg
            className={`
              transition-all duration-300
              ${bookmarked
                ? 'text-red-500 fill-current scale-110'
                : 'text-gray-400 hover:text-red-400'
              }
              ${isAnimating ? 'animate-pulse scale-125' : ''}
            `}
            fill={bookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );

      case 'button':
        return (
          <svg
            className={`
              transition-all duration-300
              ${bookmarked
                ? 'text-blue-500 fill-current'
                : 'text-gray-400 hover:text-blue-400'
              }
              ${isAnimating ? 'animate-bounce' : ''}
            `}
            fill={bookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        );

      default:
        return (
          <svg
            className={`
              transition-all duration-300
              ${bookmarked
                ? 'text-yellow-500 fill-current'
                : 'text-gray-400 hover:text-yellow-400'
              }
              ${isAnimating ? 'animate-spin' : ''}
            `}
            fill={bookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (variant) {
      case 'heart':
        return bookmarked ? '좋아요 취소' : '좋아요';
      case 'button':
        return bookmarked ? '북마크 해제' : '북마크';
      default:
        return bookmarked ? '즐겨찾기 해제' : '즐겨찾기';
    }
  };

  return (
    <TouchIconButton
      icon={getIcon()}
      label={getLabel()}
      showLabel={showLabel}
      size={size}
      variant="ghost"
      className={`
        relative
        ${className}
      `}
      onClick={handleToggle}
      haptic={false} // We handle haptic feedback manually
    >
      {/* Download indicator for offline availability */}
      {bookmarked && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white">
            <svg
              className="w-2 h-2 text-white absolute top-0.5 left-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </TouchIconButton>
  );
}

// Quick bookmark action sheet
interface BookmarkActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: Omit<BookmarkItem, 'bookmarkedAt'>;
}

export function BookmarkActionSheet({
  isOpen,
  onClose,
  item,
}: BookmarkActionSheetProps) {
  const { isBookmarked, toggleBookmark, addBookmark } = useOfflineBookmarks();

  const bookmarked = isBookmarked(item.id);

  const handleSaveForOffline = async () => {
    try {
      // Fetch full data for offline storage
      let fullData = item.data;

      if (!fullData || Object.keys(fullData).length === 0) {
        // Fetch from API if not provided
        const response = await fetch(`/api/${item.type}s/${item.id}`);
        if (response.ok) {
          fullData = await response.json();
        }
      }

      const bookmarkWithFullData = {
        ...item,
        data: fullData,
      };

      addBookmark(bookmarkWithFullData);
      triggerHapticFeedback(50);
      onClose();
    } catch (error) {
      console.error('Failed to save for offline:', error);
    }
  };

  const handleToggleBookmark = () => {
    toggleBookmark(item);
    triggerHapticFeedback(bookmarked ? 25 : 50);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Action sheet */}
      <div className="relative w-full bg-white rounded-t-xl p-6 safe-area-bottom">
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Item preview */}
        <div className="flex items-center gap-4 mb-6">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            {item.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <TouchIconButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            label="오프라인에서 보기 위해 저장"
            showLabel={true}
            variant="ghost"
            className="w-full justify-start text-left p-4 hover:bg-gray-50"
            onClick={handleSaveForOffline}
          />

          <TouchIconButton
            icon={
              bookmarked ? (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )
            }
            label={bookmarked ? '북마크 해제' : '북마크에 추가'}
            showLabel={true}
            variant="ghost"
            className="w-full justify-start text-left p-4 hover:bg-gray-50"
            onClick={handleToggleBookmark}
          />

          <TouchIconButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            }
            label="공유"
            showLabel={true}
            variant="ghost"
            className="w-full justify-start text-left p-4 hover:bg-gray-50"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: item.title,
                  text: item.description,
                  url: window.location.origin + item.url,
                });
              }
              onClose();
            }}
          />

          <TouchIconButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            label="취소"
            showLabel={true}
            variant="ghost"
            className="w-full justify-start text-left p-4 hover:bg-gray-50 text-gray-500"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}