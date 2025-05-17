/**
 * query-types.ts
 *
 * Type definitions for React Query hooks and related functionality.
 */

import { z } from 'zod';
import { ApiResponse, FilterOptions, RecordObject } from './base-types';
import { PaginatedListResponse, SuccessResponse } from './api-types';

/**
 * Options for creating query hooks
 */
export interface CreateQueryHooksOptions<
  TResource extends string,
  TListParams extends FilterOptions,
  TDetail,
  TCreate extends RecordObject,
  TUpdate extends RecordObject,
> {
  /**
   * Resource name, used in query keys (e.g., 'bookings', 'clients')
   */
  resource: TResource;

  /**
   * API endpoint paths for different operations
   */
  endpoints: {
    list: string;
    detail: (id: string | number) => string;
    create?: string;
    update?: (id: string | number) => string;
    delete?: (id: string | number) => string;
  };

  /**
   * Zod schemas for validation
   */
  schemas?: {
    list?: {
      params?: z.ZodType<TListParams>;
      response?: z.ZodType<PaginatedListResponse<TDetail> | ApiResponse<TDetail[]>>;
    };
    detail?: {
      response?: z.ZodType<SuccessResponse<TDetail> | ApiResponse<TDetail>>;
    };
    create?: {
      request?: z.ZodType<TCreate>;
      response?: z.ZodType<SuccessResponse<TDetail> | ApiResponse<TDetail>>;
    };
    update?: {
      request?: z.ZodType<TUpdate>;
      response?: z.ZodType<SuccessResponse<TDetail> | ApiResponse<TDetail>>;
    };
  };

  /**
   * Query client configuration
   */
  config?: {
    list?: {
      staleTime?: number;
      refetchInterval?: number | false;
      enabled?: boolean;
    };
    detail?: {
      staleTime?: number;
      refetchInterval?: number | false;
    };
  };
}

/**
 * Query keys for a resource
 */
export type QueryKeys<TResource extends string, TListParams> = {
  all: readonly [TResource];
  lists: () => readonly [TResource, string];
  list: (params?: TListParams) => readonly [TResource, string, TListParams | undefined];
  details: () => readonly [TResource, string];
  detail: (id: string | number) => readonly [TResource, string, string | number];
};

/**
 * API request error type
 */
export interface ApiRequestError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Hook result type for list queries
 */
export interface UseListResult<TDetail> {
  data?: PaginatedListResponse<TDetail> | ApiResponse<TDetail[]>;
  isLoading: boolean;
  isError: boolean;
  error: ApiRequestError | null;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Hook result type for detail queries
 */
export interface UseDetailResult<TDetail> {
  data?: SuccessResponse<TDetail> | ApiResponse<TDetail>;
  isLoading: boolean;
  isError: boolean;
  error: ApiRequestError | null;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Hook result type for mutations
 */
export interface UseMutationResult<TResult, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TResult>;
  isLoading: boolean;
  isError: boolean;
  error: ApiRequestError | null;
  isSuccess: boolean;
  data?: TResult;
  reset: () => void;
}