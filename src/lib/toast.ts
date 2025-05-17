'use client';

/**
 * Centralized Toast API
 * 
 * This is the definitive toast implementation for the application.
 * It uses Sonner under the hood for modern, flexible toast notifications.
 */

import { toast as sonnerToast } from 'sonner';
import type { ToastT, ExternalToast } from 'sonner';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_DURATIONS } from '@/types/toast-types';

// Re-export message constants for convenience
export { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_DURATIONS };

// Default toast options
const defaultOptions: ExternalToast = {
  duration: TOAST_DURATIONS.MEDIUM,
  position: 'bottom-right',
  className: 'toast-notification',
  closeButton: true,
};

/**
 * Main toast function
 */
export function toast(message: string, options?: ExternalToast) {
  return sonnerToast(message, { ...defaultOptions, ...options });
}

/**
 * Success toast variant
 */
export function success(message: string, options?: ExternalToast) {
  return sonnerToast.success(message, { ...defaultOptions, ...options });
}

/**
 * Error toast variant with enhanced error handling
 * Can accept Error objects, strings, or API error responses
 */
export function error(errorOrMessage: unknown, options?: ExternalToast) {
  // Extract user-friendly error message
  const errorMessage = parseErrorMessage(errorOrMessage);
  
  // Log error for monitoring/debugging
  console.error('[Toast Error]', errorOrMessage);
  
  // Show user-friendly error toast
  return sonnerToast.error(errorMessage, {
    ...defaultOptions,
    duration: options?.duration ?? TOAST_DURATIONS.LONG, // Errors stay longer by default
    ...options
  });
}

/**
 * Warning toast variant
 */
export function warning(message: string, options?: ExternalToast) {
  return sonnerToast.warning(message, { ...defaultOptions, ...options });
}

/**
 * Info toast variant
 */
export function info(message: string, options?: ExternalToast) {
  return sonnerToast.info(message, { ...defaultOptions, ...options });
}

/**
 * Loading toast variant
 */
export function loading(message: string, options?: ExternalToast) {
  return sonnerToast.loading(message, { 
    ...defaultOptions, 
    duration: options?.duration ?? TOAST_DURATIONS.PERSISTENT, // Loading toasts don't auto-dismiss by default
    ...options 
  });
}

/**
 * Promise toast that shows different messages for loading, success, and error states
 * Includes enhanced error handling
 */
export function promise<T>(
  promiseOrFunction: Promise<T> | (() => Promise<T>),
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
  toastOptions?: ExternalToast
) {
  return sonnerToast.promise(promiseOrFunction, {
    loading: options.loading,
    success: options.success,
    error: (err) => {
      // Log error for monitoring/debugging
      console.error('[Toast Promise Error]', err);
      
      // Use the provided error function or fallback to our error parser
      if (typeof options.error === 'function') {
        return options.error(err);
      }
      
      // Fall back to the string error message or our error parser
      return typeof options.error === 'string' 
        ? options.error 
        : parseErrorMessage(err);
    },
  }, {
    ...defaultOptions,
    ...toastOptions
  });
}

/**
 * Dismiss a specific toast by ID
 */
export function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  sonnerToast.dismiss();
}

/**
 * Update an existing toast
 */
export function update(toastId: string | number, message: string, options?: ExternalToast) {
  sonnerToast.message(message, {
    ...defaultOptions,
    ...options,
    id: toastId
  });
}

/**
 * Helper function to parse errors into user-friendly messages
 */
function parseErrorMessage(error: unknown): string {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    // Check for common error patterns and provide user-friendly messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (error.message.includes('permission') || error.message.includes('access')) {
      return ERROR_MESSAGES.PERMISSION_DENIED;
    }
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    
    if (error.message.includes('session') || error.message.includes('token') || 
        error.message.includes('expired') || error.message.includes('auth')) {
      return ERROR_MESSAGES.SESSION_EXPIRED;
    }
    
    if (error.message.includes('validation') || error.message.includes('required')) {
      return ERROR_MESSAGES.VALIDATION_ERROR;
    }
    
    // Return the actual error message if it's not too technical
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message;
    }
    
    // Fall back to a generic message
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  // Handle objects with message or error properties (like API responses)
  if (error && typeof error === 'object') {
    const anyError = error as any;
    
    if (anyError.message && typeof anyError.message === 'string') {
      return parseErrorMessage(anyError.message);
    }
    
    if (anyError.error && typeof anyError.error === 'string') {
      return parseErrorMessage(anyError.error);
    }
    
    // Handle HTTP status codes
    if (anyError.statusCode === 401 || anyError.status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    
    if (anyError.statusCode === 403 || anyError.status === 403) {
      return ERROR_MESSAGES.PERMISSION_DENIED;
    }
    
    if (anyError.statusCode === 404 || anyError.status === 404) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    
    if (anyError.statusCode === 429 || anyError.status === 429) {
      return ERROR_MESSAGES.RATE_LIMITED;
    }
    
    if (anyError.statusCode >= 500 || anyError.status >= 500) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
  }
  
  // Default generic error message
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Create a toast API object with all methods
const toastApi = {
  toast,
  success,
  error,
  warning,
  info,
  loading,
  promise,
  dismiss,
  dismissAll,
  update,
  
  // Error message constants
  ERRORS: ERROR_MESSAGES,
  
  // Success message constants
  SUCCESS: SUCCESS_MESSAGES,
  
  // Duration constants
  DURATIONS: TOAST_DURATIONS
};

// Add variants as properties to the main toast function for convenience
toast.success = success;
toast.error = error;
toast.warning = warning;
toast.info = info;
toast.loading = loading;
toast.promise = promise;
toast.dismiss = dismiss;
toast.dismissAll = dismissAll;
toast.update = update;

/**
 * Hook for using toast notifications in components
 */
export function useToast() {
  return toastApi;
}

// Default export for convenience
export default toast;