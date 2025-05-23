/**
 * Validation Types
 * 
 * This file defines TypeScript types derived from the consolidated validation schemas.
 * This is the single source of truth for validation-related types across the application.
 */

import { z } from 'zod';
import { contactFormSchema } from '@/lib/validations';

// ========================================
// EXPORTED VALIDATION TYPES
// ========================================

/**
 * Contact form validation types
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Common pagination schema for reuse
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationData = z.infer<typeof paginationSchema>;

/**
 * Date range schema for filtering
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRangeData = z.infer<typeof dateRangeSchema>;

/**
 * Basic ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type IdParam = z.infer<typeof idParamSchema>;