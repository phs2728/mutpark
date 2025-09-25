// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: number;
  name: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Navigation timing observer
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.logNavigationTiming(entry as PerformanceNavigationTiming);
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.logResourceTiming(entry);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Layout shift observer
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.logLayoutShift(entry);
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);

      // Largest contentful paint observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logLCP(lastEntry);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }
  }

  // Start performance measurement
  startMeasurement(name: string): void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      memoryUsage: this.getMemoryUsage(),
    });

    // Mark start time for built-in measurement
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  // End performance measurement
  endMeasurement(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance measurement '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.set(name, completedMetric);

    // Mark end time and create measure
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Log performance metric
    this.logMetric(completedMetric);

    return completedMetric;
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // Log navigation timing
  private logNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'DNS Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP Connection': entry.connectEnd - entry.connectStart,
      'SSL Negotiation': entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      'Response Time': entry.responseEnd - entry.requestStart,
      'DOM Processing': entry.domContentLoadedEventEnd - entry.domLoading,
      'Load Complete': entry.loadEventEnd - entry.loadEventStart,
      'Total Load Time': entry.loadEventEnd - entry.navigationStart,
    };

    console.group('🚀 Navigation Performance');
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        console.log(`${key}: ${value.toFixed(2)}ms`);
      }
    });
    console.groupEnd();

    // Send to analytics if available
    this.sendToAnalytics('navigation', metrics);
  }

  // Log resource timing
  private logResourceTiming(entry: PerformanceEntry): void {
    const resource = entry as PerformanceResourceTiming;
    const duration = resource.responseEnd - resource.startTime;

    // Only log slow resources (>100ms)
    if (duration > 100) {
      console.warn(`🐌 Slow resource: ${resource.name} (${duration.toFixed(2)}ms)`);

      this.sendToAnalytics('slow-resource', {
        name: resource.name,
        duration,
        size: resource.transferSize || 0,
      });
    }
  }

  // Log layout shift
  private logLayoutShift(entry: PerformanceEntry): void {
    const layoutShift = entry as any;
    if (layoutShift.value > 0.1) {
      console.warn(`📐 Layout shift detected: ${layoutShift.value.toFixed(4)}`);

      this.sendToAnalytics('layout-shift', {
        value: layoutShift.value,
        hadRecentInput: layoutShift.hadRecentInput,
      });
    }
  }

  // Log largest contentful paint
  private logLCP(entry: PerformanceEntry): void {
    const lcp = entry as any;
    console.log(`🎨 Largest Contentful Paint: ${lcp.startTime.toFixed(2)}ms`);

    if (lcp.startTime > 2500) {
      console.warn('⚠️ LCP is above recommended threshold (2.5s)');
    }

    this.sendToAnalytics('lcp', {
      startTime: lcp.startTime,
      element: lcp.element?.tagName || 'unknown',
    });
  }

  // Log performance metric
  private logMetric(metric: PerformanceMetrics): void {
    if (metric.duration && metric.duration > 0) {
      console.log(`⏱️ ${metric.name}: ${metric.duration.toFixed(2)}ms`);

      if (metric.duration > 1000) {
        console.warn(`⚠️ ${metric.name} took longer than 1 second`);
      }

      this.sendToAnalytics('custom-metric', {
        name: metric.name,
        duration: metric.duration,
        memoryUsage: metric.memoryUsage,
      });
    }
  }

  // Send metrics to analytics service
  private sendToAnalytics(type: string, data: any): void {
    // Implementation would send to your analytics service
    // For now, we'll just store in localStorage for debugging
    if (typeof window !== 'undefined') {
      const key = `mutpark_performance_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        timestamp: Date.now(),
        ...data,
      });

      // Keep only last 100 entries
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Cleanup observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for performance optimization

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), delay);
    }
  };
}

// Lazy loading with Intersection Observer
export function createLazyLoader(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Image optimization helper
export function optimizeImage(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  } = {}
): string {
  // In a real implementation, this would integrate with your image CDN
  // For now, we'll add query parameters that could be used by a CDN
  const url = new URL(src, window.location.origin);

  if (options.width) url.searchParams.set('w', options.width.toString());
  if (options.height) url.searchParams.set('h', options.height.toString());
  if (options.quality) url.searchParams.set('q', options.quality.toString());
  if (options.format && options.format !== 'auto') {
    url.searchParams.set('f', options.format);
  }

  return url.toString();
}

// Resource preloading
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch',
  crossorigin?: boolean
): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

// Memory usage monitor
export function getMemoryInfo(): any {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%',
    };
  }
  return null;
}

// Performance decorator for functions
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const measurementName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.startMeasurement(measurementName);

      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.endMeasurement(measurementName);
          });
        } else {
          performanceMonitor.endMeasurement(measurementName);
          return result;
        }
      } catch (error) {
        performanceMonitor.endMeasurement(measurementName);
        throw error;
      }
    };

    return descriptor;
  };
}