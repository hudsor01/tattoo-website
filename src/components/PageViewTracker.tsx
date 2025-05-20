'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAnalyticsContext } from './providers/AnalyticsProvider';

/**
 * Component for automatic page view tracking
 * 
 * This component automatically tracks page views when routes change.
 * It should be placed high in the component tree to track all page navigations.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalyticsContext();
  const lastTrackedRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Skip tracking during development if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_ANALYTICS_IN_DEV === 'true') {
      return;
    }
    
    // Get page title
    const pageTitle = document.title || 'Untitled Page';
    
    // Get page type from path structure
    let pageType = 'other';
    
    if (pathname === '/') {
      pageType = 'home';
    } else if (pathname.startsWith('/gallery')) {
      pageType = 'gallery';
    } else if (pathname.startsWith('/booking')) {
      pageType = 'booking';
    } else if (pathname.startsWith('/admin')) {
      pageType = 'admin';
    } else if (pathname.startsWith('/client-portal')) {
      pageType = 'client-portal';
    } else if (pathname.startsWith('/about')) {
      pageType = 'about';
    } else if (pathname.startsWith('/contact')) {
      pageType = 'contact';
    }
    
    // Track page view with page title and full path including query params
    const fullPath = searchParams.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname;
    
    // Prevent duplicate tracking for the same path
    if (lastTrackedRef.current === fullPath) {
      return;
    }
    
    // Measure load time
    const loadTime = 
      window.performance && 
      window.performance.timing && 
      window.performance.timing.loadEventEnd > 0
        ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
        : undefined;
    
    // Add a small delay to ensure page is fully loaded and prevent rapid-fire tracking
    const timeoutId = setTimeout(() => {
      // Track the page view
      trackPageView({
        pageTitle,
        pageType,
        path: fullPath,
        loadTime,
        referrer: document.referrer || undefined,
      });
      
      // Update last tracked path
      lastTrackedRef.current = fullPath;
    }, 100);
    
    // Cleanup function
    return () => clearTimeout(timeoutId);
    
  }, [pathname, searchParams, trackPageView]);
  
  // This component doesn't render anything
  return null;
}
