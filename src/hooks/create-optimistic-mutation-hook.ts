'use client'

import { 
  useMutation, 
  useQueryClient, 
  UseMutationOptions,
  type QueryKey as RQQueryKey
} from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/use-toast'
import { AppRouter } from '@/lib/trpc/app-router'
import { TRPCClientError } from '@trpc/client'

// For dynamic access to tRPC routers and procedures by name
type RouterKeys = keyof AppRouter
type ProcedureRecord<R extends RouterKeys> = AppRouter[R]
type ProcedureKeys<R extends RouterKeys> = keyof ProcedureRecord<R> & string

// Helper type for tRPC mutation options
type TRPCMutationOptions<TInput, TOutput> = Omit<
  UseMutationOptions<TOutput, Error, TInput, unknown>,
  'mutationFn'
>

/**
 * Type-safe helper to create and use tRPC query keys
 */
class TRPCQueryKeyManager<R extends RouterKeys, P extends ProcedureKeys<R>> {
  private readonly router: R
  private readonly procedure: P
  
  constructor(router: R, procedure: P) {
    this.router = router
    this.procedure = procedure
  }
  
  /**
   * Get the query key in the format expected by React Query
   */
  getQueryKey(): RQQueryKey {
    return [this.router, this.procedure]
  }
  
  /**
   * Use this to wrap React Query methods that require a query key
   */
  withQueryClient<T>(
    queryClient: ReturnType<typeof useQueryClient>,
    method: 'cancelQueries' | 'invalidateQueries' | 'getQueryData' | 'setQueryData',
    ...args: any[]
  ): T {
    const queryKey = this.getQueryKey()
    
    if (method === 'setQueryData') {
      const [updateFn] = args
      return queryClient[method](queryKey, updateFn) as T
    }
    
    if (method === 'getQueryData') {
      return queryClient[method](queryKey) as T
    }
    
    return queryClient[method]({ queryKey, ...args[0] }) as T
  }
}

/**
 * Type-safe helper to dynamically access tRPC procedures
 * This allows us to use RouterKeys and ProcedureKeys as parameters
 * and still maintain type safety
 */
function getTRPCProcedure<
  R extends RouterKeys,
  P extends ProcedureKeys<R>
>(trpcClient: typeof trpc, router: R, procedure: P) {
  const toast = useToast();
  // We know this is valid because of the generic constraints
  return trpcClient[router][procedure as keyof (typeof trpcClient)[R]]
}

/**
 * Options for creating an optimistic mutation hook
 */
interface OptimisticMutationHookOptions<TInput, TQueryData> {
  // tRPC router and procedure for the mutation
  mutationRouter: RouterKeys
  mutationProcedure: string
  
  // tRPC router and procedure for the query to update
  queryRouter: RouterKeys
  queryProcedure: string
  
  // Function to update the cache optimistically
  updateCache: (queryClient: ReturnType<typeof useQueryClient>, input: TInput, oldData?: TQueryData) => TQueryData
  
  // Success and error messages
  successMessage?: string | ((data: unknown) => string)
  errorMessage?: string | ((error: Error) => string)
}

/**
 * Options for creating an optimistic item mutation hook
 */
interface OptimisticItemMutationHookOptions<TInput, TQueryData> {
  // tRPC router and procedure for the mutation
  mutationRouter: RouterKeys
  mutationProcedure: string
  
  // tRPC router and procedure for the query to update
  queryRouter: RouterKeys
  queryProcedure: string
  
  // Function to get the optimistic item
  getOptimisticItem: (input: TInput, oldData?: TQueryData) => TQueryData
  
  // Success and error messages
  successMessage?: string | ((data: unknown) => string)
  errorMessage?: string | ((error: Error) => string)
}

/**
 * Creates a hook for tRPC mutations with optimistic updates
 * 
 * This will update the UI immediately before waiting for the server
 * to confirm the mutation, providing a more responsive user experience.
 */
