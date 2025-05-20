'use client';

import { usePageViewTracking } from '@/hooks/use-page-view-tracking';

/**
 * Component for automatic page view tracking
 * 
 * This component automatically tracks page views when routes change.
 * It should be placed high in the component tree to track all page navigations.
 */
export function PageViewTracker() {
  // Use the enhanced hook for tracking
  usePageViewTracking();
  
  // This component doesn't render anything
  return null;
}
