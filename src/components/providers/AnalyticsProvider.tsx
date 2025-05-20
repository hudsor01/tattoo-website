'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAnalytics, useErrorTracking } from '@/hooks/use-analytics';

/**
 * Context type for analytics provider
 */
type AnalyticsContextType = ReturnType<typeof useAnalytics> & {
  error: ReturnType<typeof useErrorTracking>;
  isEnabled: boolean;
};

// Create the context with default value
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * Analytics provider component props
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
  disabled?: boolean;
  enableLogging?: boolean;
}

/**
 * Analytics provider component
 * Provides analytics tracking capabilities to the entire application
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  disabled = false,
  enableLogging = false
}) => {
  // Initialize hooks
  const analytics = useAnalytics();
  const error = useErrorTracking();
  const errorCountRef = useRef<number>(0);

  // Set up enhanced error tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && !disabled) {
      // Store original handlers
      const originalOnError = window.onerror;
      const originalOnUnhandledRejection = window.onunhandledrejection;

      // Handle global errors
      window.onerror = (message, source, lineno, colno, error) => {
        // Increment error count
        errorCountRef.current += 1;
        
        // Track the error
        try {
          // Add source code location if available
          const location = source ? `${source}:${lineno}:${colno}` : undefined;
          const errorMessage = typeof message === 'string' ? message : message.toString();
          
          analytics.trackError({
            errorMessage: errorMessage,
            errorStack: error?.stack,
            severity: 'medium',
            label: location,
            timestamp: new Date(),
          });
          
          if (enableLogging) {
            console.group('Analytics Error Tracking');
            console.error(`Error tracked: ${errorMessage}`);
            console.error('Location:', location);
            console.error('Stack:', error?.stack);
            console.groupEnd();
          }
        } catch (trackingError) {
          // Prevent infinite loop if error tracking itself fails
          if (enableLogging) {
            console.error('Failed to track error:', trackingError);
          }
        }

        // Call the original handler if it exists
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }

        // Return false to allow the default error handling
        return false;
      };

      // Handle promise rejections
      window.onunhandledrejection = event => {
        // Increment error count
        errorCountRef.current += 1;
        
        try {
          // Track the rejection
          analytics.trackError({
            errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
            errorStack: event.reason?.stack,
            severity: 'high', // Unhandled rejections are more severe
            timestamp: new Date(),
          });
          
          if (enableLogging) {
            console.group('Analytics Unhandled Rejection Tracking');
            console.error(`Unhandled rejection: ${event.reason?.message || 'Unknown reason'}`);
            console.error('Rejection details:', event.reason);
            console.groupEnd();
          }
        } catch (trackingError) {
          // Prevent infinite loop if error tracking itself fails
          if (enableLogging) {
            console.error('Failed to track unhandled rejection:', trackingError);
          }
        }

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
  }, [analytics, disabled, enableLogging]);

  // Provide analytics context to children
  return (
    <AnalyticsContext.Provider 
      value={{ 
        ...analytics, 
        error,
        isEnabled: !disabled
      }}
    >
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
