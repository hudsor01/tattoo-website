'use client';

import { enhancedToast, ErrorSeverity, extractErrorMessage } from '@/lib/toast/enhanced-toast';
import { logger } from '@/lib/logger';
import { AxiosError } from 'axios';
import { TRPCClientError } from '@trpc/client';
import { ZodError } from 'zod';

/**
 * Error categories for categorizing different types of errors
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * Error context to provide additional information about where/when an error occurred
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
  displayToUser?: boolean;
  severity?: ErrorSeverity;
}

/**
 * Determine the category of an error based on its type and properties
 */
export function categorizeError(error: unknown): ErrorCategory {
  // Check for network errors
  if (error instanceof AxiosError) {
    if (!error.response) {
      return ErrorCategory.NETWORK;
    }

    // Categorize based on status code
    const status = error.response.status;
    if (status === 400) return ErrorCategory.VALIDATION;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status === 404) return ErrorCategory.NOT_FOUND;
    if (status >= 500) return ErrorCategory.SERVER;
    return ErrorCategory.CLIENT;
  }

  // Check for tRPC errors
  if (error instanceof TRPCClientError) {
    // Try to determine category from shape
    const shape = error.shape;
    if (shape) {
      if (shape.code === 'BAD_REQUEST') return ErrorCategory.VALIDATION;
      if (shape.code === 'UNAUTHORIZED') return ErrorCategory.AUTHENTICATION;
      if (shape.code === 'FORBIDDEN') return ErrorCategory.AUTHORIZATION;
      if (shape.code === 'NOT_FOUND') return ErrorCategory.NOT_FOUND;
      if (shape.code === 'INTERNAL_SERVER_ERROR') return ErrorCategory.SERVER;
    }
    return ErrorCategory.CLIENT;
  }

  // Check for validation errors
  if (error instanceof ZodError) {
    return ErrorCategory.VALIDATION;
  }

  // Default to unknown category
  return ErrorCategory.UNKNOWN;
}

/**
 * Determine if an error should be displayed to the user
 */
function shouldDisplayToUser(category: ErrorCategory, context?: ErrorContext): boolean {
  // If explicitly set in context, respect that
  if (context?.displayToUser !== undefined) {
    return context.displayToUser;
  }

  // Default display rules based on category
  switch (category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.NOT_FOUND:
      return true;
    case ErrorCategory.NETWORK:
      return true;
    case ErrorCategory.SERVER:
      return true;
    case ErrorCategory.CLIENT:
      return true;
    case ErrorCategory.UNKNOWN:
      return false;
    default:
      return false;
  }
}

/**
 * Determine the severity of an error
 */
function determineErrorSeverity(category: ErrorCategory, context?: ErrorContext): ErrorSeverity {
  // If explicitly set in context, respect that
  if (context?.severity) {
    return context.severity;
  }

  // Default severity rules based on category
  switch (category) {
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.NETWORK:
      return ErrorSeverity.HIGH;
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.SERVER:
      return ErrorSeverity.HIGH;
    case ErrorCategory.CLIENT:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.UNKNOWN:
      return ErrorSeverity.HIGH;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Central error handling function to process and respond to errors consistently
 */
export function handleError(error: unknown, context?: ErrorContext): void {
  // Extract error message
  const message = extractErrorMessage(error);
  
  // Categorize the error
  const category = categorizeError(error);
  
  // Determine severity
  const severity = determineErrorSeverity(category, context);
  
  // Log the error
  logger.error({
    message: `Error: ${message}`,
    category,
    severity,
    component: context?.component,
    action: context?.action,
    userId: context?.userId,
    additionalData: context?.additionalData,
    error: error instanceof Error ? error : undefined,
  });

  // Display toast notification if appropriate
  if (shouldDisplayToUser(category, context)) {
    switch (category) {
      case ErrorCategory.VALIDATION:
        enhancedToast.validation(error, { severity });
        break;
      case ErrorCategory.NETWORK:
        enhancedToast.network(error, { severity });
        break;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        enhancedToast.auth(error, { severity });
        break;
      case ErrorCategory.NOT_FOUND:
        enhancedToast.error(error, { 
          title: 'Not Found',
          severity,
        });
        break;
      case ErrorCategory.SERVER:
        enhancedToast.error(error, {
          title: 'Server Error',
          severity,
        });
        break;
      default:
        enhancedToast.error(error, { severity });
    }
  }
}

/**
 * Create an error handler with predefined context
 */
export function createErrorHandler(defaultContext: ErrorContext) {
  return (error: unknown, contextOverrides?: Partial<ErrorContext>) => {
    const context = {
      ...defaultContext,
      ...contextOverrides,
    };
    handleError(error, context);
  };
}

/**
 * Hook for using the error handler in React components
 */
export function useErrorHandler(defaultContext?: ErrorContext) {
  return (error: unknown, contextOverrides?: Partial<ErrorContext>) => {
    const context = {
      ...defaultContext,
      ...contextOverrides,
    };
    handleError(error, context);
  };
}

/**
 * Try-catch wrapper for async functions with error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return undefined;
  }
}

/**
 * Create a try-catch wrapper with predefined context
 */
export function createTryCatch(defaultContext: ErrorContext) {
  return async <T>(
    fn: () => Promise<T>,
    contextOverrides?: Partial<ErrorContext>
  ): Promise<T | undefined> => {
    const context = {
      ...defaultContext,
      ...contextOverrides,
    };
    return tryCatch(fn, context);
  };
}

export default {
  handleError,
  createErrorHandler,
  useErrorHandler,
  tryCatch,
  createTryCatch,
  categorizeError,
};
