'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalyticsContext } from '@/components/providers/AnalyticsProvider';

/**
 * Enhanced hook for tracking page views in the application
 * 
 * This hook automatically tracks page views when the route changes.
 * It uses the analytics context from AnalyticsProvider.
 */
export function usePageViewTracking(options?: {
  /** Optional custom page title (defaults to document.title) */
  pageTitle?: string;
  /** Delay in ms before tracking the page view (default 200ms) */
  delay?: number;
  /** Skip automatic tracking (useful for custom tracking implementation) */
  disableAutoTracking?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalyticsContext();
  const lastTrackedRef = useRef<string | null>(null);
  
  // Determine page type from path
  const getPageType = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/gallery')) return 'gallery';
    if (path.startsWith('/booking')) return 'booking';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/admin-dashboard')) return 'admin-dashboard';
    if (path.startsWith('/client-portal')) return 'client-portal';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/faq')) return 'faq';
    return 'other';
  };
  
  // Function to track page view that can be called manually
  const trackCurrentPageView = () => {
    // Skip tracking during development if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_ANALYTICS_IN_DEV === 'true') {
      return;
    }
    
    if (!pathname) return; // Guard against undefined pathname
    
    // Get page title
    const pageTitle = options?.pageTitle || (typeof document !== 'undefined' ? document.title : 'Untitled Page');
    
    // Get page type from path structure
    const pageType = getPageType(pathname);
    
    // Track page view with page title and full path including query params
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname;
    
    // Prevent duplicate tracking for the same path
    if (lastTrackedRef.current === fullPath) {
      return;
    }
    
    // Measure load time
    const loadTime = 
      typeof window !== 'undefined' && 
      window.performance && 
      window.performance.timing && 
      window.performance.timing.loadEventEnd > 0
        ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
        : undefined;
    
    // Track the page view
    trackPageView({
      pageTitle,
      pageType,
      path: fullPath,
      loadTime,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    });
    
    // Update last tracked path
    lastTrackedRef.current = fullPath;
  };
  
  // Automatic tracking effect
  useEffect(() => {
    // Skip if auto-tracking is disabled
    if (options?.disableAutoTracking) {
      return;
    }
    
    // Add a small delay to ensure page is fully loaded and prevent rapid-fire tracking
    const delay = options?.delay ?? 200;
    const timeoutId = setTimeout(trackCurrentPageView, delay);
    
    // Cleanup function
    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams, options?.disableAutoTracking, options?.delay]);
  
  // Return the function for manual tracking
  return { trackCurrentPageView };
}

export default usePageViewTracking;