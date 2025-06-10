'use client';

import { useEffect } from 'react';
import { initializePerformanceOptimizations } from '@/lib/performance/core-web-vitals';

export default function PerformanceTracker() {
  useEffect(() => {
    // Initialize performance tracking on client side
    if (typeof window !== 'undefined') {
      try {
        initializePerformanceOptimizations();
      } catch (error) {
        console.warn('Performance tracking failed:', error);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}