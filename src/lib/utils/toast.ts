/**
 * Toast Utilities
 *
 * Simplified interface for using toast notifications throughout the application
 * with standardized messaging patterns.
 */

'use client';

import { useToast } from '@/hooks/use-toast';

// Import standard message constants from types
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/types/toast-types';
import { useErrorHandling } from '@/hooks/use-error-handling';

/**
 * Toast utilities for standardized notification patterns
 */
export const toastUtils = {
  /**
   * Show an error toast with standardized styling and message
   *
   * @param message Custom message or one of the predefined ERROR_MESSAGES
   * @param options Additional toast options
   */
  error: (
    message: string | keyof typeof ERROR_MESSAGES,
    options?: Parameters<typeof toast.error>[1]
  ) => {
    // If message is a key from ERROR_MESSAGES, use the corresponding value
    const errorMessage =
      typeof message === 'string' && message in ERROR_MESSAGES
        ? ERROR_MESSAGES[message as keyof typeof ERROR_MESSAGES]
        : message;

    return toast.error(errorMessage as string, options);
  },

  /**
   * Show a success toast with standardized styling and message
   *
   * @param message Custom message or one of the predefined SUCCESS_MESSAGES
   * @param options Additional toast options
   */
  success: (
    message: string | keyof typeof SUCCESS_MESSAGES,
    options?: Parameters<typeof toast.success>[1]
  ) => {
    // If message is a key from SUCCESS_MESSAGES, use the corresponding value
    const successMessage =
      typeof message === 'string' && message in SUCCESS_MESSAGES
        ? SUCCESS_MESSAGES[message as keyof typeof SUCCESS_MESSAGES]
        : message;

    return toast.success(successMessage as string, options);
  },

  /**
   * Show a notification for async operations
   *
   * @param asyncFn Async function to execute with loading state management
   * @param messages Custom messages for each state
   * @param options Additional options
   */
  promise: async <T>(
    asyncFn: () => Promise<T>,
    messages: {
  const toast = useToast();
      loading: string;
      success: string;
      error: string | ((error: unknown) => string);
    },
    options?: {
      successOptions?: Parameters<typeof toast.success>[1];
      errorOptions?: Parameters<typeof toast.error>[1];
    }
  ): Promise<T> => {
    // Show loading toast
    const toastId = toast(messages.loading, {
      duration: TOAST_DURATIONS.PERSISTENT,
    });

    try {
      // Execute the async function
      const result = await asyncFn();

      // Show success toast
      toast.dismiss(toastId);
      toast.success(messages.success, options?.successOptions);

      return result;
    } catch (error) {
      // Show error toast
      toast.dismiss(toastId);
      const errorMessage =
        typeof messages.error === 'function' ? messages.error(error) : messages.error;

      toast.error(errorMessage, options?.errorOptions);

      throw error;
    }
  },

  /**
   * Show a warning toast
   */
  warning: toast.warning,

  /**
   * Show an info toast
   */
  info: toast.info,

  /**
   * Dismiss a specific toast
   */
  dismiss: toast.dismiss,

  /**
   * Dismiss all toasts
   */
  dismissAll: toast.dismissAll,
};

// Re-export from the store
export { toast, TOAST_DURATIONS };

// Default export for easier imports
export default toastUtils;
