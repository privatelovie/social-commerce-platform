/**
 * Analytics and Monitoring utilities
 */

// Event tracking interface
export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

// Error tracking interface
export interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  userId?: string;
  userAgent?: string;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

// Performance metrics interface
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | '%';
  timestamp?: Date;
  context?: Record<string, any>;
}

// Analytics service class
export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private errors: ErrorEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private userId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorTracking();
    this.initializePerformanceTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Set user ID for tracking
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Track custom events
  track(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      userId: this.userId || undefined,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.sendToAnalytics('event', fullEvent);
  }

  // Track page views
  trackPageView(page: string, title?: string, referrer?: string): void {
    this.track({
      name: 'page_view',
      category: 'navigation',
      action: 'view',
      label: page,
      properties: {
        title,
        referrer,
        url: window.location.href,
        path: window.location.pathname
      }
    });
  }

  // Track user interactions
  trackInteraction(element: string, action: string, context?: Record<string, any>): void {
    this.track({
      name: 'user_interaction',
      category: 'engagement',
      action,
      label: element,
      properties: context
    });
  }

  // Track commerce events
  trackPurchase(transactionId: string, amount: number, currency: string, items: any[]): void {
    this.track({
      name: 'purchase',
      category: 'ecommerce',
      action: 'purchase',
      value: amount,
      properties: {
        transactionId,
        currency,
        items,
        itemCount: items.length
      }
    });
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number = 1): void {
    this.track({
      name: 'add_to_cart',
      category: 'ecommerce',
      action: 'add_to_cart',
      label: productName,
      value: price * quantity,
      properties: {
        productId,
        productName,
        price,
        quantity
      }
    });
  }

  // Track social interactions
  trackSocialShare(platform: string, contentType: string, contentId: string): void {
    this.track({
      name: 'social_share',
      category: 'social',
      action: 'share',
      label: platform,
      properties: {
        platform,
        contentType,
        contentId
      }
    });
  }

  trackSocialLike(contentType: string, contentId: string): void {
    this.track({
      name: 'social_like',
      category: 'social',
      action: 'like',
      label: contentType,
      properties: {
        contentType,
        contentId
      }
    });
  }

  // Error tracking
  private initializeErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        severity: 'high'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'medium'
      });
    });
  }

  trackError(error: Omit<ErrorEvent, 'timestamp' | 'userAgent' | 'userId'>): void {
    if (!this.isEnabled) return;

    const fullError: ErrorEvent = {
      ...error,
      userId: this.userId || undefined,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };

    this.errors.push(fullError);
    this.sendToAnalytics('error', fullError);
  }

  // Performance tracking
  private initializePerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.trackMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
          this.trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
          this.trackMetric('first_byte_time', navigation.responseStart - navigation.requestStart, 'ms');
        }

        // Track paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          this.trackMetric(entry.name.replace('-', '_'), entry.startTime, 'ms');
        });
      }, 0);
    });

    // Track largest contentful paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackMetric('largest_contentful_paint', lastEntry.startTime, 'ms');
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    }
  }

  trackMetric(name: string, value: number, unit: PerformanceMetric['unit'], context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.metrics.push(metric);
    this.sendToAnalytics('metric', metric);
  }

  // Memory usage tracking
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.trackMetric('used_js_heap_size', memory.usedJSHeapSize, 'bytes');
      this.trackMetric('total_js_heap_size', memory.totalJSHeapSize, 'bytes');
      this.trackMetric('js_heap_size_limit', memory.jsHeapSizeLimit, 'bytes');
      
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.trackMetric('memory_usage_percentage', usagePercentage, '%');
    }
  }

  // Bundle size tracking
  trackBundleSize(): void {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;

      resources.forEach((resource) => {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
          
          if (resource.name.endsWith('.js')) {
            jsSize += resource.transferSize;
          } else if (resource.name.endsWith('.css')) {
            cssSize += resource.transferSize;
          }
        }
      });

      this.trackMetric('total_bundle_size', totalSize, 'bytes');
      this.trackMetric('js_bundle_size', jsSize, 'bytes');
      this.trackMetric('css_bundle_size', cssSize, 'bytes');
    }
  }

  // Custom timing
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.trackMetric(name, endTime - startTime, 'ms');
    };
  }

  // User session tracking
  trackSessionDuration(): void {
    const sessionStart = Date.now();
    
    const trackDuration = () => {
      const duration = Date.now() - sessionStart;
      this.trackMetric('session_duration', duration, 'ms');
    };

    // Track on page unload
    window.addEventListener('beforeunload', trackDuration);
    
    // Track periodically for long sessions
    setInterval(trackDuration, 5 * 60 * 1000); // Every 5 minutes
  }

  // A/B testing support
  trackExperiment(experimentId: string, variant: string, outcome?: string): void {
    this.track({
      name: 'experiment_exposure',
      category: 'experiments',
      action: 'expose',
      label: experimentId,
      properties: {
        experimentId,
        variant,
        outcome
      }
    });
  }

  // Funnel tracking
  trackFunnelStep(funnelName: string, stepName: string, stepIndex: number): void {
    this.track({
      name: 'funnel_step',
      category: 'funnel',
      action: 'step',
      label: funnelName,
      value: stepIndex,
      properties: {
        funnelName,
        stepName,
        stepIndex
      }
    });
  }

  // Send data to analytics providers
  private sendToAnalytics(type: 'event' | 'error' | 'metric', data: any): void {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      if (type === 'event') {
        gtag('event', data.name, {
          event_category: data.category,
          event_label: data.label,
          value: data.value,
          custom_parameters: data.properties
        });
      }
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(type, data);
  }

  private async sendToCustomEndpoint(type: string, data: any): Promise<void> {
    try {
      const payload = {
        type,
        data,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In a real implementation, you would send to your analytics API
      console.log('Analytics:', payload);
      
      // Example: fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  // Get analytics summary
  getSummary(): {
    events: number;
    errors: number;
    metrics: number;
    sessionId: string;
    userId: string | null;
  } {
    return {
      events: this.events.length,
      errors: this.errors.length,
      metrics: this.metrics.length,
      sessionId: this.sessionId,
      userId: this.userId
    };
  }

  // Clear local data
  clearData(): void {
    this.events = [];
    this.errors = [];
    this.metrics = [];
  }

  // Export data for debugging
  exportData(): {
    events: AnalyticsEvent[];
    errors: ErrorEvent[];
    metrics: PerformanceMetric[];
  } {
    return {
      events: [...this.events],
      errors: [...this.errors],
      metrics: [...this.metrics]
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackSocialShare: analytics.trackSocialShare.bind(analytics),
    trackSocialLike: analytics.trackSocialLike.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackMetric: analytics.trackMetric.bind(analytics),
    startTiming: analytics.startTiming.bind(analytics),
    trackExperiment: analytics.trackExperiment.bind(analytics),
    trackFunnelStep: analytics.trackFunnelStep.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics)
  };
};

// Utility functions
export const AnalyticsUtils = {
  // Get device information
  getDeviceInfo: () => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  }),

  // Get page performance info
  getPagePerformance: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      domInteractive: navigation.domInteractive - navigation.navigationStart,
      domComplete: navigation.domComplete - navigation.navigationStart
    };
  },

  // Check if user is returning visitor
  isReturningVisitor: (): boolean => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      localStorage.setItem('hasVisited', 'true');
      return false;
    }
    return true;
  },

  // Generate unique identifier
  generateUniqueId: (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export default {
  AnalyticsService,
  analytics,
  useAnalytics,
  AnalyticsUtils
};