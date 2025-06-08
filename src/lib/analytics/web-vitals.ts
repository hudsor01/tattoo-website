/**
 * Web Vitals Performance Monitoring
 *
 * Comprehensive performance tracking with Core Web Vitals,
 * custom metrics, and real-time monitoring capabilities.
 */
'use client';

// Remove unused web-vitals import
// import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

import { logger } from "@/lib/logger";
// Temporary type definitions - currently unused until web-vitals is installed
/*
type Metric = {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  navigationType?: string;
};
*/
import { useEffect } from 'react';

// Type declaration for Network Information API
declare global {
  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  }
}

// Performance thresholds (in milliseconds or score)
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
  INP: { good: 200, needs_improvement: 500 }, // Interaction to Next Paint
  CLS: { good: 0.1, needs_improvement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needs_improvement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needs_improvement: 1800 }, // Time to First Byte
} as const;

// Custom performance events
export interface CustomPerformanceEvent {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Performance monitoring configuration
interface PerformanceConfig {
  enableConsoleLogging: boolean;
  enableAnalytics: boolean;
  enableAlerts: boolean;
  sampleRate: number; // 0.0 to 1.0
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

const defaultConfig: PerformanceConfig = {
  enableConsoleLogging: nodeEnv === 'development',
  enableAnalytics: true,
  enableAlerts: nodeEnv === 'production',
  sampleRate: nodeEnv === 'production' ? 0.1 : 1.0, // 10% sampling in production
};

/**
 * Get performance rating based on thresholds
 * Currently disabled until web-vitals package is installed
 */
/*
function getPerformanceRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!thresholds) return 'good';

  if (metric.value <= thresholds.good) return 'good';
  if (metric.value <= thresholds.needs_improvement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics service
 */
/*
async function sendToAnalytics(metric: Metric, rating: string) {
  try {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_parameter_1: rating,
        custom_parameter_2: metric.navigationType,
      });
    }

    // Send to custom analytics endpoint
    if (defaultConfig.enableAnalytics) {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating,
          navigationType: metric.navigationType,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection:
            'connection' in navigator && navigator.connection
              ? {
                  effectiveType: navigator.connection.effectiveType,
                  downlink: navigator.connection.downlink,
                  rtt: navigator.connection.rtt,
                }
              : null,
        }),
      });
    }
  } catch (error) {
    void void logger.error('Failed to send analytics:', error);
  }
}
*/

/**
 * Log performance alerts for poor metrics
 */
/*
function logPerformanceAlert(metric: Metric, rating: string) {
  if (rating === 'poor' && defaultConfig.enableAlerts) {
    void void logger.warn(`🚨 Performance Alert: ${metric.name}`, {
      value: metric.value,
      threshold: PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS],
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // In production, you might want to send alerts to a monitoring service
    if (ENV.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // sendToMonitoringService(metric, rating);
    }
  }
}
*/

/**
 * Handle individual metric measurement
 * Currently disabled until web-vitals package is installed
 */
/*
function handleMetric(metric: Metric) {
  // Sample rate check
  if (Math.random() > defaultConfig.sampleRate) {
    return;
  }

  const rating = getPerformanceRating(metric);

  if (defaultConfig.enableConsoleLogging) {
    void void logger.error(`📊 ${metric.name}:`, {
      value: metric.value,
      rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  }

  // Send to analytics
  void sendToAnalytics(metric, rating);

  // Log alerts for poor performance
  logPerformanceAlert(metric, rating);
}
*/

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(config: Partial<PerformanceConfig> = {}) {
  Object.assign(defaultConfig, config);

  try {
    // Web Vitals monitoring currently disabled - requires web-vitals package installation
    // Core Web Vitals tracking would be implemented here:
    // - onCLS(handleMetric) for Cumulative Layout Shift
    // - onINP(handleMetric) for Interaction to Next Paint
    // - onLCP(handleMetric) for Largest Contentful Paint

    // Additional metrics
    // onFCP(handleMetric);
    // onTTFB(handleMetric);

    void void logger.warn('🔄 Web Vitals monitoring disabled - install web-vitals package');
  } catch (error) {
    void void logger.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Track custom performance events
 */
export function trackCustomMetric(event: CustomPerformanceEvent) {
  if (defaultConfig.enableConsoleLogging) {
    void void logger.error(`📈 Custom Metric: ${event.name}`, event);
  }

  if (defaultConfig.enableAnalytics) {
    fetch('/api/analytics/custom-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      void void logger.error('Failed to send custom metric:', error);
    });
  }
}

/**
 * Measure and track component render time
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    trackCustomMetric({
      name: 'component_render_time',
      value: renderTime,
      timestamp: Date.now(),
      metadata: {
        component: componentName,
        url: window.location.href,
      },
    });

    return renderTime;
  };
}

/**
 * Track navigation timing
 */
export function trackNavigationTiming() {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = {
        dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp_connection: navigation.connectEnd - navigation.connectStart,
        ssl_handshake:
          navigation.secureConnectionStart > 0
            ? navigation.connectEnd - navigation.secureConnectionStart
            : 0,
        server_response: navigation.responseStart - navigation.requestStart,
        document_download: navigation.responseEnd - navigation.responseStart,
        dom_processing: navigation.domComplete - navigation.domContentLoadedEventStart,
        total_load_time: navigation.loadEventEnd - navigation.fetchStart,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        if (value > 0) {
          trackCustomMetric({
            name: `navigation_${name}`,
            value,
            timestamp: Date.now(),
            metadata: {
              navigationType: navigation.type,
              url: window.location.href,
            },
          });
        }
      });
    }
  }
}

/**
 * Track resource loading performance
 */
export function trackResourceTiming() {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    resources.forEach((resource) => {
      if (resource.initiatorType === 'img' || resource.initiatorType === 'link') {
        const loadTime = resource.responseEnd - resource.startTime;

        trackCustomMetric({
          name: 'resource_load_time',
          value: loadTime,
          timestamp: Date.now(),
          metadata: {
            resourceType: resource.initiatorType,
            resourceUrl: resource.name,
            transferSize: resource.transferSize,
            decodedBodySize: resource.decodedBodySize,
          },
        });
      }
    });
  }
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitoring(componentName: string) {
  const measureRender = measureRenderTime(componentName);

  // Track component mount time
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    measureRender();

    return () => {
      // Component unmount
      trackCustomMetric({
        name: 'component_unmount',
        value: Date.now(),
        timestamp: Date.now(),
        metadata: {
          component: componentName,
        },
      });
    };
  }, [componentName, measureRender]);
}

// Global declaration for gtag
declare global {
  function gtag(command: string, action: string, options?: Record<string, unknown>): void;
}
