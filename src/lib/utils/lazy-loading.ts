'use client';

/**
 * Lazy Loading Utilities
 * 
 * This module provides simplified utilities for dynamically loading components.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Create a lazy-loaded component with a simple loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: {
    ssr?: boolean;
  } = {}
) {
  return dynamic(importFunction, {
    loading: () => null,
    ssr: options.ssr ?? false,
  });
}

/**
 * Create a lazy-loaded route component (page-level)
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
) {
  return dynamic(importFunction, {
    loading: () => null,
    ssr: true,
  });
}