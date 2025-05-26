/**
 * Simple toast hook using sonner
 */
import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

export function toast(options: ToastOptions | string) {
  // Allow passing just a string for simple cases
  if (typeof options === 'string') {
    return sonnerToast(options);
  }
  
  const { title, description, variant = 'default', duration } = options;
  
  const message = title && description ? `${title}: ${description}` : (description ?? title ?? '');
  const toastOptions = duration !== undefined ? { duration } : {};
  
  switch (variant) {
    case 'destructive':
    case 'error':
      return sonnerToast.error(message, toastOptions);
    case 'success':
      return sonnerToast.success(message, toastOptions);
    case 'warning':
      return sonnerToast.warning(message, toastOptions);
    case 'info':
      return sonnerToast.info(message, toastOptions);
    default:
      return sonnerToast(message, toastOptions);
  }
}

export function useToast() {
  return { toast };
}