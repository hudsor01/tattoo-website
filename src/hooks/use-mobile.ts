'use client';

import { useEffect, useState } from 'react';
import { isBrowser, safeMatchMedia, safeInnerWidth } from '@/lib/browser';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile devices based on screen width
 * Safe for use in both client and server environments
 */
export function useIsMobile() {
  // Default to undefined during SSR, false is a safer default
  const [isMobile, setIsMobile] = useState<boolean>(
    isBrowser ? safeInnerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    // Only run on client-side
    if (!isBrowser) {
      return;
    }

    // Set initial value
    setIsMobile(safeInnerWidth < MOBILE_BREAKPOINT);

    // Add event listener safely
    const mql = safeMatchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Use the appropriate event listener method
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else {
      // Fallback for older browsers
      mql.addListener?.(onChange);
    }
    
    // Cleanup function
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else {
        // Fallback for older browsers
        mql.removeListener?.(onChange);
      }
    };
  }, []);

  return isMobile;
}

export default useIsMobile;
