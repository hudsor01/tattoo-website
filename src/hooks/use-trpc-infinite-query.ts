'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc/client'
import type { TRPCClientError } from '@trpc/client'

interface UseTRPCInfiniteQueryProps<T> {
  queryKey: string[]
  queryFn: (params: { pageParam?: number }) => Promise<{
    data: T[]
    nextCursor?: number | null
    totalCount?: number
  }>
  enabled?: boolean
  staleTime?: number
  initialPageParam?: number
}

interface UseTRPCInfiniteQueryResult<T> {
  data: T[]
  count: number
  isSuccess: boolean
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown | null
  hasMore: boolean
  fetchNextPage: () => void
  refetch: () => Promise<unknown>
}

export function useTRPCInfiniteQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  initialPageParam = 0,
}: UseTRPCInfiniteQueryProps<T>): UseTRPCInfiniteQueryResult<T> {
  const {
    data: queryData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = initialPageParam }) => {
      return await queryFn({ pageParam })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam,
    enabled,
    staleTime,
  })

  // Flatten the paginated data
  const flatData = queryData?.pages.flatMap((page) => page.data) ?? []
  
  // Get total count from the first page (assuming it's consistent)
  const totalCount = queryData?.pages[0]?.totalCount ?? 0

  return {
    data: flatData,
    count: totalCount,
    isSuccess,
    isLoading,
    isFetching,
    isError,
    error: error as unknown | null,
    hasMore: hasNextPage ?? false,
    fetchNextPage: () => void fetchNextPage(),
    refetch: async () => { await refetch(); },
  }
}

// Specific hook for gallery designs
export function useGalleryInfiniteQuery({
  designType,
  limit = 20,
  enabled = true,
}: {
  designType?: string
  limit?: number
  enabled?: boolean
} = {}) {
  return useTRPCInfiniteQuery({
    queryKey: ['gallery', 'getPublicDesigns', designType ?? 'all', limit.toString()],
    queryFn: async ({ pageParam }) => {
      const response = await trpc.gallery.getPublicDesigns.query({
        limit,
        cursor: pageParam as number | undefined,
        designType: designType ?? undefined,
      })
      
      return {
        data: response.designs,
        nextCursor: response.nextCursor,
        totalCount: response.totalCount,
      }
    },
    enabled,
  })
}

// Specific hook for bookings
export function useBookingsInfiniteQuery({
  status,
  limit = 20,
  enabled = true,
}: {
  status?: string
  limit?: number
  enabled?: boolean
} = {}) {
  return useTRPCInfiniteQuery({
    queryKey: ['dashboard', 'getRecentBookings', status || 'all', limit.toString()],
    queryFn: async ({ pageParam }) => {
      // Note: This assumes the dashboard router supports cursor-based pagination
      // You may need to update the dashboard router to support this
      const response = await trpc.dashboard.getRecentBookings.query({
        limit,
        cursor: pageParam as number | undefined,
        status: status === 'all' ? undefined : (status ?? undefined),
      })
      
      return {
        data: response.bookings ?? [],
        nextCursor: response.nextCursor,
        totalCount: response.totalCount ?? response.bookings?.length ?? 0,
      }
    },
    enabled,
  })
}