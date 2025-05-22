/**
 * Validation Types
 * 
 * This file defines TypeScript types derived from the Zod schemas in the validation-core.ts file.
 * This is the single source of truth for validation-related types across the application.
 */

import { z } from 'zod';
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  dateSchema as DateSchema, // Renamed import to avoid conflict
  urlSchema,
  idSchema,
  addressSchema,
  contactInfoSchema,
  paginationSchema,
  dateRangeSchema,
  searchSchema,
  uuidParamSchema,
  numericIdParamSchema,
  sortingSchema,
  paginatedResponseSchema,
  errorResponseSchema,
  successResponseSchema,
  apiResponseSchema
} from '@/lib/validations/validation-core';

// Re-export schemas
export {
  nameSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  DateSchema,
  urlSchema,
  idSchema,
  addressSchema,
  contactInfoSchema,
  paginationSchema,
  dateRangeSchema,
  searchSchema,
  uuidParamSchema,
  numericIdParamSchema,
  sortingSchema,
  paginatedResponseSchema,
  errorResponseSchema,
  successResponseSchema,
  apiResponseSchema
};

/**
 * Field option types
 */
export type FieldOptions = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  fieldName?: string;
};

export type ArrayFieldOptions = FieldOptions & {
  minLength?: number;
  maxLength?: number;
};

/**
 * Schema types using Zod inference
 */
export type NameSchema = z.infer<typeof nameSchema>;
export type EmailSchema = z.infer<typeof emailSchema>;
export type PhoneSchema = z.infer<typeof phoneSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
export type DateSchema = z.infer<typeof DateSchema>;
export type UrlSchema = z.infer<typeof urlSchema>;
export type IdSchema = z.infer<typeof idSchema>;

/**
 * Object schema types
 */
export type AddressParams = z.infer<typeof addressSchema>;
export type ContactInfoParams = z.infer<typeof contactInfoSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRangeParams = z.infer<typeof dateRangeSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type SortingParams = z.infer<typeof sortingSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type NumericIdParam = z.infer<typeof numericIdParamSchema>;

/**
 * Response types
 */
// Generic paginated response type
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Error response types
export type ErrorDetails = {
  path: string;
  message: string;
};

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;

// Generic API response type
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/**
 * Validation utility types
 */
export type ValidationResult<T> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { errors: Array<{ path: string; code: string; message: string }> } };

export type FormErrors = Record<string, string>;