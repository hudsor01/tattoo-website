'use client';

/**
 * Consolidated Query Hooks
 * 
 * This file provides unified hooks for data fetching, including:
 * - Infinite queries
 * - TRPC integration
 * - Specialized domain queries
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc/client-provider';
import { AppointmentStatus } from '@prisma/client';
import type { TRPCError } from '@trpc/server';

// GENERIC INFINITE QUERY HOOKS


interface UseTRPCInfiniteQueryProps<T> {
  queryKey: string[];
  queryFn: (params: { pageParam?: number }) => Promise<{
    data: T[];
    nextCursor?: number | null;
    totalCount?: number;
  }>;
  enabled?: boolean;
  staleTime?: number;
  initialPageParam?: number;
}

interface UseTRPCInfiniteQueryResult<T> {
  data: T[];
  count: number;
  isSuccess: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: TRPCError | null;
  hasMore: boolean;
  fetchNextPage: () => void;
  refetch: () => Promise<void>;
}

/**
 * Generic infinite query hook that works with any TRPC or TanStack Query
 */
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
      return await queryFn({ pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam,
    enabled,
    staleTime,
  });

  // Flatten the paginated data
  const flatData = queryData?.pages.flatMap((page) => page.data) ?? [];

  // Get total count from the first page (assuming it's consistent)
  const totalCount = queryData?.pages[0]?.totalCount ?? 0;

  return {
    data: flatData,
    count: totalCount,
    isSuccess,
    isLoading,
    isFetching,
    isError,
    error: error as TRPCError | null,
    hasMore: hasNextPage ?? false,
    fetchNextPage: () => void fetchNextPage(),
    refetch: async () => {
      await refetch();
    },
  };
}


// DOMAIN-SPECIFIC INFINITE QUERY HOOKS


/**
 * Gallery designs infinite query hook
 */
export function useGalleryInfiniteQuery({
  designType,
  limit = 20,
  enabled = true,
}: {
  designType?: string;
  limit?: number;
  enabled?: boolean;
} = {}) {
  return trpc.gallery.getPublicDesigns.useInfiniteQuery(
    {
      limit,
      designType,
    },
    {
      enabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
}

/**
 * Bookings infinite query hook
 */
export function useBookingsInfiniteQuery({
  status,
  limit = 20,
  enabled = true,
}: {
  status?: string;
  limit?: number;
  enabled?: boolean;
} = {}) {
  return trpc.appointments.getAll.useInfiniteQuery(
    {
      limit,
      status: status as AppointmentStatus | undefined,
    },
    {
      enabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
}

/**
 * Customers infinite query hook
 */
export function useCustomersInfiniteQuery({
  searchTerm,
  limit = 20,
  enabled = true,
}: {
  searchTerm?: string;
  limit?: number;
  enabled?: boolean;
} = {}) {
  return trpc.admin.customers.useInfiniteQuery(
    {
      limit,
      searchTerm,
    },
    {
      enabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
}