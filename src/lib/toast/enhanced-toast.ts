'use client';

/**
 * Enhanced Toast Implementation with Error Handling
 * 
 * This file extends the core toast implementation with additional
 * functionality for error handling and standardized messages.
 */

import { toast, ToastOptions, ExternalToast as SonnerToastOptions, TOAST_DURATIONS } from './index';
import { AxiosError } from 'axios';
import { TRPCClientError } from '@trpc/client';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

// Type guard for Axios errors
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}

// Type guard for tRPC errors
function isTRPCError(error: unknown): error is TRPCClientError<any> {
  return error instanceof TRPCClientError;
}

// Type guard for Zod validation errors
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

// Extract error message from various error types
export function extractErrorMessage(error: unknown): string {
  // Default error message
  let message = 'An unexpected error occurred';
  
  // Handle null or undefined
  if (error === null || error === undefined) {
    return message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    message = error.message;
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    // Try to get the error message from the response data
    if (error.response?.data) {
      const responseData = error.response.data;
      
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (typeof responseData === 'object') {
        // Try common error message patterns
        message = responseData.message || 
                  responseData.error || 
                  responseData.errorMessage || 
                  `Error: ${error.response.status} ${error.response.statusText}`;
      }
    } else if (error.message) {
      message = error.message;
    }
  }

  // Handle tRPC errors
  if (isTRPCError(error)) {
    message = error.message;
    
    // Try to extract more specific error information
    const shape = error.shape;
    if (shape && shape.message) {
      message = shape.message;
    }
  }

  // Handle Zod validation errors
  if (isZodError(error)) {
    const firstError = error.errors[0];
    if (firstError) {
      message = `Validation error: ${firstError.message} at ${firstError.path.join('.')}`;
    } else {
      message = 'Validation error';
    }
  }

  return message;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error toast options type
export interface ErrorToastOptions extends SonnerToastOptions {
  title?: string;
  severity?: ErrorSeverity;
  logError?: boolean;
  retry?: () => void;
}

/**
 * Display an error toast with standardized formatting
 */
export function errorToast(error: unknown, options?: ErrorToastOptions) {
  const message = extractErrorMessage(error);
  const title = options?.title || 'Error';
  const severity = options?.severity || ErrorSeverity.MEDIUM;
  const logError = options?.logError ?? true;
  
  // Log the error if requested
  if (logError) {
    logger.error({
      message: `Toast Error: ${message}`,
      error,
      severity,
    });
  }

  // Determine duration based on severity
  let duration = TOAST_DURATIONS.LONG;
  if (severity === ErrorSeverity.CRITICAL) {
    duration = TOAST_DURATIONS.PERSISTENT; // Critical errors don't auto-dismiss
  } else if (severity === ErrorSeverity.LOW) {
    duration = TOAST_DURATIONS.DEFAULT;
  }

  // Create the toast notification
  return toast.error(message, {
    duration,
    ...options,
    // Add retry action button if provided
    action: options?.retry ? {
      label: 'Retry',
      onClick: options.retry,
    } : undefined,
  });
}

/**
 * Display a validation error toast
 */
export function validationErrorToast(error: unknown, options?: ErrorToastOptions) {
  return errorToast(error, {
    title: 'Validation Error',
    severity: ErrorSeverity.MEDIUM,
    ...options,
  });
}

/**
 * Display a network error toast
 */
export function networkErrorToast(error: unknown, options?: ErrorToastOptions) {
  return errorToast(error, {
    title: 'Network Error',
    severity: ErrorSeverity.HIGH,
    ...options,
  });
}

/**
 * Display an authentication error toast
 */
export function authErrorToast(error: unknown, options?: ErrorToastOptions) {
  return errorToast(error, {
    title: 'Authentication Error',
    severity: ErrorSeverity.HIGH,
    ...options,
  });
}

/**
 * Display a permission error toast
 */
export function permissionErrorToast(error: unknown, options?: ErrorToastOptions) {
  return errorToast(error, {
    title: 'Permission Denied',
    severity: ErrorSeverity.HIGH,
    ...options,
  });
}

/**
 * Process-based toast functions
 */

/**
 * Show success toast for completed operations
 */
export function operationSuccessToast(message: string, options?: SonnerToastOptions) {
  return toast.success(message, options);
}

/**
 * Show info toast for in-progress operations
 */
export function operationInfoToast(message: string, options?: SonnerToastOptions) {
  return toast.info(message, options);
}

/**
 * Show warning toast for operations that completed with warnings
 */
export function operationWarningToast(message: string, options?: SonnerToastOptions) {
  return toast.warning(message, options);
}

/**
 * Enhanced promise toast with better error handling
 */
export function enhancedPromiseToast<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
    toastOptions?: SonnerToastOptions;
    errorOptions?: ErrorToastOptions;
  }
) {
  // Handle errors using our enhanced error handling
  const errorHandler = options.error || ((error: unknown) => {
    const message = extractErrorMessage(error);
    return message;
  });

  return toast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: errorHandler,
    ...options.toastOptions,
  });
}

// Export all functions from the original toast module
export * from './index';

// Export enhanced toast API
export const enhancedToast = {
  ...toast,
  error: errorToast,
  validation: validationErrorToast,
  network: networkErrorToast,
  auth: authErrorToast,
  permission: permissionErrorToast,
  operationSuccess: operationSuccessToast,
  operationInfo: operationInfoToast,
  operationWarning: operationWarningToast,
  enhancedPromise: enhancedPromiseToast,
};

/**
 * Hook for using enhanced toast notifications
 */
export function useEnhancedToast() {
  return enhancedToast;
}

// Default export for convenience
export default enhancedToast;
