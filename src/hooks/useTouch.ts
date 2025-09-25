import { useCallback, useRef, useState, useEffect } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface TapGesture {
  x: number;
  y: number;
  timestamp: number;
  isDoubleTap: boolean;
}

interface UseTouchOptions {
  swipeThreshold?: number;
  tapThreshold?: number;
  doubleTapThreshold?: number;
  longPressThreshold?: number;
  enableSwipe?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
}

interface UseTouchHandlers {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (gesture: TapGesture) => void;
  onLongPress?: (point: TouchPoint) => void;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
}

export function useTouch(
  options: UseTouchOptions = {},
  handlers: UseTouchHandlers = {}
) {
  const {
    swipeThreshold = 50,
    tapThreshold = 10,
    doubleTapThreshold = 300,
    longPressThreshold = 500,
    enableSwipe = true,
    enableTap = true,
    enableLongPress = false,
    enableDoubleTap = false,
  } = options;

  const {
    onSwipe,
    onTap,
    onLongPress,
    onTouchStart,
    onTouchEnd,
  } = handlers;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    touchStartRef.current = point;
    setIsPressed(true);
    onTouchStart?.(point);

    // Start long press timer if enabled
    if (enableLongPress && onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress(point);
      }, longPressThreshold);
    }
  }, [enableLongPress, onLongPress, onTouchStart, longPressThreshold]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    setIsPressed(false);
    clearLongPressTimer();
    onTouchEnd?.(endPoint);

    if (!touchStartRef.current) return;

    const startPoint = touchStartRef.current;
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endPoint.timestamp - startPoint.timestamp;

    // Handle swipe gesture
    if (enableSwipe && onSwipe && distance >= swipeThreshold) {
      const velocity = distance / duration;
      let direction: SwipeGesture['direction'];

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      onSwipe({
        direction,
        distance,
        velocity,
        duration,
      });
      return;
    }

    // Handle tap gesture
    if (enableTap && onTap && distance < tapThreshold) {
      const now = Date.now();
      let isDoubleTap = false;

      // Check for double tap
      if (enableDoubleTap && lastTapRef.current) {
        const timeDiff = now - lastTapRef.current.timestamp;
        const tapDistance = Math.sqrt(
          Math.pow(endPoint.x - lastTapRef.current.x, 2) +
          Math.pow(endPoint.y - lastTapRef.current.y, 2)
        );

        if (timeDiff < doubleTapThreshold && tapDistance < tapThreshold) {
          isDoubleTap = true;
          lastTapRef.current = null; // Reset to prevent triple tap
        } else {
          lastTapRef.current = endPoint;
        }
      } else {
        lastTapRef.current = endPoint;
      }

      onTap({
        x: endPoint.x,
        y: endPoint.y,
        timestamp: endPoint.timestamp,
        isDoubleTap,
      });
    }
  }, [
    enableSwipe,
    enableTap,
    enableDoubleTap,
    onSwipe,
    onTap,
    onTouchEnd,
    swipeThreshold,
    tapThreshold,
    doubleTapThreshold,
    clearLongPressTimer,
  ]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Clear long press timer if finger moves too much
    if (touchStartRef.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > tapThreshold) {
        clearLongPressTimer();
      }
    }
  }, [tapThreshold, clearLongPressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
    },
    isPressed,
  };
}

// Hook for swipe navigation
export function useSwipeNavigation(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  return useTouch(
    {
      swipeThreshold: threshold,
      enableSwipe: true,
      enableTap: false,
    },
    {
      onSwipe: (gesture) => {
        if (gesture.direction === 'left' && onSwipeLeft) {
          onSwipeLeft();
        } else if (gesture.direction === 'right' && onSwipeRight) {
          onSwipeRight();
        }
      },
    }
  );
}

// Hook for pull-to-refresh
export function usePullToRefresh(
  onRefresh: () => void,
  threshold = 100
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const { touchHandlers } = useTouch(
    {
      enableSwipe: true,
      enableTap: false,
      swipeThreshold: threshold,
    },
    {
      onSwipe: (gesture) => {
        if (gesture.direction === 'down' && gesture.distance >= threshold) {
          setIsRefreshing(true);
          onRefresh();
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 1000);
        }
      },
      onTouchStart: () => {
        setPullDistance(0);
      },
    }
  );

  return {
    touchHandlers,
    isRefreshing,
    pullDistance,
  };
}