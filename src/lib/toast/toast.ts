/**
 * Enhanced toast utilities for better user notifications
 */

import { toast } from '@/hooks/use-toast';
import type { ToastVariant } from '@/types/component-types';

// Define our own ToastActionElement type to match the expected structure
type ToastActionElement = {
  label: string;
  onClick: () => void;
};

export interface EnhancedToastOptions {
  title?: string | undefined;
  description: string;
  variant?: ToastVariant | undefined;
  duration?: number | undefined;
  action?: ToastActionElement | undefined;
}

/**
 * Show an enhanced toast notification
 */
export function showToast(options: EnhancedToastOptions) {
  return toast({
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'default',
    ...(options.duration !== undefined && { duration: options.duration })
  });
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string, title?: string) {
  return showToast({
    title,
    description: message,
    variant: 'success',
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string, title?: string) {
  return showToast({
    title: title ?? 'Error',
    description: message,
    variant: 'error',
  });
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string, title?: string) {
  return showToast({
    title: title ?? 'Warning',
    description: message,
    variant: 'warning',
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string, title?: string) {
  return showToast({
    title: title ?? 'Info',
    description: message,
    variant: 'info',
  });
}