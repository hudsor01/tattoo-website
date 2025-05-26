'use client';

import { logger } from '@/lib/logger';
import { TRPCClientError } from '@trpc/client';
import { ZodError } from 'zod';
import { toast } from '@/hooks/use-toast';

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
 * Error severity levels to indicate the importance of an error
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
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
 * Determine if an error should be displayed to the user
 */
function shouldDisplayToUser(category: ErrorCategory, context?: ErrorContext): boolean {
  if (context?.displayToUser !== undefined) {
    return !!context.displayToUser;
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
  const message = extractErrorMessage(error);
  const category = categorizeError(error);
  const severity = determineErrorSeverity(category, context);

  // Log the error - convert the object to a string with JSON.stringify
  void logger.error(
    `Error occurred: ${message}. Details: ${JSON.stringify({
      category,
      severity,
      component: context?.component,
      action: context?.action,
      userId: context?.userId,
      additionalData: context?.additionalData,
    })}`
  );

  // Display toast notification if appropriate
  if (shouldDisplayToUser(category, context)) {
    switch (category) {
      case ErrorCategory.VALIDATION:
        toast({
          title: 'Validation Error',
          description: message,
          variant: 'destructive',
        });
        break;
      case ErrorCategory.NETWORK:
        toast({
          title: 'Network Error',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
        break;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        toast({
          title: 'Authentication Error',
          description: message,
          variant: 'destructive',
        });
        break;
      case ErrorCategory.NOT_FOUND:
        toast({
          title: 'Not Found',
          description: message,
          variant: 'destructive',
        });
        break;
      case ErrorCategory.SERVER:
        toast({
          title: 'Server Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
        break;
      default:
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
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
export async function tryCatch<T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

/**
 * Create a try-catch wrapper with predefined context
 */
export function createTryCatch(defaultContext: ErrorContext) {
  return async <T>(
    fn: () => Promise<T>,
    contextOverrides?: Partial<ErrorContext>
  ): Promise<T | null> => {
    const context = {
      ...defaultContext,
      ...contextOverrides,
    };
    return tryCatch(fn, context);
  };
}

/**
 * Extract a human-readable message from an error object of any type
 */
function extractErrorMessage(error: unknown): string {
  // Handle null or undefined
  if (error === null || error === undefined) {
    return 'An unknown error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message ?? 'An unknown error occurred';
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues;
    if (issues.length === 0) return 'Validation error';

    // Return the first error message or aggregate them if there are multiple
    if (issues.length === 1) {
      // Add null check to ensure issues[0] exists before accessing its properties
      const issue = issues[0];
      return issue && issue.path
        ? `${issue.path.join('.')}: ${issue.message}`
        : (issue?.message ?? 'Unknown error');
    }
    return `Validation failed with ${issues.length} issues`;
  }

  // Handle TRPC client errors
  if (error instanceof TRPCClientError) {
    return error.message ?? 'API request failed';
  }

  // Handle objects with message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  // Handle other types
  try {
    return JSON.stringify(error) ?? 'An unknown error occurred';
  } catch {
    return 'An unknown error occurred';
  }
}

/**
 * Categorize an error into a specific ErrorCategory based on its type and properties
 */
function categorizeError(error: unknown): ErrorCategory {
  // Handle null or undefined
  if (error === null || error === undefined) {
    return ErrorCategory.UNKNOWN;
  }

  // Handle validation errors
  if (error instanceof ZodError) {
    return ErrorCategory.VALIDATION;
  }

  // Handle TRPC client errors
  if (error instanceof TRPCClientError) {
    const statusCode =
      'data' in error &&
      typeof error.data === 'object' &&
      error.data &&
      'httpStatus' in error.data &&
      typeof error.data.httpStatus === 'number'
        ? error.data.httpStatus
        : null;

    if (
      statusCode === 401 ||
      statusCode === 403 ||
      error.message.includes('unauthorized') ||
      error.message.includes('authentication')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }

    if (
      statusCode === 403 ||
      error.message.includes('forbidden') ||
      error.message.includes('permission')
    ) {
      return ErrorCategory.AUTHORIZATION;
    }

    if (statusCode === 404 || error.message.includes('not found')) {
      return ErrorCategory.NOT_FOUND;
    }

    if (statusCode && statusCode >= 500) {
      return ErrorCategory.SERVER;
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return ErrorCategory.CLIENT;
    }

    return ErrorCategory.NETWORK;
  }

  // Handle standard Error objects with additional checks
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network related errors
    if (
      error.name === 'NetworkError' ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('offline') ||
      message.includes('timeout')
    ) {
      return ErrorCategory.NETWORK;
    }

    // Authentication/Authorization errors
    if (
      message.includes('unauthorized') ||
      message.includes('unauthenticated') ||
      message.includes('authentication') ||
      message.includes('login') ||
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied')
    ) {
      return message.includes('permission') || message.includes('forbidden')
        ? ErrorCategory.AUTHORIZATION
        : ErrorCategory.AUTHENTICATION;
    }

    // Not found errors
    if (message.includes('not found')) {
      return ErrorCategory.NOT_FOUND;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorCategory.VALIDATION;
    }

    // Server errors
    if (message.includes('server') || message.includes('internal') || message.includes('500')) {
      return ErrorCategory.SERVER;
    }
  }

  // For errors related to HTTP status codes in response objects
  if (typeof error === 'object' && error !== null) {
    // Check for status or statusCode properties that might indicate HTTP errors
    const statusCode =
      'status' in error && typeof error.status === 'number'
        ? error.status
        : 'statusCode' in error && typeof error.statusCode === 'number'
          ? error.statusCode
          : null;

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        return ErrorCategory.AUTHENTICATION;
      }
      if (statusCode === 403) {
        return ErrorCategory.AUTHORIZATION;
      }
      if (statusCode === 404) {
        return ErrorCategory.NOT_FOUND;
      }
      if (statusCode >= 500) {
        return ErrorCategory.SERVER;
      }
      if (statusCode >= 400 && statusCode < 500) {
        return ErrorCategory.CLIENT;
      }
    }
  }

  // Default to client-side error if we can't categorize more specifically
  return ErrorCategory.CLIENT;
}

export default {
  handleError,
  createErrorHandler,
  useErrorHandler,
  tryCatch,
  createTryCatch,
  categorizeError,
};
