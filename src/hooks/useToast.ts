'use client';

/**
 * @deprecated Use the kebab-case version: import { useToast } from '@/hooks/use-toast' instead
 * This file is maintained for backwards compatibility during the transition period.
 */

import { useToast as standardUseToast, toast, success, error, warning, info, loading, promise, dismiss, dismissAll } from '@/hooks/use-toast';

// Re-export the hook and functions with a console warning in development
export function useToast() {
  const toast = useToast();
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'useToast from camelCase import is deprecated. Please use import { useToast } from "@/hooks/use-toast" instead.'
    );
  }
  
  return standardUseToast();
}

// Default export for convenience
export default useToast;

// Re-export individual functions for direct use
export { 
  toast,
  success,
  error, 
  warning,
  info,
  loading,
  promise,
  dismiss,
  dismissAll
};
