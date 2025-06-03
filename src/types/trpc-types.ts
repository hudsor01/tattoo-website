import type { inferRouterInputs, inferRouterOutputs, TRPCError } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/api-router';
import type { PrismaClient } from '@prisma/client';
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type GalleryRouter = RouterOutputs['gallery'];
export type GalleryInputs = RouterInputs['gallery'];

export type AdminRouter = RouterOutputs['admin'];
export type AdminInputs = RouterInputs['admin'];

export type DashboardRouter = RouterOutputs['dashboard'];
export type DashboardInputs = RouterInputs['dashboard'];

export type CalRouter = RouterOutputs['cal'];
export type CalInputs = RouterInputs['cal'];

export type SubscriptionRouter = RouterOutputs['subscription'];
export type SubscriptionInputs = RouterInputs['subscription'];

export interface Context {
  prisma: PrismaClient;
  req: Request;
  headers: Headers;
  user: null | {
    id: string;
    email: string;
    role: string;
  };
}

export type CreateContextReturn = Context;

export interface TRPCProcedureConfig {
  path: string;
  access: 'public' | 'protected' | 'admin';
  responseSchema?: unknown;
  inputSchema?: unknown;
}

export type TRPCMiddlewareConfig = {
  cacheTime?: number; // in milliseconds
};

export interface TRPCMiddleware<TContext = unknown> {
  name: string;
  process: (opts: {
    ctx: TContext;
    type: 'query' | 'mutation' | 'subscription';
    path: string;
    input: unknown;
    next: () => Promise<unknown>;
  }) => Promise<unknown>;
}

export interface TRPCQueryOptions<TInput = unknown> {
  /**
   * Whether the query should execute
   */
  enabled?: boolean;

  /**
   * Time until the data becomes stale (in milliseconds)
   */
  staleTime?: number;

  /**
   * Refetch interval (in milliseconds)
   */
  refetchInterval?: number | false;

  /**
   * Whether to refetch when window focuses
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Success callback
   */
  onSuccess?: (data: unknown) => void;

  /**
   * Error callback
   */
  onError?: (error: TRPCError) => void;

  /**
   * Transform function to modify the response data
   */
  select?: (data: unknown) => unknown;

  /**
   * Input parameters for the query
   */
  input?: TInput;
}

export type TRPCQueryKey = string[];

export const createTRPCQueryKeys = (namespace: string) => ({
  all: [namespace] as const,
  lists: () => [namespace, 'list'] as const,
  list: (params?: Record<string, unknown>) => [namespace, 'list', params] as const,
  detail: (id: string | number) => [namespace, 'detail', id.toString()] as const,
  mutation: (type: string) => [namespace, 'mutation', type] as const,
});

export interface TRPCClientError {
  message: string;
  code: string;
  data?: Record<string, unknown>;
}

export interface TRPCListQueryResult<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: TRPCError | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export interface TRPCDetailQueryResult<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: TRPCError | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export interface TRPCMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: TRPCError | null;
  isSuccess: boolean;
  data?: TData;
  reset: () => void;
}