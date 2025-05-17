// Web Vitals Performance Monitoring

interface WebVitalsMetric {
  id: string;
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | string;
  value: number;
  label?: string;
}

interface UnoptimizedImage {
  src: string;
  issue: string;
  element: HTMLImageElement;
  width?: number;
}

interface ResourceTimingEntry extends PerformanceResourceTiming {
  initiatorType: string;
}

// gtag type is already defined in global.d.ts

export function reportWebVitals(metric: WebVitalsMetric) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Custom logging for development
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[Web Vital] ${metric.name}: ${metric.value}`;
      // Using console.info for development logs is more appropriate
      if (typeof window !== 'undefined' && window.console) {
        window.console.info(logMessage);
      }
      
      // Warn if metrics are below thresholds
      const thresholds = {
        FCP: 1800,
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        TTFB: 800,
      };

      if (thresholds[metric.name as keyof typeof thresholds] && 
          metric.value > thresholds[metric.name as keyof typeof thresholds]) {
        console.warn(`[Web Vital] ${metric.name} is above threshold:`, {
          value: metric.value,
          threshold: thresholds[metric.name as keyof typeof thresholds]
        });
      }
    }
  }
}

// Image optimization checker
export function checkImageOptimization() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img');
  const unoptimizedImages: UnoptimizedImage[] = [];

  images.forEach((img) => {
    // Check for missing alt text
    if (!img.alt || img.alt.trim() === '') {
      unoptimizedImages.push({
        src: img.src,
        issue: 'Missing alt text',
        element: img
      });
    }

    // Check for large images without srcset
    if (img.naturalWidth > 1000 && !img.srcset) {
      unoptimizedImages.push({
        src: img.src,
        issue: 'Large image without srcset',
        width: img.naturalWidth,
        element: img
      });
    }

    // Check for non-optimized formats
    if (img.src.match(/\.(jpg|jpeg|png)$/i) && !img.src.includes('/_next/image')) {
      unoptimizedImages.push({
        src: img.src,
        issue: 'Not using Next.js Image optimization',
        element: img
      });
    }
  });

  if (unoptimizedImages.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('[Image Optimization] Found unoptimized images:', unoptimizedImages);
  }

  return unoptimizedImages;
}

// Font loading monitor
export function monitorFontLoading() {
  if (typeof window === 'undefined' || !document.fonts) return;

  document.fonts.ready.then(() => {
    const loadTime = performance.now();
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'font_load_time', {
        event_category: 'Performance',
        value: Math.round(loadTime),
        non_interaction: true,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      const message = `[Font Loading] Fonts loaded in: ${loadTime}ms`;
      if (typeof window !== 'undefined' && window.console) {
        window.console.info(message);
      }
    }
  });
}

// Resource timing analyzer
export function analyzeResourceTiming() {
  if (typeof window === 'undefined' || !performance.getEntriesByType) return;

  const resources = performance.getEntriesByType('resource') as ResourceTimingEntry[];
  const slowResources = resources.filter(r => r.duration > 500);

  if (slowResources.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('[Resource Timing] Slow resources:', 
      slowResources.map(r => ({
        name: r.name,
        duration: Math.round(r.duration),
        type: r.initiatorType
      }))
    );
  }

  // Group by type
  const resourcesByType: Record<string, number> = {};
  resources.forEach(r => {
    const type = r.initiatorType;
    resourcesByType[type] = (resourcesByType[type] || 0) + 1;
  });

  return {
    total: resources.length,
    byType: resourcesByType,
    slowResources: slowResources.length
  };
}

// Scroll performance monitor
export function monitorScrollPerformance() {
  if (typeof window === 'undefined') return;

  let scrollTimer: NodeJS.Timeout;
  let scrollCount = 0;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    scrollCount++;
    const now = Date.now();
    const timeSinceLastScroll = now - lastScrollTime;
    
    if (timeSinceLastScroll < 16) { // Less than 60fps
      console.warn('[Scroll Performance] Scroll event fired too frequently:', timeSinceLastScroll, 'ms');
    }
    
    lastScrollTime = now;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (process.env.NODE_ENV === 'development' && scrollCount > 100) {
        console.warn('[Scroll Performance] High scroll event count:', scrollCount);
      }
      scrollCount = 0;
    }, 1000);
  }, { passive: true });
}

// Initialize all monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      checkImageOptimization();
      analyzeResourceTiming();
      monitorFontLoading();
      monitorScrollPerformance();
    }, 1000);
  });
}