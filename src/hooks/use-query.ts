'use client';

/**
 * Consolidated Query Hooks
 * 
 * This file provides unified hooks for data fetching, including:
 * - Infinite queries
 * - API integration
 * - Specialized domain queries
 */

import { useInfiniteQuery } from '@tanstack/react-query';
// Import proper types from Prisma
import type { BookingStatus } from '@prisma/client';
type AppointmentStatus = BookingStatus;

// Add missing type imports
interface TRPCError extends Error {
  code?: string;
  data?: unknown;
}


interface UseTRPCInfiniteQueryProps<T> {
  queryKey: (string | Record<string, unknown>)[];
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
  return useTRPCInfiniteQuery({
    queryKey: ['gallery', 'publicDesigns', { designType, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        cursor: pageParam.toString(),
        ...(designType && { designType }),
      });
      
      const response = await fetch(`/api/gallery/public-designs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery designs');
      }
      
      return await response.json();
    },
    enabled,
  });
}

/**
 * Appointments infinite query hook
 */
export function useAppointmentsInfiniteQuery({
  status,
  limit = 20,
  enabled = true,
}: {
  status?: AppointmentStatus;
  limit?: number;
  enabled?: boolean;
} = {}) {
  return useTRPCInfiniteQuery({
    queryKey: ['appointments', 'getAll', { status, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        cursor: pageParam.toString(),
        ...(status && { status }),
      });
      
      const response = await fetch(`/api/appointments?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      return await response.json();
    },
    enabled,
  });
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
  return useTRPCInfiniteQuery({
    queryKey: ['admin', 'customers', { searchTerm, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        cursor: pageParam.toString(),
        ...(searchTerm && { searchTerm }),
      });
      
      const response = await fetch(`/api/admin/customers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      return await response.json();
    },
    enabled,
  });
}