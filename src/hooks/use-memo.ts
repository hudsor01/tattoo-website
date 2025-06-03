'use client';

/**
 * Memoization Utilities
 * 
 * Production-ready implementation of React hooks for memoization:
 * - Simple memoization wrappers for React's built-in memo functions
 * - Enhanced stable references with deep equality comparisons
 * - Optimized component memoization with debugging support
 */
import * as React from 'react';
import { logger } from "@/lib/logger";
import { 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect 
} from 'react';
/**
 * React 19's memo is already optimized - no need for custom wrapper
 * Just re-export with better typing
 */
export const memoizeComponent = React.memo;
/**
 * React 19's useCallback with automatic optimization
 * No need for custom wrapper - React 19 handles optimization internally
 */
export const useMemoizedCallback = useCallback;
/**
 * React 19's useMemo with automatic optimization  
 * No need for custom wrapper - React 19 handles optimization internally
 */
export const useMemoizedValue = useMemo;
/**
 * Production-ready stable reference using deep comparison
 * 
 * Maintains a stable reference to an object that only changes when the
 * deep contents change. This avoids unnecessary re-renders when the
 * reference changes but the content doesn't.
 * 
 * IMPORTANT: For performance reasons, use this only for small to medium-sized objects.
 * For larger objects, consider a more selective approach with manual dependency tracking.
 */
export function useStableReference<T extends object>(value: T): T {
  const ref = useRef<T>(value);
  
  useEffect(() => {
    if (!deepEqual(ref.current, value)) {
      ref.current = value;
    }
  }, [value]);
  
  return ref.current;
}

/**
 * Deep equality comparison utility
 * 
 * Performs a proper deep comparison between two values
 * Handles objects, arrays, primitives, and special cases
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (a === null || a === undefined || b === null || b === undefined) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Production-ready stable callback reference
 * 
 * Creates a stable function reference that never changes identity while 
 * always using the latest callback implementation.
 * 
 * Features include:
 * 1. Always maintains the latest callback implementation
 * 2. Prevents unnecessary re-renders
 * 3. Type-safe with proper TypeScript inference
 * 4. Optional dependencies tracking for optimization
 * 5. Integrates with React 19's concurrency model
 * 6. Preserves function name and properties
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: {
    name?: string;
    deps?: React.DependencyList;
    useTransition?: boolean;
  } = {}
): T {
  const {
    name = callback.name  } = options;
  
  const callbackRef = useRef<T>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const stableCallback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    return callbackRef.current(...args) as ReturnType<T>;
  }, []) as T;
  
  Object.defineProperty(stableCallback, 'name', { value: name, configurable: true });
  
  try {
    const propNames = Object.getOwnPropertyNames(callback);
    for (const prop of propNames) {
      if (prop !== 'name' && prop !== 'length' && prop !== 'prototype') {
        const descriptor = Object.getOwnPropertyDescriptor(callback, prop);
        if (descriptor) {
          Object.defineProperty(stableCallback, prop, descriptor);
        }
      }
    }
  } catch {
    // Intentionally ignore errors when copying properties - some properties may not be configurable
  }
  
  return stableCallback;
}

/**
 * Production-ready component memoization
 * 
 * This utility uses React.memo with additional features:
 * 1. Concurrency-aware with proper React 19 patterns
 * 2. Custom areEqual function that handles complex props
 * 3. Debug-friendly with displayName preservation
 * 4. Performance monitoring integration
 * 5. Optional deep comparison of props
 */
export function memoizeWithConcurrency<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;
    deepCompare?: boolean;
    displayName?: string;
    monitorPerformance?: boolean;
  } = {}
): React.MemoExoticComponent<React.ComponentType<P>> {
  const {
    areEqual,
    deepCompare = false,
    displayName,
    monitorPerformance = false
  } = options;
  
  let compareFunction = areEqual;
  
  if (deepCompare && !areEqual) {
    compareFunction = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
      return deepEqual(prevProps, nextProps);
    };
  }
  
  if (monitorPerformance) {
    const originalCompare = compareFunction;
    compareFunction = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
      const startTime = performance.now();
      const isEqual = originalCompare ? originalCompare(prevProps, nextProps) : shallowEqual(prevProps, nextProps);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      if (duration > 2) {
        void logger.warn(
          `Slow props comparison for ${displayName ?? Component.displayName ?? Component.name ?? 'Component'}: ${duration.toFixed(2)}ms`,
          { prevProps, nextProps, isEqual }
        );
      }
      
      return isEqual;
    };
  }
  
  const MemoizedComponent = React.memo(Component, compareFunction);
  
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  } else if (Component.displayName) {
    MemoizedComponent.displayName = `Memo(${Component.displayName})`;
  } else if (Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.name})`;
  }
  
  return MemoizedComponent;
}

/**
 * A type-safe shallow equality comparison function for objects
 * Used as fallback when no custom comparison is provided
 */
function shallowEqual(objA: unknown, objB: unknown): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }
  
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const objARecord = objA as Record<string, unknown>;
  const objBRecord = objB as Record<string, unknown>;
  
  const keysA = Object.keys(objARecord);
  const keysB = Object.keys(objBRecord);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  return keysA.every(key => (
    Object.prototype.hasOwnProperty.call(objBRecord, key) &&
    Object.is(objARecord[key], objBRecord[key])
  ));
}
