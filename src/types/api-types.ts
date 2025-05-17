/**
 * api-types.ts
 *
 * Consolidated API-related type definitions for the application.
 * This includes request/response types, parameters, and utility types for API operations.
 */

import { z } from 'zod';
// Importing but not using AxiosError, using it as a reference type in external code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AxiosError } from 'axios';
import { PaymentStatus, PaymentType } from './enum-types';

// ApiResponse is exported from base-types and re-exported from here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ApiResponse, ID } from './base-types';

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
  [key: string]: string | number | boolean | undefined;
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
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
 * Webhook Event
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
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

// Note: ApiRequestError has been moved to lib/errors/api-errors.ts
export type { ApiRequestError } from '@/lib/api-errors';

// Authentication related API types

/**
 * Token Response
 */
export interface TokenResponse {
  success: true;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: 'Bearer';
}

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
  source?: 'stripe' | 'prisma' | 'supabase';
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
      }),
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
  source: z.enum(['stripe', 'prisma', 'supabase']).optional(),
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
 * Webhook Event Schema
 */
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
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
 * API Endpoint Configuration
 */
export interface ApiEndpointConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth: boolean;
  responseSchema?: z.ZodType<unknown>;
  requestSchema?: z.ZodType<unknown>;
  mockResponse?: unknown;
}
