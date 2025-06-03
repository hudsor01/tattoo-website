'use client';

/**
 * Re-export from specialized hooks for backward compatibility
 */

// Re-export memoization utilities
export {
  memoizeComponent,
  useMemoizedCallback,
  useMemoizedValue,
  useStableReference,
  memoizeWithConcurrency,
  useStableCallback,
} from './use-memo';

// Re-export callback utilities
export {
  useDebouncedCallback,
  useThrottledCallback,
  useSafeCallback,
  useDeferredCallback,
} from './use-callback-utils';

// Re-export React 19 hooks with better names for consistency
export { useMemo as useMemoized } from 'react';
export { useCallback as useStableFunction } from 'react';
export { startTransition as useNonBlockingUpdate } from 'react';