'use client';

import type {
  UseTRPCQueryResult,
  UseTRPCMutationResult,
  UseTRPCInfiniteQueryResult,
  UseTRPCQueryOptions,
  UseTRPCMutationOptions,
  UseTRPCInfiniteQueryOptions,
} from '@trpc/react-query/shared';
import { QueryClient } from '@tanstack/react-query';
import { trpc } from '@/components/providers/ReactQueryProvider';
import type { AppRouter } from '@/lib/trpc-app';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Type inferences for tRPC router
type AppRouterInput = inferRouterInputs<AppRouter>;
type AppRouterOutput = inferRouterOutputs<AppRouter>;
type RouterKey = keyof AppRouter['_def']['record'];
type ProcedureRecord<TRouter extends RouterKey> =
  AppRouter['_def']['record'][TRouter]['_def']['record'];
type ProcedureKey<TRouter extends RouterKey> = keyof ProcedureRecord<TRouter>;

type ExtractInput<
  TRouter extends RouterKey,
  TProcedure extends ProcedureKey<TRouter>,
> = ProcedureRecord<TRouter>[TProcedure] extends {
  _def: { _input_in: infer TInput };
}
  ? TInput
  : undefined;

type ExtractOutput<
  TRouter extends RouterKey,
  TProcedure extends ProcedureKey<TRouter>,
> = AppRouterOutput[TRouter][TProcedure & string];

// Re-export trpc for direct access when needed
export { trpc };

/**
 * Core Types
 */
export type QueryHookResult<TData, TError> = UseTRPCQueryResult<TData, TError>;
export type MutationHookResult<TData, TError, TVariables, TContext> = UseTRPCMutationResult<
  TData,
  TError,
  TVariables,
  TContext
>;
export type InfiniteQueryHookResult<TData, TError> = UseTRPCInfiniteQueryResult<TData, TError>;

/**
 * Create a strongly typed query hook for a tRPC procedure
 *
 * @example
 * ```ts
 * export const useGalleryPhotos = createTRPCQueryHook(
 *   'gallery',
 *   'getPhotos',
 *   {
 *     staleTime: 1000 * 60 * 5, // 5 minutes
 *     refetchOnWindowFocus: false
 *   }
 * )
 * ```
 */
export function createTRPCQueryHook<
  TRouter extends RouterKey,
  TProcedure extends ProcedureKey<TRouter>,
  TInput extends ExtractInput<TRouter, TProcedure>,
  TOutput extends ExtractOutput<TRouter, TProcedure>,
>(
  routerKey: TRouter,
  procedureKey: TProcedure & string,
  defaultOptions?: UseTRPCQueryOptions<TInput, TOutput, TOutput, TOutput, Error>,
) {
  type InputType = TInput extends undefined ? void | undefined : TInput;
  type HookReturn = QueryHookResult<TOutput, Error>;

  const hook = (
    input?: InputType,
    options?: UseTRPCQueryOptions<TInput, TOutput, TOutput, TOutput, Error>,
  ): HookReturn => {
    // Access the router and procedure using the dynamic keys

    const procedure = trpc[routerKey][procedureKey];

    // Use the tRPC query hook with options
    return procedure.useQuery(
      input as any,
      {
        ...defaultOptions,
        ...options,
      } as any,
    );
  };

  return hook;
}

/**
 * Create a strongly typed mutation hook for a tRPC procedure
 *
 * @example
 * ```ts
 * export const useCreateTask = createTRPCMutationHook(
 *   'tasks',
 *   'create'
 * )
 * ```
 */
export function createTRPCMutationHook<
  TRouter extends RouterKey,
  TProcedure extends ProcedureKey<TRouter>,
  TInput extends ExtractInput<TRouter, TProcedure>,
  TOutput extends ExtractOutput<TRouter, TProcedure>,
>(
  routerKey: TRouter,
  procedureKey: TProcedure & string,
  defaultOptions?: UseTRPCMutationOptions<TOutput, Error, TInput, unknown>,
) {
  type HookReturn = MutationHookResult<TOutput, Error, TInput, unknown>;

  const hook = (options?: UseTRPCMutationOptions<TOutput, Error, TInput, unknown>): HookReturn => {
    // Access the router and procedure using the dynamic keys

    const procedure = trpc[routerKey][procedureKey];

    // Use the tRPC mutation hook with options
    return procedure.useMutation({
      ...defaultOptions,
      ...options,
    } as any);
  };

  return hook;
}

/**
 * Create a strongly typed infinite query hook for tRPC procedures that support pagination
 *
 * @example
 * ```tsx
 * export const useInfiniteGalleryPhotos = createTRPCInfiniteQueryHook(
 *   'gallery',
 *   'getInfinitePhotos',
 *   {
 *     getNextPageParam: (lastPage) => lastPage.nextCursor,
 *     staleTime: 1000 * 60 * 5, // 5 minutes
 *   }
 * )
 * ```
 */
