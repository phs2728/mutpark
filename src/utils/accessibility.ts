// Accessibility utilities for better user experience

// Screen reader utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

// Focus management
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  // Save current focus and set new focus
  static saveFocusAndSet(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus);
    }
    this.setFocus(element);
  }

  // Restore previous focus
  static restoreFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      this.setFocus(previousFocus);
    }
  }

  // Set focus with fallback
  static setFocus(element: HTMLElement): void {
    if (element && typeof element.focus === 'function') {
      // Use requestAnimationFrame to ensure element is rendered
      requestAnimationFrame(() => {
        try {
          element.focus();
        } catch (error) {
          console.warn('Failed to set focus:', error);
        }
      });
    }
  }

  // Focus first focusable element in container
  static focusFirstFocusable(container: HTMLElement): boolean {
    const focusableElement = this.getFirstFocusableElement(container);
    if (focusableElement) {
      this.setFocus(focusableElement);
      return true;
    }
    return false;
  }

  // Get first focusable element
  static getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = container.querySelectorAll(focusableSelector);
    return focusableElements.length > 0 ? (focusableElements[0] as HTMLElement) : null;
  }

  // Trap focus within container
  static trapFocus(container: HTMLElement): () => void {
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll(focusableSelector)
      ) as HTMLElement[];

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  // Handle arrow key navigation
  static handleArrowNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect?: (index: number) => void
  ): number {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onSelect) {
          onSelect(currentIndex);
        }
        return currentIndex;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      FocusManager.setFocus(items[newIndex]);
    }

    return newIndex;
  }

  // Escape key handler
  static onEscape(callback: () => void): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        callback();
      }
    };
  }
}

// Color contrast utilities
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/\w\w/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(x => {
      const val = parseInt(x, 16) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function isAccessibleContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = calculateContrastRatio(foreground, background);

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
}

// ARIA attributes helpers
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key.startsWith('aria-') ? key : `aria-${key}`, value);
  });
}

// Language and localization support
export class LocalizationHelper {
  // Detect user's preferred language
  static getPreferredLanguage(): string {
    if (typeof navigator === 'undefined') return 'ko';

    // Check localStorage first
    const saved = localStorage.getItem('mutpark_language');
    if (saved) return saved;

    // Check browser language
    const browserLang = navigator.language || (navigator as any).userLanguage;

    // Supported languages for MutPark
    const supportedLanguages = ['ko', 'tr', 'en', 'ar', 'ru'];
    const lang = browserLang.substring(0, 2).toLowerCase();

    return supportedLanguages.includes(lang) ? lang : 'ko';
  }

  // Set document language and direction
  static setDocumentLanguage(language: string): void {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;

    // Set direction for RTL languages
    const rtlLanguages = ['ar'];
    document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';

    // Store preference
    localStorage.setItem('mutpark_language', language);
  }

  // Format numbers according to locale
  static formatNumber(num: number, language: string, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.getLocale(language), options).format(num);
    } catch (error) {
      return num.toString();
    }
  }

  // Format currency
  static formatCurrency(amount: number, language: string, currency: string = 'TRY'): string {
    try {
      return new Intl.NumberFormat(this.getLocale(language), {
        style: 'currency',
        currency,
      }).format(amount);
    } catch (error) {
      return `${amount} ${currency}`;
    }
  }

  // Get full locale from language code
  private static getLocale(language: string): string {
    const localeMap: Record<string, string> = {
      ko: 'ko-KR',
      tr: 'tr-TR',
      en: 'en-US',
      ar: 'ar-SA',
      ru: 'ru-RU',
    };

    return localeMap[language] || 'ko-KR';
  }
}

// Motion and animation preferences
export class MotionPreferences {
  // Check if user prefers reduced motion
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Conditionally apply animation
  static conditionalAnimation<T>(
    normalAnimation: T,
    reducedAnimation?: T
  ): T {
    if (this.prefersReducedMotion()) {
      return reducedAnimation || normalAnimation;
    }
    return normalAnimation;
  }

  // Get safe animation duration
  static getSafeAnimationDuration(duration: number): number {
    return this.prefersReducedMotion() ? 0 : duration;
  }
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Color scheme preference
export function getColorSchemePreference(): 'light' | 'dark' | 'auto' {
  if (typeof window === 'undefined') return 'auto';

  const saved = localStorage.getItem('mutpark_color_scheme');
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved as 'light' | 'dark' | 'auto';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Font size adjustment
export class FontSizeAdjustment {
  private static readonly STORAGE_KEY = 'mutpark_font_size';
  private static readonly BASE_SIZE = 16; // 16px base font size

  static getCurrentSize(): number {
    if (typeof localStorage === 'undefined') return this.BASE_SIZE;

    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? parseInt(saved, 10) : this.BASE_SIZE;
  }

  static setFontSize(size: number): void {
    const clampedSize = Math.max(12, Math.min(24, size)); // Clamp between 12px and 24px

    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${clampedSize}px`;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, clampedSize.toString());
    }
  }

  static increaseFontSize(): void {
    const current = this.getCurrentSize();
    this.setFontSize(current + 2);
  }

  static decreaseFontSize(): void {
    const current = this.getCurrentSize();
    this.setFontSize(current - 2);
  }

  static resetFontSize(): void {
    this.setFontSize(this.BASE_SIZE);
  }
}

// Skip links for keyboard navigation
export function createSkipLink(target: string, text: string): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${target}`;
  skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
  skipLink.textContent = text;

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const targetElement = document.getElementById(target);
    if (targetElement) {
      FocusManager.setFocus(targetElement);
      announceToScreenReader(`${text}로 이동했습니다`, 'polite');
    }
  });

  return skipLink;
}

// Error message management for screen readers
export function announceFormError(fieldName: string, errorMessage: string): void {
  announceToScreenReader(`${fieldName} 필드에 오류가 있습니다: ${errorMessage}`, 'assertive');
}

export function announceFormSuccess(message: string): void {
  announceToScreenReader(`성공: ${message}`, 'polite');
}

// Loading state announcements
export function announceLoadingState(isLoading: boolean, context?: string): void {
  const message = isLoading
    ? `${context ? context + ' ' : ''}로딩 중입니다`
    : `${context ? context + ' ' : ''}로딩이 완료되었습니다`;

  announceToScreenReader(message, 'polite');
}