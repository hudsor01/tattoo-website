/**
 * Dynamic Component Utilities
 * 
 * This module provides utilities for dynamically loading components to reduce
 * bundle size and improve initial load performance.
 */
import dynamic from 'next/dynamic';
import React from 'react';

// Type for the loading component option
type LoadingComponentType = React.ComponentType<any> | React.ReactNode;

/**
 * Create a dynamically loaded component with custom loading state and error handling.
 * This improves initial load time by only loading components when they're needed.
 * 
 * @param importFn Function that imports the component
 * @param options Options for dynamic loading
 * @returns Dynamically loaded component
 */
export function createDynamicComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ReactNode;
    ssr?: boolean;
    suspense?: boolean;
  } = {}
) {
  const { loading, ssr = true, suspense = false } = options;
  
  return dynamic(importFn, {
    loading: loading ? () => React.createElement(React.Fragment, null, loading) : undefined,
    ssr,
    suspense,
  });
}

/**
 * Creates a dynamically loaded component specifically optimized for page sections.
 * This is ideal for below-the-fold content that doesn't need to be loaded immediately.
 * 
 * @param importFn Function that imports the section component
 * @param options Options for dynamic loading
 * @returns Dynamically loaded section component
 */
export function createDynamicSection<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ReactNode;
    minHeight?: number | string;
  } = {}
) {
  const { loading, minHeight = '200px' } = options;
  
  const defaultLoading = React.createElement(
    'div',
    {
      style: {
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    React.createElement('div', { className: "animate-pulse bg-gray-200 rounded-md h-8 w-24" })
  );
  
  return dynamic(importFn, {
    loading: () => React.createElement(React.Fragment, null, loading || defaultLoading),
    ssr: false,
  });
}

/**
 * Creates a server-rendered dynamically loaded component.
 * Use this for components that need to be rendered on the server but are large or rarely needed.
 * 
 * @param importFn Function that imports the component
 * @param options Options for dynamic loading
 * @returns Dynamically loaded component with server rendering
 */
export function createServerDynamicComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ReactNode;
  } = {}
) {
  const { loading } = options;
  
  return dynamic(importFn, {
    loading: loading ? () => React.createElement(React.Fragment, null, loading) : undefined,
    ssr: true,
  });
}