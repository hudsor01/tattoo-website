/**
 * Core Web Vitals Optimization Component for Ink 37 Tattoos
 * 
 * Implements performance optimizations that directly impact SEO rankings:
 * - Largest Contentful Paint (LCP) optimization
 * - First Input Delay (FID) optimization  
 * - Cumulative Layout Shift (CLS) prevention
 * - Critical resource preloading
 */

'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface WebVitalsOptimizationProps {
  enableWebVitalsTracking?: boolean;
  criticalImages?: string[];
  preloadFonts?: string[];
}

export default function WebVitalsOptimization({
  enableWebVitalsTracking = true,
  criticalImages = [],
  preloadFonts = [],
}: WebVitalsOptimizationProps) {
  
  useEffect(() => {
    // Preload critical images for LCP optimization
    criticalImages.forEach(imageSrc => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageSrc;
      document.head.appendChild(link);
    });

    // Optimize font loading for CLS prevention
    preloadFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Implement intersection observer for lazy loading optimization
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Implement resource hints for better performance
    const resourceHints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
      { rel: 'dns-prefetch', href: 'https://api.cal.com' },
    ];

    resourceHints.forEach(hint => {
      const existingLink = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) {
          link.crossOrigin = hint.crossOrigin;
        }
        document.head.appendChild(link);
      }
    });

  }, [criticalImages, preloadFonts]);

  // Web Vitals tracking function
  const reportWebVitals = (metric: any) => {
    if (enableWebVitalsTracking && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        custom_map: {
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        },
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  };

  return (
    <>
      {/* Critical CSS inlining for above-the-fold content */}
      <style jsx>{`
        /* Critical CSS for initial render optimization */
        .hero-section {
          min-height: 50vh;
          background-image: url('/images/traditional.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        /* Prevent layout shift during font loading */
        .font-loading {
          font-display: swap;
          visibility: hidden;
        }
        
        .font-loaded .font-loading {
          visibility: visible;
        }
        
        /* Lazy loading placeholder styles */
        .lazy {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .lazy.loaded {
          opacity: 1;
        }
        
        /* Image optimization for gallery */
        .gallery-image {
          width: 100%;
          height: auto;
          object-fit: cover;
          aspect-ratio: 4/3;
        }
        
        /* Skeleton loader for CLS prevention */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Optimize button interactions for FID */
        .interactive-element {
          touch-action: manipulation;
          user-select: none;
        }
        
        /* Ensure proper aspect ratios to prevent CLS */
        .aspect-ratio-container {
          position: relative;
          width: 100%;
        }
        
        .aspect-ratio-container::before {
          content: '';
          display: block;
          padding-top: 75%; /* 4:3 aspect ratio */
        }
        
        .aspect-ratio-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      `}</style>

      {/* Web Vitals tracking script */}
      {enableWebVitalsTracking && (
        <Script
          id="web-vitals-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Web Vitals tracking implementation
              (function() {
                function reportWebVitals(metric) {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', metric.name, {
                      custom_map: {
                        metric_id: metric.id,
                        metric_value: metric.value,
                        metric_delta: metric.delta,
                      },
                      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                      event_category: 'Web Vitals',
                      event_label: metric.id,
                      non_interaction: true,
                    });
                  }
                }

                // Import and use web-vitals library if available
                if (typeof webVitals !== 'undefined') {
                  webVitals.getCLS(reportWebVitals);
                  webVitals.getFID(reportWebVitals);
                  webVitals.getLCP(reportWebVitals);
                  webVitals.getFCP(reportWebVitals);
                  webVitals.getTTFB(reportWebVitals);
                }
              })();
            `,
          }}
        />
      )}

      {/* Service Worker registration for caching optimization */}
      <Script
        id="service-worker-registration"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered: ', registration);
                }).catch(function(registrationError) {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `,
        }}
      />
    </>
  );
}

/**
 * Hook for reporting custom Web Vitals metrics
 */
export function useWebVitalsReporting() {
  useEffect(() => {
    // Custom performance observers for detailed tracking
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      
      // Track Long Tasks (affects FID)
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration);
          }
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }

      // Track Layout Shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (clsValue > 0.1) {
          console.warn('High CLS detected:', clsValue);
        }
      });
      
      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift API not supported
      }

      // Track Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP API not supported
      }

      return () => {
        longTaskObserver.disconnect();
        layoutShiftObserver.disconnect();
        lcpObserver.disconnect();
      };
    }
  }, []);
}

/**
 * Component for critical resource preloading
 */
export function CriticalResourcePreloader({ images = [], fonts = [] }: { images?: string[]; fonts?: string[] }) {
  return (
    <>
      {/* Preload critical images */}
      {images.map((src, index) => (
        <link
          key={`preload-image-${index}`}
          rel="preload"
          as="image"
          href={src}
        />
      ))}
      
      {/* Preload critical fonts */}
      {fonts.map((href, index) => (
        <link
          key={`preload-font-${index}`}
          rel="preload"
          as="font"
          type="font/woff2"
          href={href}
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
