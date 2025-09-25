'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useSwipeNavigation } from '@/hooks/useTouch';
import { triggerHapticFeedback } from '@/utils/touch/gestures';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
  showSwipeIndicators?: boolean;
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  threshold = 50,
  disabled = false,
  showSwipeIndicators = false,
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const { touchHandlers } = useSwipeNavigation(
    onSwipeLeft ? () => {
      setSwipeDirection('left');
      triggerHapticFeedback();
      setTimeout(() => {
        onSwipeLeft();
        setSwipeDirection(null);
        setTranslateX(0);
        setTranslateY(0);
      }, 150);
    } : undefined,
    onSwipeRight ? () => {
      setSwipeDirection('right');
      triggerHapticFeedback();
      setTimeout(() => {
        onSwipeRight();
        setSwipeDirection(null);
        setTranslateX(0);
        setTranslateY(0);
      }, 150);
    } : undefined,
    threshold
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    touchHandlers.onTouchStart(e);
  }, [disabled, touchHandlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isDragging) return;

    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = touch.clientX - rect.left - rect.width / 2;
    const deltaY = touch.clientY - rect.top - rect.height / 2;

    // Limit translation to reasonable bounds
    const maxTranslate = 100;
    const boundedX = Math.max(-maxTranslate, Math.min(maxTranslate, deltaX / 3));
    const boundedY = Math.max(-maxTranslate, Math.min(maxTranslate, deltaY / 3));

    setTranslateX(boundedX);
    setTranslateY(boundedY);

    touchHandlers.onTouchMove?.(e);
  }, [disabled, isDragging, touchHandlers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(false);
    setTranslateX(0);
    setTranslateY(0);
    touchHandlers.onTouchEnd(e);
  }, [disabled, touchHandlers]);

  const transform = `translate3d(${translateX}px, ${translateY}px, 0) ${
    swipeDirection === 'left' ? 'translateX(-100%)' :
    swipeDirection === 'right' ? 'translateX(100%)' : ''
  }`;

  return (
    <div
      ref={cardRef}
      className={`
        relative transition-transform duration-300 ease-out
        ${isDragging ? 'duration-0' : ''}
        ${className}
      `}
      style={{
        transform,
        opacity: swipeDirection ? 0.7 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showSwipeIndicators && (
        <>
          {/* Left swipe indicator */}
          {onSwipeLeft && (
            <div className={`
              absolute left-4 top-1/2 transform -translate-y-1/2 z-10
              transition-opacity duration-200
              ${translateX < -20 ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="bg-red-500 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* Right swipe indicator */}
          {onSwipeRight && (
            <div className={`
              absolute right-4 top-1/2 transform -translate-y-1/2 z-10
              transition-opacity duration-200
              ${translateX > 20 ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="bg-green-500 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* Up swipe indicator */}
          {onSwipeUp && (
            <div className={`
              absolute top-4 left-1/2 transform -translate-x-1/2 z-10
              transition-opacity duration-200
              ${translateY < -20 ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* Down swipe indicator */}
          {onSwipeDown && (
            <div className={`
              absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10
              transition-opacity duration-200
              ${translateY > 20 ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="bg-purple-500 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}

      {children}
    </div>
  );
}

// Swipeable list item component
interface SwipeListItemProps {
  children: React.ReactNode;
  leftActions?: Array<{
    label: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
  }>;
  rightActions?: Array<{
    label: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
  }>;
  className?: string;
}

export function SwipeListItem({
  children,
  leftActions = [],
  rightActions = [],
  className = '',
}: SwipeListItemProps) {
  const [revealedSide, setRevealedSide] = useState<'left' | 'right' | null>(null);

  const handleSwipeLeft = useCallback(() => {
    if (rightActions.length > 0) {
      setRevealedSide('right');
    }
  }, [rightActions.length]);

  const handleSwipeRight = useCallback(() => {
    if (leftActions.length > 0) {
      setRevealedSide('left');
    }
  }, [leftActions.length]);

  const handleActionClick = useCallback((action: () => void) => {
    action();
    setRevealedSide(null);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className={`
          absolute left-0 top-0 h-full flex items-center
          transition-transform duration-300 ease-out
          ${revealedSide === 'left' ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className={`
                h-full px-4 flex flex-col items-center justify-center
                text-white font-medium
                ${action.color}
              `}
              style={{ minWidth: '80px' }}
            >
              <span className="w-5 h-5 mb-1">{action.icon}</span>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className={`
          absolute right-0 top-0 h-full flex items-center
          transition-transform duration-300 ease-out
          ${revealedSide === 'right' ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className={`
                h-full px-4 flex flex-col items-center justify-center
                text-white font-medium
                ${action.color}
              `}
              style={{ minWidth: '80px' }}
            >
              <span className="w-5 h-5 mb-1">{action.icon}</span>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <SwipeCard
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className={`
          transition-transform duration-300 ease-out
          ${revealedSide === 'left' ? `translate-x-[${leftActions.length * 80}px]` : ''}
          ${revealedSide === 'right' ? `translate-x-[-${rightActions.length * 80}px]` : ''}
          ${className}
        `}
        threshold={30}
      >
        <div
          className="bg-white"
          onClick={() => setRevealedSide(null)}
        >
          {children}
        </div>
      </SwipeCard>
    </div>
  );
}