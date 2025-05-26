/**
 * api-types.ts
 *
 * Consolidated API-related type definitions for the application.
 * This includes request/response types, parameters, and utility types for API operations.
 */

import { z } from 'zod';
import type { TRPCError } from '@trpc/server';
import { PaymentStatus, PaymentType } from './enum-types';
import type { ID } from './utility-types';

/**
 * API response envelope
 *
 * This is the standard response format for all API endpoints.
 * It includes fields for both error and success responses.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: { path: string; message: string }[];
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore?: boolean;
  };
  links?: {
    self?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

/**
 * Success Response
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
  meta?: Record<string, unknown>;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[] | unknown;
  code?: string;
  timestamp?: string;
  path?: string;
  validationErrors?: ValidationError[];
  data?: unknown;
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

/**
 * Batch Operation Response
 */
export interface BatchOperationResponse<T = unknown> {
  success: true;
  results: {
    successful: T[];
    failed: Array<{
      item: unknown;
      error: string;
    }>;
  };
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

/**
 * Query Parameters
 */
export interface QueryParams {
  [key: string]: string | number | boolean | null;
}

/**
 * TRPC Client Configuration Options
 */
export interface TRPCClientConfig {
  transformer?: unknown;
  headers?: Record<string, string>;
  abortOnUnmount?: boolean;
  retries?: number;
  retryDelay?: number;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  error?: string;
  bucket?: string;
  id?: string;
}

/**
 * External API Configuration
 */
export interface ExternalApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Cal.com Webhook Event
 */
export interface CalWebhookEvent {
  id: string;
  triggerEvent: string;
  payload: {
    bookingId?: string;
    userId?: string;
    cancellationReason?: string;
    rescheduleReason?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };
  createdAt: string | Date;
}

/**
 * Backend Health Check Response
 */
export interface HealthCheckResponse {
  success: true;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message?: string;
      latency?: number;
    };
  };
}

/**
 * Job or Task Status Response
 */
export interface JobStatusResponse {
  success: true;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  result?: unknown;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
}

// Note: Using ApiError from api-errors.ts instead of former ApiRequestError
export type { ApiError } from '@/lib/api-errors';

// Domain-specific API Types

/**
 * Booking Request
 */
export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  tattooType: string;
  size: string;
  placement: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  paymentMethod: string;
}

/**
 * Contact Form Request
 */
export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  hasReference?: boolean;
  referenceImages?: string[];
  agreeToTerms: boolean;
}

/**
 * Contact Form API Response
 */
export interface ContactApiResponse {
  success: boolean;
  message?: string;
  contactId?: number;
  data?: {
    name: string;
    email: string;
    subject?: string;
    sentAt: string;
  };
}

/**
 * Contact Form API Error Response
 */
export interface ContactApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Lead Tracking Request
 */
export interface LeadTrackingRequest {
  name: string;
  email: string;
  leadMagnetType: string;
}

/**
 * Payment Intent Request
 */
export interface PaymentIntentRequest {
  amount: number;
  email: string;
  name?: string;
  bookingId?: number;
  appointmentId?: string;
  clientId?: string;
  paymentType?: PaymentType | string;
  description?: string;
  currency?: string;
  metadata?: Record<string, string>;
}

/**
 * Payment Intent Response
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Payment Status Response
 */
export interface PaymentStatusResponse {
  id?: ID;
  status: PaymentStatus | string;
  amount: number;
  currency?: string;
  receipt_email?: string;
  bookingId?: number;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Availability Response
 */
export interface AvailabilityResponse {
  date: string;
  availableSlots: Array<{
    startTime: string;
    endTime: string;
  }>;
}

/**
 * Search Response
 */
export interface SearchResponse<T = unknown> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    query: string;
    filters?: Record<string, unknown>;
  };
}

// API Parameter Types

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Date Range Parameters
 */
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Search Parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filter?: Record<string, unknown>;
}

/**
 * Appointment Filter Parameters
 */
export interface AppointmentFilterParams extends PaginationParams, DateRangeParams {
  status?: string | string[];
  clientId?: string | number;
  artistId?: string | number;
}

/**
 * Booking Filter Parameters
 */
export interface BookingFilterParams extends PaginationParams, DateRangeParams {
  status?: string | string[];
  clientId?: string | number;
  tattooType?: string | string[];
}

/**
 * Payment Filter Parameters
 */