export function createTRPCInfiniteQueryHook<
  TRouter extends RouterKey,
  TProcedure extends ProcedureKey<TRouter>,
  TInput extends ExtractInput<TRouter, TProcedure>,
  TOutput extends ExtractOutput<TRouter, TProcedure>,
>(
  routerKey: TRouter,
  procedureKey: TProcedure & string,
  defaultOptions?: UseTRPCInfiniteQueryOptions<TInput, TOutput, TOutput, TOutput, Error>,
) {
  type InputType = TInput extends undefined ? void | undefined : TInput;
  type HookReturn = InfiniteQueryHookResult<TOutput, Error>;

  const hook = (
    input?: InputType,
    options?: UseTRPCInfiniteQueryOptions<TInput, TOutput, TOutput, TOutput, Error>,
  ): HookReturn => {
    // Access the router and procedure using the dynamic keys

    const procedure = trpc[routerKey][procedureKey];

    // Use the tRPC infinite query hook with options
    return procedure.useInfiniteQuery(
      input as any,
      {
        ...defaultOptions,
        ...options,
      } as any,
    );
  };

  return hook;
}

/**
 * Creates a tRPC mutation hook with optimistic updates
 *
 * @example
 * ```ts
 * export const useAddTask = createTRPCOptimisticMutationHook({
 *   mutationRouter: 'tasks',
 *   mutationProcedure: 'add',
 *   queryRouter: 'tasks',
 *   queryProcedure: 'getAll',
 *   updateCache: (queryClient, newTask, oldData) => {
 *     if (!oldData) return [newTask]
 *     return [...oldData, newTask]
 *   }
 * })
 * ```
 */
export function createTRPCOptimisticMutationHook<
  TMutationRouter extends RouterKey,
  TMutationProcedure extends ProcedureKey<TMutationRouter>,
  TQueryRouter extends RouterKey,
  TQueryProcedure extends ProcedureKey<TQueryRouter>,
  TMutationInput extends ExtractInput<TMutationRouter, TMutationProcedure>,
  TMutationOutput extends ExtractOutput<TMutationRouter, TMutationProcedure>,
  TQueryOutput extends ExtractOutput<TQueryRouter, TQueryProcedure>,
>({
  mutationRouter,
  mutationProcedure,
  queryRouter,
  queryProcedure,
  updateCache,
  rollbackOnError = true,
  invalidateOnSuccess = true,
}: {
  mutationRouter: TMutationRouter;
  mutationProcedure: TMutationProcedure & string;
  queryRouter: TQueryRouter;
  queryProcedure: TQueryProcedure & string;
  updateCache: (
    queryClient: QueryClient,
    input: TMutationInput,
    oldData: TQueryOutput | undefined,
    context?: unknown,
  ) => TQueryOutput;
  rollbackOnError?: boolean;
  invalidateOnSuccess?: boolean;
}) {
  type HookReturn = MutationHookResult<TMutationOutput, Error, TMutationInput, unknown>;

  const hook = (
    options?: UseTRPCMutationOptions<TMutationOutput, Error, TMutationInput, unknown>,
  ): HookReturn => {
    // Get query client for cache manipulation
    const queryClient = trpc.useContext().queryClient;
    // Get the query invalidation function

    const utils = trpc.useContext()[queryRouter];

    return trpc[mutationRouter][mutationProcedure].useMutation({
      // Update cache optimistically before server responds
      onMutate: async input => {
        // Cancel any outgoing refetches to prevent race conditions
        await queryClient.cancelQueries({
          queryKey: [queryRouter, queryProcedure],
        });

        // Get snapshot of current cache value

        const previousData = queryClient.getQueryData([queryRouter, queryProcedure]);

        // Update the cache optimistically
        queryClient.setQueryData(
          [queryRouter, queryProcedure],
          (oldData: TQueryOutput | undefined) =>
            updateCache(queryClient, input, oldData, undefined),
        );

        // Return a context object to use for rollback if needed
        return { previousData };
      },

      // If the mutation fails, roll back to the previous snapshot
      onError: (err, input, context) => {
        console.error(`Error in ${mutationRouter}.${mutationProcedure}:`, err);

        if (rollbackOnError && context?.previousData) {
          queryClient.setQueryData([queryRouter, queryProcedure], context.previousData);
        }

        // Execute user's onError handler if provided
        if (options?.onError) {
          options.onError(err, input, context);
        }
      },

      // After success or error, invalidate query to ensure fresh data
      onSettled: (data, error, variables, context) => {
        if (invalidateOnSuccess) {
          utils[queryProcedure].invalidate();
        }

        // Execute user's onSettled handler if provided
        if (options?.onSettled) {
          options.onSettled(data, error, variables, context);
        }
      },

      // Execute user's onSuccess handler if provided
      onSuccess: (data, variables, context) => {
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },

      // Pass through any other options
      ...options,
    });
  };

  return hook;
}