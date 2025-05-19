/**
 * Common Validation Schemas
 * 
 * This file provides common validation schemas used across multiple validation modules.
 */

import * as z from 'zod';
import { safeArray } from './validation-core';

/**
 * Standard pagination schema for list endpoints
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Date range schema for filtered list endpoints
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Common ID schemas
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const intIdSchema = z.number().int().positive('ID must be a positive integer');

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  fields: z.optional(safeArray(z.string())),
});

/**
 * Sorting schema for list endpoints
 */
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Generic success response schema
 */
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
});

/**
 * Generic error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.record(z.unknown()).optional(),
});

// Type exports
export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRangeParams = z.infer<typeof dateRangeSchema>;
export type SortingParams = z.infer<typeof sortingSchema>;
export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
// Re-add missing exports
export const uuidParamSchema = uuidSchema;
export const searchSchema = paginationSchema;

// Email schema
export const emailSchema = z.string().email('Invalid email address');

// Phone schema
export const phoneSchema = z.string().regex(
  /^\+?[\d\s\-()]+$/,
  'Invalid phone number format'
);

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const contactInfoSchema = emailSchema.extend({
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
});

// Re-add missing exports
export const uuidParamSchema = uuidSchema;
export const searchSchema = paginationSchema;
export const contactInfoSchema = emailSchema.extend({
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
});
