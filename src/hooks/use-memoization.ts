'use client';

/**
 * React Memoization Utilities
 * This module provides utilities for memoizing components and values
 * to improve rendering performance and reduce unnecessary re-renders.
 */

import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Create a memoized version of a component with better typing than React.memo.
 *
 * @param Component The component to memoize
 * @param areEqual Optional comparison function
 */
export function memoizeComponent<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, areEqual);
}

/**
 * Create a safe reference to a function that updates only when dependencies change.
 * Similar to useCallback but with better TypeScript support.
 *
 * @param callback The function to memoize
 * @param deps Dependency array
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Create a debounced version of a callback function.
 *
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 * @param deps Dependencies array
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback as T;
}

/**
 * Memoize a value that is expensive to compute.
 * Similar to useMemo but with better TypeScript support and cleanup handling.
 *
 * @param factory Factory function that creates the value
 * @param deps Dependency array that triggers recalculation
 */
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps);
}

/**
 * Create a throttled version of a callback function that only executes
 * at most once per specified time period.
 *
 * @param callback The function to throttle
 * @param limit Time limit in milliseconds
 * @param deps Dependencies array
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = limit - (now - lastRunRef.current);

      if (remaining <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        lastRunRef.current = now;
        return callback(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          timeoutRef.current = null;
          callback(...args);
        }, remaining);
        return null as ReturnType<T>;
      }

      // Add this return statement to handle the case where a timeout is already scheduled
      return null as ReturnType<T>;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, limit, ...deps]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback as T;
}

/**
 * Create a stable identity reference for an object that doesn't cause
 * re-renders when the internal properties change.
 *
 * @param value The value to create a stable reference for
 */
export function useStableReference<T extends object>(value: T): T {
  const ref = useRef(value);

  // Update the ref when the value changes
  useEffect(() => {
    void Object.assign(ref.current, value);
  }, [value]);

  return ref.current;
}

/**
 * Create a callback that prevents execution during component rendering.
 * Useful for callbacks that should only be invoked during effects or event handlers.
 *
 * @param callback The function to make safe
 * @param deps Dependencies array
 */
export function useSafeCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (isMountedRef.current) {
      return callback(...args);
    }
    return null as ReturnType<T>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) as T;
}
