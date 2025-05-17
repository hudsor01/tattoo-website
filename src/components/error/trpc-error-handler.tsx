'use client';

import React from 'react';
import { ErrorFallback, getErrorMessage } from './error-fallback';
import { Icons } from '@/components/ui/icons';

/**
 * Props for the TRPCErrorHandler component
 */
export interface TRPCErrorHandlerProps<TData> {
  /** Whether the query is in an error state */
  isError: boolean;
  /** The error object from the query */
  error: unknown;
  /** Whether the query is loading */
  isLoading: boolean;
  /** Function to refetch the data */
  refetch: () => void;
  /** Child components or render function */
  children: React.ReactNode | ((data: TData) => React.ReactNode);
  /** Data from the query */
  data: TData | undefined;
  /** Error title */
  errorTitle?: string;
  /** Error description */
  errorDescription?: string;
  /** Content to display while loading */
  loadingContent?: React.ReactNode;
  /** Whether to display as a full page error */
  fullPage?: boolean;
  /** Variant of error UI to display */
  variant?: 'card' | 'alert' | 'simple';
}

/**
 * TRPCErrorHandler Component
 * 
 * A specialized component for handling tRPC query errors.
 * It provides a consistent way to display loading states,
 * error states, and successful data rendering.
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { data, isLoading, isError, error, refetch } = trpc.users.getProfile.useQuery()
 *   
 *   return (
 *     <TRPCErrorHandler
 *       isError={isError}
 *       error={error}
 *       isLoading={isLoading}
 *       refetch={refetch}
 *       data={data}
 *     >
 *       {(data) => (
 *         <div>
 *           <h2>{data.name}</h2>
 *           <p>{data.email}</p>
 *         </div>
 *       )}
 *     </TRPCErrorHandler>
 *   )
 * }
 * ```
 */
export function TRPCErrorHandler<TData>({
  isError,
  error,
  isLoading,
  refetch,
  children,
  data,
  errorTitle = 'Error loading data',
  errorDescription = 'There was a problem fetching the data',
  loadingContent,
  fullPage = false,
  variant = 'card',
}: TRPCErrorHandlerProps<TData>) {
  // For loading state
  if (isLoading) {
    return loadingContent || (
      <div className={`flex items-center justify-center ${fullPage ? 'h-80' : 'py-8'}`}>
        <div className="text-center">
          <Icons.spinner className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // For error state
  if (isError) {
    return (
      <ErrorFallback
        error={error as Error}
        resetErrorBoundary={() => refetch()}
        title={errorTitle}
        description={errorDescription}
        retryLabel="Try again"
        fullPage={fullPage}
        variant={variant}
      />
    );
  }
  
  // For successful data fetch
  if (typeof children === 'function') {
    return data ? <>{children(data)}</> : null;
  }
  
  return <>{children}</>;
}

/**
 * Create a specialized error handler for a specific data type
 * 
 * @example
 * ```tsx
 * // Create a type-safe error handler for user profiles
 * const UserProfileErrorHandler = createTRPCErrorHandler<UserProfile>()
 * 
 * function UserProfile() {
 *   const query = trpc.users.getProfile.useQuery()
 *   
 *   return (
 *     <UserProfileErrorHandler {...query}>
 *       {(data) => (
 *         <div>
 *           <h2>{data.name}</h2>
 *           <p>{data.email}</p>
 *         </div>
 *       )}
 *     </UserProfileErrorHandler>
 *   )
 * }
 * ```
 */
export function createTRPCErrorHandler<TData>() {
  return (
    props: Omit<TRPCErrorHandlerProps<TData>, 'data'> & { 
      data?: TData 
    }
  ) => <TRPCErrorHandler<TData> {...props as TRPCErrorHandlerProps<TData>} />;
}