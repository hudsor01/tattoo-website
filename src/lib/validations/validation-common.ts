/**
 * Common Validation Schemas
 * 
 * Provides common validation schemas used across the application.
 * This module avoids duplication and centralizes frequently used validation schemas.
 */

import * as z from 'zod';
import { safeArray, addressSchema as baseAddressSchema, contactInfoSchema as baseContactInfoSchema } from './validation-core';

// Re-export common schemas from validation-core
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: safeArray(z.string()).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const numericIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

// Re-export from validation-core for consistency
export const addressSchema = baseAddressSchema;
export const contactInfoSchema = baseContactInfoSchema;

// Additional common schemas specific to this module
export const emailSchema = z.string().email('Invalid email format');

export const phoneSchema = z.string()
  .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
    message: 'Invalid phone number format',
  })
  .optional();

export const dateSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

export const stringIdSchema = z.string().min(1, 'ID is required');