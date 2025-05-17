'use client'

import { useQuery, UseQueryOptions, useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'
import { AppRouter } from '@/lib/trpc/app-router'

// Define types for tRPC dynamic access
type RouterKeys = keyof AppRouter
type ProcedureRecord<R extends RouterKeys> = AppRouter[R]
type ProcedureKeys<R extends RouterKeys> = keyof ProcedureRecord<R> & string

/**
 * Type-safe helper to dynamically access tRPC procedures
 */
function getTRPCProcedure<
  R extends RouterKeys,
  P extends ProcedureKeys<R>
>(trpcClient: typeof trpc, router: R, procedure: P) {
  // We know this is valid because of the generic constraints
  return trpcClient[router][procedure as keyof (typeof trpcClient)[R]]
}

/**
 * Creates a hook for a tRPC query with proper typing and caching
 * 
 * @param router The tRPC router to use (e.g., 'user', 'gallery', etc.)
 * @param procedure The procedure name on that router
 * @param defaultOptions Default React Query options
 * @returns A hook that fetches data from the tRPC procedure
 */
export function createTRPCQueryHook<
  R extends RouterKeys,
  P extends ProcedureKeys<R>,
  TInput = unknown,
  TOutput = unknown
>(
  router: R,
  procedure: P,
  defaultOptions: Omit<UseQueryOptions<TOutput, Error, TOutput, unknown[]>, 'queryKey' | 'queryFn'> = {}
) {
  return function useCustomQuery(
    input?: TInput,
    options?: Omit<UseQueryOptions<TOutput, Error, TOutput, unknown[]>, 'queryKey' | 'queryFn'>
  ) {
    const procedureRef = getTRPCProcedure(trpc, router, procedure);
    
    return procedureRef.useQuery(input, {
      ...defaultOptions,
      ...options
    });
  }
}

/**
 * Creates a hook for a paginated tRPC query with proper typing and caching
 * 
 * @param router The tRPC router to use
 * @param procedure The procedure name on that router
 * @param defaultOptions Default React Query options
 * @returns A hook that fetches paginated data from the tRPC procedure
 */
export function createTRPCPaginatedQueryHook<
  R extends RouterKeys,
  P extends ProcedureKeys<R>,
  TInput = unknown,
  TOutput = unknown
>(
  router: R,
  procedure: P,
  defaultOptions: Omit<UseInfiniteQueryOptions<TOutput, Error, TOutput, TOutput, unknown[]>, 'queryKey' | 'queryFn'> = {}
) {
  return function useCustomInfiniteQuery(
    input?: TInput,
    options?: Omit<UseInfiniteQueryOptions<TOutput, Error, TOutput, TOutput, unknown[]>, 'queryKey' | 'queryFn'>
  ) {
    const procedureRef = getTRPCProcedure(trpc, router, procedure);
    
    return procedureRef.useInfiniteQuery(input, {
      ...defaultOptions,
      ...options
    });
  }
}