'use client';

/**
 * Standardized toast hook
 * 
 * This hook provides access to the enhanced toast system with error handling
 * capabilities. It should be used throughout the application for consistent
 * toast notifications.
 */

import { 
  useToast as baseUseToast, 
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
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOAST_DURATIONS
} from '@/lib/toast';

// Re-export everything for convenience
export { 
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
  ERROR_MESSAGES as ERRORS,
  SUCCESS_MESSAGES as SUCCESS,
  TOAST_DURATIONS as DURATIONS
};

/**
 * Hook for using toast notifications with enhanced error handling
 */
export function useToast() {
  return baseUseToast();
}

export default useToast;
