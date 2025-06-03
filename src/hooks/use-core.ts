'use client';

/**
 * Core React Hooks
 * 
 * Re-exports from specialized hook files for backward compatibility
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

// Re-export conditional data hooks
export {
  useConditionalDashboardStats,
  useConditionalCustomer,
  useConditionalAppointments,
} from './use-conditional-data';

// Re-export design hooks
export {
  useDesign,
  useRelatedDesigns,
  useDesignBatch,
} from './use-design';

// Re-export utility functions
export {
  deepEqual,
  shallowEqual,
  handleCallbackError,
  safeStringify,
  hasErrorCause,
} from './use-utils';