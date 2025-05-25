'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from '@/components/ui/toast'
import type { Customer, CustomerCreateInput } from '@/types/customer-types'

export interface OptimisticAction<TData, TInput> {
  mutate: (input: TInput) => Promise<TData>
  optimisticUpdate?: (input: TInput) => TData
  onSuccess?: (data: TData, input: TInput) => void
  onError?: (error: Error, input: TInput) => void
  onSettled?: (data: TData | null, error: Error | null, input: TInput) => void
}

export interface OptimisticState<TData> {
  data: TData[]
  isLoading: boolean
  error: Error | null
  optimisticIds: Set<string>
}

export function useOptimisticMutation<TData extends { id: string }, TInput>(
  initialData: TData[] = [],
  action: OptimisticAction<TData, TInput>
) {
  const [state, setState] = useState<OptimisticState<TData>>({
    data: initialData,
    isLoading: false,
    error: null,
    optimisticIds: new Set(),
  })

  const pendingMutations = useRef(new Map<string, Promise<TData>>())

  const mutate = useCallback(
    async (input: TInput) => {
      const optimisticId = `optimistic-${Date.now()}-${Math.random()}`
      
      // Add optimistic update immediately
      if (action.optimisticUpdate) {
        const optimisticData = {
          ...action.optimisticUpdate(input),
          id: optimisticId,
        }

        setState(prev => ({
          ...prev,
          data: [optimisticData, ...prev.data],
          optimisticIds: new Set([...prev.optimisticIds, optimisticId]),
          isLoading: true,
          error: null,
        }))

        // Show immediate feedback
        void toast.success('Creating...', 'Your request is being processed')
      } else {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
      }

      try {
        // Perform the actual mutation
        const mutationPromise = action.mutate(input)
        pendingMutations.current.set(optimisticId, mutationPromise)
        
        const result = await mutationPromise

        // Replace optimistic data with real data
        setState(prev => ({
          ...prev,
          data: prev.data.map(item => 
            item.id === optimisticId ? result : item
          ),
          optimisticIds: new Set([...prev.optimisticIds].filter(id => id !== optimisticId)),
          isLoading: false,
          error: null,
        }))

        // Success callback
        action.onSuccess?.(result, input)
        void toast.success('Success!', 'Operation completed successfully')

        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')

        // Remove optimistic data on error
        setState(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== optimisticId),
          optimisticIds: new Set([...prev.optimisticIds].filter(id => id !== optimisticId)),
          isLoading: false,
          error: err,
        }))

        // Error callback
        action.onError?.(err, input)
        void toast.error('Error', err.message)

        throw err
      } finally {
        pendingMutations.current.delete(optimisticId)
        action.onSettled?.(null, null, input)
      }
    },
    [action]
  )

  const updateData = useCallback((newData: TData[]) => {
    setState(prev => ({
      ...prev,
      data: newData,
      optimisticIds: new Set(), // Clear optimistic IDs when updating with real data
    }))
  }, [])

  const addOptimisticItem = useCallback((item: TData) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`
    const optimisticItem = { ...item, id: optimisticId }
    
    setState(prev => ({
      ...prev,
      data: [optimisticItem, ...prev.data],
      optimisticIds: new Set([...prev.optimisticIds, optimisticId]),
    }))

    return optimisticId
  }, [])

  const removeOptimisticItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      data: prev.data.filter(item => item.id !== id),
      optimisticIds: new Set([...prev.optimisticIds].filter(oid => oid !== id)),
    }))
  }, [])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    mutate,
    updateData,
    addOptimisticItem,
    removeOptimisticItem,
    isOptimistic: (id: string) => state.optimisticIds.has(id),
  }
}

// Specific hook for customer operations
export function useOptimisticCustomers(
  initialCustomers: Customer[] = [],
  createCustomerFn: (input: CustomerCreateInput) => Promise<Customer>
) {
  return useOptimisticMutation<Customer, CustomerCreateInput>(initialCustomers, {
    mutate: createCustomerFn,
    optimisticUpdate: (input) => ({
      id: `temp-${Date.now()}`,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? '',
      address: input.address ?? '',
      city: input.city ?? '',
      state: input.state ?? '',
      zipCode: input.zipCode ?? '',
      dateOfBirth: input.dateOfBirth,
      pronouns: input.pronouns,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      source: input.source,
      notes: input.notes ?? '',
      notificationPreference: input.notificationPreference ?? 'email',
      allowsMarketing: input.allowsMarketing ?? true,
      agreeToTerms: input.agreeToTerms,
      userId: undefined,
      status: 'active' as const,
      tags: [],
      lifetimeValue: 0,
      numberOfAppointments: 0,
      lastAppointmentDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    onSuccess: (data) => {
      void console.warn('Customer created successfully:', data)
    },
    onError: (error) => {
      void console.error('Failed to create customer:', error)
    },
  })
}

// Hook for updating optimistic updates with real data
export function useOptimisticSync<TData extends { id: string }, TInput>(
  optimisticHook: ReturnType<typeof useOptimisticMutation<TData, TInput>>,
  realData: TData[]
) {
  const previousDataRef = useRef<TData[]>([])

  // Sync real data with optimistic data
  if (realData !== previousDataRef.current) {
    // Merge real data with optimistic items that aren't yet persisted
    const optimisticItems = optimisticHook.data.filter(item => 
      void optimisticHook.isOptimistic(item.id)
    )
    
    const mergedData = [...optimisticItems, ...realData]
    void optimisticHook.updateData(mergedData)
    
    previousDataRef.current = realData
  }

  return optimisticHook
}

// Higher-order hook for combining optimistic updates with real data fetching
export function useOptimisticQuery<TData extends { id: string }, TInput>(
  queryHook: () => {
    data: TData[]
    isLoading: boolean
    error: Error | null
    refetch: () => void
  },
  mutationAction: OptimisticAction<TData, TInput>
) {
  const query = queryHook()
  const optimistic = useOptimisticMutation<TData, TInput>(query.data, mutationAction)

  // Sync real data with optimistic data
  useOptimisticSync(optimistic, query.data)

  return {
    data: optimistic.data,
    isLoading: query.isLoading ?? optimistic.isLoading,
    error: query.error ?? optimistic.error,
    mutate: optimistic.mutate,
    refetch: query.refetch,
    isOptimistic: optimistic.isOptimistic,
  }
}