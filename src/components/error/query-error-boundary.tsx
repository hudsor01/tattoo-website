'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorFallback } from './error-fallback';

/**
 * Props for the QueryErrorBoundary component
 */
export interface QueryErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode;
  /** Custom fallback component for errors */
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  /** Custom error handler function */
  onError?: (error: Error, info: { componentStack: string }) => void;
  /** Custom error component to render */
  errorComponent?: React.ReactNode;
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Retry button label */
  retryLabel?: string;
  /** Whether to display as a full page error */
  fullPage?: boolean;
  /** Variant of error UI to display */
  variant?: 'card' | 'alert' | 'simple';
}

/**
 * QueryErrorBoundary Component
 * 
 * A specialized error boundary for React Query that handles query errors
 * and provides retry capabilities. This component integrates with React Query's
 * QueryErrorResetBoundary to ensure proper error handling and recovery.
 * 
 * @example
 * ```tsx
 * <QueryErrorBoundary>
 *   <UserProfileComponent />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({
  children,
  fallback,
  onError,
  errorComponent,
  title = 'Failed to load data',
  description = 'There was a problem with this request',
  retryLabel = 'Try again',
  fullPage = false,
  variant = 'card',
}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => {
            // Use provided fallback if available
            if (fallback) {
              const FallbackComponent = fallback;
              return <FallbackComponent error={error} resetErrorBoundary={resetErrorBoundary} />;
            }
            
            // Use provided error component if available
            if (errorComponent) {
              return <>{errorComponent}</>;
            }
            
            // Otherwise use the default fallback
            return (
              <ErrorFallback
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                title={title}
                description={description}
                retryLabel={retryLabel}
                fullPage={fullPage}
                variant={variant}
              />
            );
          }}
          onReset={reset}
          onError={onError}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

/**
 * Suspense-compatible error boundary for React Query
 * 
 * This is a specialized version of QueryErrorBoundary that works
 * with React's Suspense features.
 * 
 * @example
 * ```tsx
 * <SuspenseQueryErrorBoundary>
 *   <React.Suspense fallback={<Loading />}>
 *     <UserProfileComponent />
 *   </React.Suspense>
 * </SuspenseQueryErrorBoundary>
 * ```
 */
export function SuspenseQueryErrorBoundary({
  children,
  ...props
}: QueryErrorBoundaryProps) {
  return <QueryErrorBoundary {...props}>{children}</QueryErrorBoundary>;
}