export function createTRPCOptimisticMutationHook<
  TInput extends Record<string, unknown>,
  TOutput = unknown,
  TQueryData = unknown[]
>({
  mutationRouter,
  mutationProcedure,
  queryRouter,
  queryProcedure,
  updateCache,
  successMessage,
  errorMessage,
}: OptimisticMutationHookOptions<TInput, TQueryData>) {
  return function useMutation(options?: TRPCMutationOptions<TInput, TOutput>) {
    const queryClient = useQueryClient()
    
    // Type-safe access to tRPC procedure
    const procedureRef = getTRPCProcedure(
      trpc, 
      mutationRouter,
      mutationProcedure as ProcedureKeys<typeof mutationRouter>
    )
    
    const mutation = procedureRef.useMutation({
      onMutate: async (newData) => {
        // Create a type-safe query key manager
        const keyManager = new TRPCQueryKeyManager(
          queryRouter,
          queryProcedure as ProcedureKeys<typeof queryRouter>
        )

        // Cancel any outgoing refetches to avoid overwriting our optimistic update
        await keyManager.withQueryClient(queryClient, 'cancelQueries', {})
        
        // Snapshot the previous value
        const previousData = keyManager.withQueryClient<TQueryData | undefined>(
          queryClient, 
          'getQueryData'
        )
        
        // Optimistically update to the new value
        keyManager.withQueryClient(
          queryClient, 
          'setQueryData', 
          (old: TQueryData) => updateCache(queryClient, newData, old)
        )
        
        // Return a context object with the snapshotted value
        return { previousData }
      },
      
      onSuccess: (data) => {
        if (successMessage) {
          const message = typeof successMessage === 'function'
            ? successMessage(data)
            : successMessage
          
          toast.success(message)
        }
        
        // Create a type-safe query key manager
        const keyManager = new TRPCQueryKeyManager(
          queryRouter,
          queryProcedure as ProcedureKeys<typeof queryRouter>
        )
        
        // Refresh the data to ensure it's in sync with the server
        keyManager.withQueryClient(queryClient, 'invalidateQueries', {})
        
        // Call the original onSuccess if it exists
        options?.onSuccess?.(data, {} as TInput, { previousData: null })
      },
      
      onError: (error, newData, context) => {
        if (errorMessage) {
          const message = typeof errorMessage === 'function'
            ? errorMessage(error)
            : errorMessage
          
          toast.error(message)
        } else {
          toast.error('An error occurred. Please try again.')
        }
        
        // Create a type-safe query key manager
        const keyManager = new TRPCQueryKeyManager(
          queryRouter,
          queryProcedure as ProcedureKeys<typeof queryRouter>
        )
        
        // Rollback to the previous value if available
        if (context?.previousData) {
          keyManager.withQueryClient(
            queryClient, 
            'setQueryData', 
            context.previousData
          )
        }
        
        // Call the original onError if it exists
        options?.onError?.(error, newData as TInput, context)
      },
      
      // Spread any other options
      ...options,
    })
    
    return mutation
  }
}

/**
 * Creates a hook for tRPC mutations that operate on single items
 * with optimistic updates
 */
export function createTRPCOptimisticItemMutationHook<
  TInput extends Record<string, unknown>,
  TOutput = unknown,
  TQueryData = unknown[]
>({
  mutationRouter,
  mutationProcedure,
  queryRouter,
  queryProcedure,
  getOptimisticItem,
  successMessage,
  errorMessage,
}: OptimisticItemMutationHookOptions<TInput, TQueryData>) {
  // Use the base optimistic mutation hook with a specialized update function
  return createTRPCOptimisticMutationHook<TInput, TOutput, TQueryData>({
    mutationRouter,
    mutationProcedure,
    queryRouter,
    queryProcedure,
    // We only pass the input and oldData to getOptimisticItem, ignoring queryClient
    updateCache: (_, input, oldData) => getOptimisticItem(input, oldData),
    successMessage,
    errorMessage,
  })
}