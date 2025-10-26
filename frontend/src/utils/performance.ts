/**
 * Performance optimization utilities and hooks
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// Image optimization utilities
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 85
): string => {
  if (!url) return '';
  
  // If it's already optimized or a data URL, return as-is
  if (url.includes('w_') || url.startsWith('data:')) return url;
  
  // Add optimization parameters for common CDNs
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', 'auto'); // Auto format selection
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

// Lazy loading hook
export const useLazyLoading = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { isVisible, elementRef };
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Virtual scrolling hook
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
      items: items.slice(
        Math.max(0, startIndex - overscan),
        endIndex + 1
      )
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight
  };
};

// Memory usage monitoring
export const useMemoryMonitoring = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });
    };

    updateMemoryInfo();
    const timer = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return memoryInfo;
};

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart
          }));
        }
        
        if (entry.entryType === 'paint') {
          const paint = entry as PerformancePaintTiming;
          setMetrics(prev => ({
            ...prev,
            [paint.name === 'first-paint' ? 'firstPaint' : 'firstContentfulPaint']: paint.startTime
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Resource prefetching
export const prefetchResource = (url: string, as: string = 'fetch'): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  
  document.head.appendChild(link);
};

// Code splitting helper
export const dynamicImport = <T = any>(
  importFunction: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  return importFunction().catch(error => {
    console.error('Dynamic import failed:', error);
    if (fallback) return Promise.resolve(fallback);
    throw error;
  });
};

// Cache management
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>();

  set(key: string, value: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Web Workers utility
export const createWorker = (workerFunction: Function): Worker => {
  const blob = new Blob([`(${workerFunction})()`], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};

// Request batching
export class RequestBatcher<T, R> {
  private batch: T[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchProcessor: (batch: T[]) => Promise<R[]>,
    private batchSize: number = 10,
    private delay: number = 100
  ) {}

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ ...item, resolve, reject } as any);

      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.batch.length === 0) return;

    const currentBatch = this.batch.splice(0, this.batch.length);
    
    try {
      const results = await this.batchProcessor(currentBatch.map(({ resolve, reject, ...item }) => item));
      
      currentBatch.forEach((item: any, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach((item: any) => {
        item.reject(error);
      });
    }
  }
}

// Performance monitoring utilities
export const performanceUtils = {
  // Measure function execution time
  measureTime: <T extends (...args: any[]) => any>(
    fn: T,
    label?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (label) {
        console.log(`${label}: ${end - start}ms`);
      }
      
      return result;
    }) as T;
  },

  // Mark performance milestones
  mark: (name: string): void => {
    if ('mark' in performance) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measure: (name: string, startMark: string, endMark?: string): void => {
    if ('measure' in performance) {
      performance.measure(name, startMark, endMark);
    }
  },

  // Get performance entries
  getEntries: (type?: string): PerformanceEntry[] => {
    if ('getEntriesByType' in performance && type) {
      return performance.getEntriesByType(type);
    }
    return performance.getEntries();
  }
};

export default {
  optimizeImageUrl,
  useLazyLoading,
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  useMemoryMonitoring,
  usePerformanceMetrics,
  prefetchResource,
  dynamicImport,
  SimpleCache,
  createWorker,
  RequestBatcher,
  performanceUtils
};