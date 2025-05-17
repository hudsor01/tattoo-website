/**
 * Page View Tracking Hook
 * 
 * This hook automatically tracks page views for analytics purposes.
 * It uses the useEventTracking hook to record page views when routes change.
 */
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useEventTracking } from './use-analytics';

export function usePageViewTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { track } = useEventTracking();
  
  // Track page views when route changes
  useEffect(() => {
    // Don't track during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Create a page identifier that includes query parameters
    const queryString = searchParams?.toString();
    const pageId = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Extract page type from the URL
    let pageType = 'other';
    
    if (pathname === '/') pageType = 'home';
    else if (pathname?.startsWith('/gallery')) pageType = 'gallery';
    else if (pathname?.startsWith('/booking')) pageType = 'booking';
    else if (pathname?.startsWith('/artists')) pageType = 'artists';
    else if (pathname?.startsWith('/admin')) pageType = 'admin';
    else if (pathname?.startsWith('/contact')) pageType = 'contact';
    else if (pathname?.startsWith('/about')) pageType = 'about';
    
    // Track the page view
    track('page_view', pageId, { pageType });
    
    // Special case for gallery index page
    if (pageType === 'gallery' && pathname === '/gallery') {
      track('gallery_view', 'gallery_index');
    }
  }, [pathname, searchParams, track]);
  
  // No need to return anything as this hook is just for side effects
  return null;
}
