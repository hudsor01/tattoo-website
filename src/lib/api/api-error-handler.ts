'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ErrorContext, handleError, ErrorCategory } from '@/lib/error/error-handler';
import { ErrorSeverity } from '@/lib/toast/enhanced-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';

/**
 * Standard error handler for React Query mutations
 */
export function createMutationErrorHandler(
  context: Omit<ErrorContext, 'action'>,
  action = 'mutation'
) {
  return (error: unknown) => {
    handleError(error, {
      ...context,
      action,
    });
  };
}

/**
 * Standard error handler for React Query queries
 */
export function createQueryErrorHandler(
  context: Omit<ErrorContext, 'action'>,
  action = 'query'
) {
  return (error: unknown) => {
    handleError(error, {
      ...context,
      action,
    });
  };
}

/**
 * Hook for managing API errors in components
 */
export function useApiErrorHandling(defaultContext?: Omit<ErrorContext, 'action'>) {
  const { handleError } = useErrorHandling(defaultContext);
  const queryClient = useQueryClient();

  /**
   * Handle a query error
   */
  const handleQueryError = (error: unknown, contextOverrides?: Partial<ErrorContext>) => {
    handleError(error, {
      ...defaultContext,
      action: 'query',
      ...contextOverrides,
    });
  };

  /**
   * Handle a mutation error
   */
  const handleMutationError = (error: unknown, contextOverrides?: Partial<ErrorContext>) => {
    handleError(error, {
      ...defaultContext,
      action: 'mutation',
      ...contextOverrides,
    });
  };

  /**
   * Reset the error state for a query
   */
  const resetQueryError = (queryKey: any[]) => {
    queryClient.resetQueries({ queryKey });
  };

  /**
   * Create standard error handlers for a React Query mutation
   */
  const createMutationOptions = (actionName: string, severity = ErrorSeverity.MEDIUM) => ({
    onError: (error: unknown) => {
      handleMutationError(error, {
        action: actionName,
        severity,
      });
    },
  });

  /**
   * Create standard error handlers for a React Query query
   */
  const createQueryOptions = (actionName: string, severity = ErrorSeverity.MEDIUM) => ({
    onError: (error: unknown) => {
      handleQueryError(error, {
        action: actionName,
        severity,
      });
    },
  });

  return {
    handleQueryError,
    handleMutationError,
    resetQueryError,
    createMutationOptions,
    createQueryOptions,
  };
}

/**
 * Error handler for tRPC procedures
 */
export function createTRPCErrorHandler(
  context: Omit<ErrorContext, 'action'>,
  action = 'trpc'
) {
  return (error: unknown) => {
    handleError(error, {
      ...context,
      action,
    });
  };
}

/**
 * Default API error handlers that can be used directly
 */
export const defaultApiErrorHandlers = {
  /**
   * General API error handler
   */
  general: (error: unknown) => {
    handleError(error, {
      component: 'API',
      action: 'request',
      severity: ErrorSeverity.MEDIUM,
    });
  },

  /**
   * Authentication error handler
   */
  auth: (error: unknown) => {
    handleError(error, {
      component: 'Authentication',
      action: 'auth',
      severity: ErrorSeverity.HIGH,
    });
  },

  /**
   * Form submission error handler
   */
  form: (error: unknown) => {
    handleError(error, {
      component: 'Form',
      action: 'submit',
      severity: ErrorSeverity.MEDIUM,
    });
  },

  /**
   * Data fetching error handler
   */
  fetch: (error: unknown) => {
    handleError(error, {
      component: 'DataFetching',
      action: 'fetch',
      severity: ErrorSeverity.MEDIUM,
    });
  },

  /**
   * Upload error handler
   */
  upload: (error: unknown) => {
    handleError(error, {
      component: 'Upload',
      action: 'upload',
      severity: ErrorSeverity.HIGH,
    });
  },

  /**
   * Payment processing error handler
   */
  payment: (error: unknown) => {
    handleError(error, {
      component: 'Payment',
      action: 'process',
      severity: ErrorSeverity.HIGH,
    });
  },
};

export default {
  createMutationErrorHandler,
  createQueryErrorHandler,
  createTRPCErrorHandler,
  useApiErrorHandling,
  defaultApiErrorHandlers,
};