export interface PaymentFilterParams extends PaginationParams, DateRangeParams {
  status?: string | string[];
  clientId?: string | number;
  paymentType?: string | string[];
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Client Filter Parameters
 */
export interface ClientFilterParams extends PaginationParams {
  status?: string;
  search?: string;
  hasBookings?: boolean;
  hasPayments?: boolean;
}

// Zod Schema Definitions
// These can be used for validation on both client and server

/**
 * API Response Schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  details: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
  meta: z
    .object({
      page: z.number().optional(),
      perPage: z.number().optional(),
      total: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
});

/**
 * Paginated Response Schema
 */
export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

/**
 * Filter Parameters Schema
 */
export const FilterParamsSchema = z
  .object({
    page: z.number().optional(),
    limit: z.number().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .passthrough();

/**
 * Availability Slot Schema
 */
export const AvailabilitySlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

/**
 * Availability Response Schema
 */
export const AvailabilityResponseSchema = z.object({
  date: z.string(),
  availableSlots: z.array(AvailabilitySlotSchema),
});

/**
 * Payment Intent Request Schema
 */
export const PaymentIntentRequestSchema = z.object({
  amount: z.number().positive(),
  email: z.string().email(),
  name: z.string().optional(),
  bookingId: z.number().optional(),
  appointmentId: z.string().optional(),
  clientId: z.string().optional(),
  paymentType: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional().default('usd'),
  metadata: z.record(z.string()).optional(),
});

/**
 * Payment Intent Response Schema
 */
export const PaymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
});

/**
 * Payment Status Response Schema
 */
export const PaymentStatusResponseSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  status: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  receipt_email: z.string().optional(),
  bookingId: z.number().optional(),
  appointmentId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Lead Tracking Request Schema
 */
export const LeadTrackingRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  leadMagnetType: z.string(),
});

/**
 * File Upload Response Schema
 */
export const FileUploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  path: z.string().optional(),
  filename: z.string().optional(),
  mimetype: z.string().optional(),
  size: z.number().optional(),
  error: z.string().optional(),
});

/**
 * Cal.com Webhook Event Schema
 */
export const CalWebhookEventSchema = z.object({
  id: z.string(),
  triggerEvent: z.string(),
  payload: z.object({
    bookingId: z.string().optional(),
    userId: z.string().optional(),
    cancellationReason: z.string().optional(),
    rescheduleReason: z.string().optional(),
    status: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  createdAt: z.string().or(z.date()),
});

/**
 * API Error Schema
 */
export const ApiErrorSchema = z.object({
  code: z.string().or(z.number()),
  message: z.string(),
  details: z.unknown().optional(),
  path: z.string().optional(),
  timestamp: z.string().or(z.date()).optional(),
});

/**
 * External API Config Schema
 */
export const ExternalApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  timeout: z.number().optional(),
  headers: z.record(z.string()).optional(),
});

/**
 * tRPC Procedure Configuration
 */
export interface TRPCProcedureConfig {
  path: string;
  access: 'public' | 'protected' | 'admin';
  responseSchema?: z.ZodType<unknown>;
  inputSchema?: z.ZodType<unknown>;
}

/**
 * tRPC Handler Types
 */

export type TRPCMiddlewareConfig = {
  cacheTime?: number; // in milliseconds
};

/**
 * tRPC Context Middleware
 */
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

/**
 * ========================================================================
 * tRPC TYPES (from trpc-types.ts)
 * ========================================================================
 */

// tRPC type imports
import type { PrismaClient } from '@prisma/client';

/**
 * Context object passed to all tRPC procedures
 */
export interface Context {
  prisma: PrismaClient;
  req: Request;
  headers: Headers;
  user: null; // No authentication
}

/**
 * Creates tRPC context type from createContext function return value
 * This is designed to be imported from lib/trpc-context.ts
 */
export type CreateContextReturn = Context;

/**
 * tRPC router input/output types
 * NOTE: RouterInputs and RouterOutputs types need to be properly defined
 */
// Types RouterInputs and RouterOutputs are not available in lib/trpc/types

/**
 * ========================================================================
 * QUERY TYPES (FROM REACT QUERY)
 * ========================================================================
 */

/**
 * Options for creating tRPC query hooks
 */
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

/**
 * tRPC query key helpers
 */
export type TRPCQueryKey = string[];

/**
 * Helper utility to create tRPC query keys
 */
export const createTRPCQueryKeys = (namespace: string) => ({
  all: [namespace] as const,
  lists: () => [namespace, 'list'] as const,
  list: (params?: Record<string, unknown>) => [namespace, 'list', params] as const,
  detail: (id: string | number) => [namespace, 'detail', id.toString()] as const,
  mutation: (type: string) => [namespace, 'mutation', type] as const,
});

/**
 * API request error type
 */
export interface ApiRequestError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Hook result type for tRPC list queries
 */
export interface TRPCListQueryResult<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: TRPCError | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook result type for tRPC detail queries
 */
export interface TRPCDetailQueryResult<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: TRPCError | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook result type for tRPC mutations
 */
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
