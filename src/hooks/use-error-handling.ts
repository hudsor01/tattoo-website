'use client';

/**
 * Standardized error handling hook
 * 
 * This hook provides access to the error handling system for consistent
 * error management throughout the application.
 */

import { useCallback } from 'react';
import { useErrorHandler, ErrorContext, ErrorCategory } from '@/lib/error/error-handler';
import { ErrorSeverity } from '@/lib/toast/enhanced-toast';

/**
 * Hook for handling errors in React components
 */
export function useErrorHandling(defaultContext?: ErrorContext) {
  const handleError = useErrorHandler(defaultContext);

  /**
   * Wrap an async function with try-catch and error handling
   */
  const withErrorHandling = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    contextOverrides?: Partial<ErrorContext>
  ) => {
    return async (...args: Args): Promise<T | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, contextOverrides);
        return undefined;
      }
    };
  }, [handleError]);

  /**
   * Wrap an event handler with error handling
   */
  const withErrorHandlingSync = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => T,
    contextOverrides?: Partial<ErrorContext>
  ) => {
    return (...args: Args): T | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        handleError(error, contextOverrides);
        return undefined;
      }
    };
  }, [handleError]);

  return {
    handleError,
    withErrorHandling,
    withErrorHandlingSync,
    ErrorCategory,
    ErrorSeverity,
  };
}

export default useErrorHandling;
