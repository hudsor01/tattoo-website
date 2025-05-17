'use client';

/**
 * Centralized Toast Implementation
 * 
 * This file provides a unified toast notification system for the entire application.
 * It uses Sonner as the underlying implementation but provides a consistent API
 * that can be swapped out if needed in the future.
 */

import { toast as sonnerToast, ToastOptions, ExternalToast as SonnerToastOptions } from 'sonner';

// Re-export the original toast function for advanced use cases
export const originalToast = sonnerToast;

// Default toast durations in milliseconds
export const TOAST_DURATIONS = {
  SHORT: 3000,   // 3 seconds
  DEFAULT: 5000, // 5 seconds
  LONG: 8000,    // 8 seconds
  PERSISTENT: 0  // Won't auto-dismiss (Sonner uses 0 for this)
};

// Default toast options to ensure consistency
const defaultOptions: SonnerToastOptions = {
  duration: TOAST_DURATIONS.DEFAULT,
  position: 'top-right',
  closeButton: true,
};

/**
 * Main toast function with variants
 */
export function toast(message: string, options?: SonnerToastOptions) {
  return sonnerToast(message, { ...defaultOptions, ...options });
}

/**
 * Success toast variant
 */
export function success(message: string, options?: SonnerToastOptions) {
  return sonnerToast.success(message, { ...defaultOptions, ...options });
}

/**
 * Error toast variant
 */
export function error(message: string, options?: SonnerToastOptions) {
  return sonnerToast.error(message, {
    ...defaultOptions,
    duration: options?.duration ?? TOAST_DURATIONS.LONG, // Errors stay longer by default
    ...options
  });
}

/**
 * Warning toast variant
 */
export function warning(message: string, options?: SonnerToastOptions) {
  return sonnerToast.warning(message, { ...defaultOptions, ...options });
}

/**
 * Info toast variant
 */
export function info(message: string, options?: SonnerToastOptions) {
  return sonnerToast.info(message, { ...defaultOptions, ...options });
}

/**
 * Loading toast variant
 */
export function loading(message: string, options?: SonnerToastOptions) {
  return sonnerToast.loading(message, { ...defaultOptions, ...options });
}

/**
 * Promise toast that shows different messages for loading, success, and error states
 */
export function promise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
    toastOptions?: SonnerToastOptions;
  }
) {
  return sonnerToast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
    ...defaultOptions,
    ...options.toastOptions,
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

// Create a convenience object with all methods
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
};

// Add variants as properties of the main toast function to support both usage patterns
toast.success = success;
toast.error = error;
toast.warning = warning; 
toast.info = info;
toast.loading = loading;
toast.promise = promise;
toast.dismiss = dismiss;
toast.dismissAll = dismissAll;

/**
 * Hook for using toast notifications
 * This provides a convenient pattern for component-based toast usage
 */
export function useToast() {
  return toastApi;
}

// Default export for convenience
export default toast;
