/**
 * Web Vitals Tracker Component
 *
 * Client-side component that initializes Web Vitals monitoring
 * and tracks performance metrics throughout the application.
 */
'use client';

import { useEffect } from 'react';
import { initWebVitals, trackNavigationTiming } from '@/lib/analytics/web-vitals';

interface WebVitalsTrackerProps {
  enableLogging?: boolean;
  sampleRate?: number;
}

export default function WebVitalsTracker({
  enableLogging = process.env.NODE_ENV === 'development',
  sampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
}: WebVitalsTrackerProps) {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals({
      enableConsoleLogging: enableLogging,
      enableAnalytics: true,
      enableAlerts: process.env.NODE_ENV === 'production',
      sampleRate,
    });

    // Track navigation timing after initial load
    const trackNavigation = () => {
      setTimeout(() => {
        trackNavigationTiming();
      }, 0);
    };

    if (document.readyState === 'complete') {
      trackNavigation();
    } else {
      window.addEventListener('load', trackNavigation);
    }

    return () => {
      window.removeEventListener('load', trackNavigation);
    };
  }, [enableLogging, sampleRate]);

  // Component doesn't render anything visible
  return null;
}
