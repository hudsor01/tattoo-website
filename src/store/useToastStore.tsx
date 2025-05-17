/**
 * @deprecated Toast Store (Legacy)
 *
 * This module is maintained for backward compatibility during the transition period.
 * Please use the new toast implementation from @/hooks/use-toast instead.
 */

import { toast as standardToast, TOAST_DURATIONS } from '@/lib/toast';
import type { Toast, ToastAction, ToastState, ToastVariant } from '@/types/toast-types';

// Re-export toast types for backwards compatibility
export type { Toast, ToastAction, ToastVariant };

// Re-export toast durations
export { TOAST_DURATIONS };

// Create simulated functions that map to the new toast API
export const useToastStore = {
  getState: () => ({
    toasts: [],
    addToast: (toast: any) => {
      const variant = toast.variant || 'default';
      if (variant === 'success') {
        return standardToast.success(toast.description, {
          duration: toast.duration,
          id: toast.id,
        });
      } else if (variant === 'error') {
        return standardToast.error(toast.description, {
          duration: toast.duration,
          id: toast.id,
        });
      } else if (variant === 'warning') {
        return standardToast.warning(toast.description, {
          duration: toast.duration,
          id: toast.id,
        });
      } else if (variant === 'info') {
        return standardToast.info(toast.description, {
          duration: toast.duration,
          id: toast.id,
        });
      } else {
        return standardToast(toast.description, {
          duration: toast.duration,
          id: toast.id,
        });
      }
    },
    dismissToast: (id: string) => standardToast.dismiss(id),
    dismissAllToasts: () => standardToast.dismissAll(),
    removeToast: (id: string) => standardToast.dismiss(id),
  }),
};

/**
 * Show a success toast with standardized styling
 * @deprecated Use toast.success from @/hooks/use-toast instead
 */
export function toastSuccess(
  description: string,
  options?: any
) {
  const toast = useToast();
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'toastSuccess from useToastStore is deprecated. Please use import { success } from "@/hooks/use-toast" instead.'
    );
  }
  return standardToast.success(description, options);
}

/**
 * Show an error toast with standardized styling
 * @deprecated Use toast.error from @/hooks/use-toast instead
 */
export function toastError(
  description: string,
  options?: any
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'toastError from useToastStore is deprecated. Please use import { error } from "@/hooks/use-toast" instead.'
    );
  }
  return standardToast.error(description, options);
}

/**
 * Show a warning toast with standardized styling
 * @deprecated Use toast.warning from @/hooks/use-toast instead
 */
export function toastWarning(
  description: string,
  options?: any
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'toastWarning from useToastStore is deprecated. Please use import { warning } from "@/hooks/use-toast" instead.'
    );
  }
  return standardToast.warning(description, options);
}

/**
 * Show an info toast with standardized styling
 * @deprecated Use toast.info from @/hooks/use-toast instead
 */
export function toastInfo(
  description: string,
  options?: any
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'toastInfo from useToastStore is deprecated. Please use import { info } from "@/hooks/use-toast" instead.'
    );
  }
  return standardToast.info(description, options);
}

/**
 * Show a default toast
 * @deprecated Use toast from @/hooks/use-toast instead
 */
export function toast(
  description: string,
  options?: any
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'toast from useToastStore is deprecated. Please use import { toast } from "@/hooks/use-toast" instead.'
    );
  }
  return standardToast(description, options);
}

// Add helper methods to the toast function
toast.success = toastSuccess;
toast.error = toastError;
toast.warning = toastWarning;
toast.info = toastInfo;

/**
 * Dismiss a specific toast by ID
 * @deprecated Use toast.dismiss from @/hooks/use-toast instead
 */
toast.dismiss = (toastId: string) => {
  standardToast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 * @deprecated Use toast.dismissAll from @/hooks/use-toast instead
 */
toast.dismissAll = () => {
  standardToast.dismissAll();
};

/**
 * @deprecated Use useToast from @/hooks/use-toast instead
 */
export function useToast() {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'useToast from useToastStore is deprecated. Please use import { useToast } from "@/hooks/use-toast" instead.'
    );
  }
  
  return { toasts: [] };
}
