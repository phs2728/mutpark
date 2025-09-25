// Touch gesture utilities and constants

export const TOUCH_CONSTANTS = {
  TAP_THRESHOLD: 10,
  SWIPE_THRESHOLD: 50,
  LONG_PRESS_DURATION: 500,
  DOUBLE_TAP_THRESHOLD: 300,
  HAPTIC_FEEDBACK_DURATION: 50,
} as const;

export interface TouchCoordinate {
  x: number;
  y: number;
}

export interface TouchEvent {
  start: TouchCoordinate & { timestamp: number };
  end: TouchCoordinate & { timestamp: number };
}

export function calculateDistance(start: TouchCoordinate, end: TouchCoordinate): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export function calculateVelocity(distance: number, duration: number): number {
  return duration > 0 ? distance / duration : 0;
}

export function getSwipeDirection(start: TouchCoordinate, end: TouchCoordinate): 'left' | 'right' | 'up' | 'down' {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

// Haptic feedback utility (Web Vibration API)
export function triggerHapticFeedback(pattern: number | number[] = TOUCH_CONSTANTS.HAPTIC_FEEDBACK_DURATION) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Touch area expansion for better touch targets
export function expandTouchArea(element: HTMLElement, padding = 20) {
  const style = element.style;
  style.position = 'relative';

  const pseudoElement = `
    content: '';
    position: absolute;
    top: -${padding}px;
    left: -${padding}px;
    right: -${padding}px;
    bottom: -${padding}px;
    z-index: 1;
  `;

  // Add pseudo-element for expanded touch area
  element.setAttribute('data-touch-expanded', 'true');

  return () => {
    element.removeAttribute('data-touch-expanded');
  };
}

// Touch ripple effect utility
export function createRippleEffect(element: HTMLElement, event: React.TouchEvent | React.MouseEvent) {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (event as React.TouchEvent).touches
    ? (event as React.TouchEvent).touches[0].clientX - rect.left - size / 2
    : (event as React.MouseEvent).clientX - rect.left - size / 2;
  const y = (event as React.TouchEvent).touches
    ? (event as React.TouchEvent).touches[0].clientY - rect.top - size / 2
    : (event as React.MouseEvent).clientY - rect.top - size / 2;

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 9999;
  `;

  // Add ripple animation keyframes if not already added
  if (!document.querySelector('#ripple-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ripple-keyframes';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

// Smooth scroll utility for touch devices
export function smoothScrollTo(element: HTMLElement, top: number, duration = 300) {
  const start = element.scrollTop;
  const change = top - start;
  const startTime = performance.now();

  function animateScroll(currentTime: number) {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Ease-out function
    const ease = 1 - Math.pow(1 - progress, 3);

    element.scrollTop = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

// Touch-friendly button state management
export function createTouchButtonState() {
  let isPressed = false;
  let pressTimer: NodeJS.Timeout | null = null;

  return {
    onTouchStart: (callback?: () => void) => {
      isPressed = true;
      callback?.();

      // Add visual feedback with slight delay
      pressTimer = setTimeout(() => {
        triggerHapticFeedback();
      }, 50);
    },

    onTouchEnd: (callback?: () => void) => {
      isPressed = false;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      callback?.();
    },

    onTouchCancel: (callback?: () => void) => {
      isPressed = false;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      callback?.();
    },

    getIsPressed: () => isPressed,
  };
}