'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAnalytics, useErrorTracking, usePageViewTracking } from '@/hooks/use-analytics';

// Define context types
type AnalyticsContextType = ReturnType<typeof useAnalytics> & {
  error: ReturnType<typeof useErrorTracking>;
};

// Create the context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * Analytics provider component
 * Provides analytics tracking capabilities to the entire application
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize hooks
  const analytics = useAnalytics();
  const error = useErrorTracking();

  // Set up automatic page view tracking
  usePageViewTracking();

  // Set up global error tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalOnError = window.onerror;

      // Handle global errors
      window.onerror = (message, source, lineno, colno, error) => {
        // Track the error
        analytics.trackError({
          errorMessage: message.toString(),
          errorStack: error?.stack,
          severity: 'medium',
          timestamp: undefined,
        });

        // Call the original handler if it exists
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }

        // Return false to allow the default error handling
        return false;
      };

      // Handle promise rejections
      const originalOnUnhandledRejection = window.onunhandledrejection;

      window.onunhandledrejection = event => {
        // Track the rejection
        analytics.trackError({
          errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
          errorStack: event.reason?.stack,
          severity: 'medium',
          timestamp: undefined,
        });

        // Call the original handler if it exists
        if (originalOnUnhandledRejection) {
          return originalOnUnhandledRejection(event);
        }
      };

      // Clean up
      return () => {
        window.onerror = originalOnError;
        window.onunhandledrejection = originalOnUnhandledRejection;
      };
    }
  }, [analytics]);

  // Provide analytics context to children
  return (
    <AnalyticsContext.Provider value={{ ...analytics, error }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook to use the analytics context
 */
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }

  return context;
};

export default AnalyticsProvider;
