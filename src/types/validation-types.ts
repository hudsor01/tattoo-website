/**
 * validation-types.ts
 *
 * Common validation schemas and types used across the application.
 * These are derived from Zod schemas for input validation.
 */

import { z } from 'zod';
import {
  loginFormSchema,
  registerFormSchema,
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  updatePasswordFormSchema
} from '@/lib/validations/auth';

// Authentication form types
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;

// Basic pagination schema for list endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRangeParams = z.infer<typeof dateRangeSchema>;

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: z.array(z.string()).optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;

// Common address schema
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).max(2),
  zipCode: z.string().min(5).max(10),
  country: z.string().default('US'),
});

export type AddressInput = z.infer<typeof addressSchema>;

// Contact information schema
export const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;

// ID parameter schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

export const numericIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export type NumericIdParam = z.infer<typeof numericIdParamSchema>;

// Generic ID parameter schema
export const idParamSchema = z.object({
  id: z.union([z.string(), z.coerce.number()]),
});

export type IdParam = z.infer<typeof idParamSchema>;

// Response schemas
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResponseType<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Standard response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

// Utility to help share types between frontend and backend
export type InferResponseType<T extends z.ZodType> = z.infer<
  ReturnType<typeof apiResponseSchema<T>>
>;