/**
 * Core Web Vitals Optimization
 * Performance monitoring and optimization utilities
 */

import { logger } from '@/lib/logger';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface PerformanceConfig {
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  ttfb: { good: number; poor: number };
  inp: { good: number; poor: number };
}

// Core Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS: PerformanceConfig = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
};

/**
 * Get performance rating based on thresholds
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof PerformanceConfig];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track FCP (First Contentful Paint)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
        reportWebVital({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('fcp', entry.startTime),
          delta: 0,
          id: 'fcp'
        });
      }
    }
  });

  if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
    observer.observe({ entryTypes: ['paint'] });
  }

  // Track LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    reportWebVital({
      name: 'LCP',
      value: lastEntry.startTime,
      rating: getRating('lcp', lastEntry.startTime),
      delta: 0,
      id: 'lcp'
    });
  });

  if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Track CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      };
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value ?? 0;
      }
    }
    reportWebVital({
      name: 'CLS',
      value: clsValue,
      rating: getRating('cls', clsValue),
      delta: 0,
      id: 'cls'
    });
  });

  if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  // Track FID (First Input Delay)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const firstInputEntry = entry as PerformanceEntry & {
        processingStart?: number;
      };
      const fidValue = (firstInputEntry.processingStart ?? 0) - entry.startTime;
      reportWebVital({
        name: 'FID',
        value: fidValue,
        rating: getRating('fid', fidValue),
        delta: 0,
        id: 'fid'
      });
    }
  });

  if (PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
    fidObserver.observe({ entryTypes: ['first-input'] });
  }

  // Track TTFB (Time to First Byte)
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.requestStart;
    reportWebVital({
      name: 'TTFB',
      value: ttfb,
      rating: getRating('ttfb', ttfb),
      delta: 0,
      id: 'ttfb'
    });
  }
}

/**
 * Report Web Vital metric
 */
function reportWebVital(metric: WebVitalsMetric) {
  // Send to analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      custom_parameter: metric.id
    });
  }

  // Send to Vercel Analytics if available
  if (typeof window !== 'undefined' && 'va' in window) {
    const va = (window as { va?: (...args: unknown[]) => void }).va;
    va?.('track', 'Web Vital', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating
    });
  }

  // Log performance issue if poor
  if (metric.rating === 'poor') {
    void logger.warn(`Poor ${metric.name} performance`, {
      value: metric.value,
      threshold: PERFORMANCE_THRESHOLDS[metric.name.toLowerCase() as keyof PerformanceConfig]
    });
  }
}

/**
 * Optimize images for better LCP
 */
export function optimizeImages() {
  if (typeof window === 'undefined') return;

  // Preload critical images
  const criticalImages = [
    '/images/japanese.jpg',
    '/images/traditional.jpg',
    '/images/realism.jpg',
    '/logo.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Lazy load non-critical images
  const images = document.querySelectorAll('img[data-lazy]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.lazy) {
          img.src = img.dataset.lazy;
          img.removeAttribute('data-lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Optimize fonts for better CLS
 */
export function optimizeFonts() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const criticalFonts = [
    '/fonts/inter.woff2',
    '/fonts/montserrat.woff2'
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });
}

/**
 * Monitor and report resource loading
 */
export function monitorResources() {
  if (typeof window === 'undefined') return;

  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      
      // Report slow resources
      if (resource.duration > 1000) {
        void logger.warn('Slow resource loading', {
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize
        });
      }
    }
  });

  if (PerformanceObserver.supportedEntryTypes?.includes('resource')) {
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
}

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  trackWebVitals();
  
  // Optimize resources
  optimizeImages();
  optimizeFonts();
  monitorResources();

  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cal.com',
    'https://api.cal.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * Get performance recommendations
 */
export function getPerformanceRecommendations() {
  return {
    images: [
      'Use Next.js Image component for automatic optimization',
      'Implement proper lazy loading for below-fold images',
      'Use WebP/AVIF formats for better compression',
      'Add appropriate sizing and priority attributes',
      'Preload critical above-fold images'
    ],
    fonts: [
      'Use font-display: swap for better FCP',
      'Preload critical font files',
      'Limit the number of font variations',
      'Use system fonts as fallbacks',
      'Enable font subsetting'
    ],
    javascript: [
      'Code split by route and component',
      'Use dynamic imports for non-critical code',
      'Minimize and compress JavaScript bundles',
      'Remove unused dependencies',
      'Use service workers for caching'
    ],
    css: [
      'Inline critical CSS',
      'Remove unused CSS rules',
      'Use CSS containment where appropriate',
      'Minimize layout shifts with aspect ratios',
      'Optimize CSS delivery'
    ],
    general: [
      'Enable compression (gzip/brotli)',
      'Use CDN for static assets',
      'Implement proper caching strategies',
      'Minimize third-party scripts',
      'Monitor Core Web Vitals regularly'
    ]
  };
}