/**
 * Client API validation schemas
 */

// Import Zod as a namespace to avoid tree-shaking issues
import * as z from 'zod';
import { safeArray } from './validation-core';
import {
  paginationSchema,
  // searchSchema is imported but not used directly in this file
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchSchema,
  contactInfoSchema,
  addressSchema,
  uuidParamSchema,
} from './validation-common';

/**
 * Base client schema
 */
export const clientBaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: contactInfoSchema.shape.email,
  phone: z
    .string()
    .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
      message: 'Invalid phone number format',
    })
    .optional(),
  birthDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid birth date format',
    })
    .refine(
      val => {
        if (!val) return true;
        const birthDate = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - birthDate.getFullYear();
        return age >= 18;
      },
      {
        message: 'Client must be at least 18 years old',
      }
    )
    .optional(),
  address: addressSchema.optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  instagram: z.string().max(50).optional(),
  referralSource: z.string().max(100).optional(),
  tags: z.optional(safeArray(z.string())),
});

export type ClientInput = z.infer<typeof clientBaseSchema>;

/**
 * Create client schema
 */
export const createClientSchema = clientBaseSchema;

export type CreateClientInput = z.infer<typeof createClientSchema>;

/**
 * Update client schema
 */
export const updateClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  email: contactInfoSchema.shape.email.optional(),
  phone: z
    .string()
    .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
      message: 'Invalid phone number format',
    })
    .optional(),
  birthDate: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid birth date format',
    })
    .refine(
      val => {
        if (!val) return true;
        const birthDate = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - birthDate.getFullYear();
        return age >= 18;
      },
      {
        message: 'Client must be at least 18 years old',
      }
    )
    .optional(),
  address: addressSchema.optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  instagram: z.string().max(50).optional(),
  referralSource: z.string().max(100).optional(),
  tags: z.optional(safeArray(z.string())),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

/**
 * Get client query parameters schema
 */
export const getClientQuerySchema = z.object({
  ...paginationSchema.shape,
  search: z.string().optional(),
  tag: z.string().optional(),
  hasAppointment: z.boolean().optional(),
  hasPendingAppointment: z.boolean().optional(),
});

export type GetClientQueryParams = z.infer<typeof getClientQuerySchema>;

/**
 * Client ID param schema (used in route handlers)
 */
export const clientIdParamSchema = uuidParamSchema;

/**
 * Client response schema
 */
export const clientResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  birthDate: z.date().optional().nullable(),
  address: addressSchema.optional().nullable(),
  notes: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  referralSource: z.string().optional().nullable(),
  tags: z.optional(safeArray(z.string())),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid().optional().nullable(),
  appointments: z.optional(
    safeArray(
      z.object({
        id: z.string().uuid(),
        serviceType: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        status: z.string(),
      })
    )
  ),
  payments: z.optional(
    safeArray(
      z.object({
        id: z.string().uuid(),
        amount: z.number(),
        status: z.string(),
        createdAt: z.date(),
      })
    )
  ),
});

export type ClientResponse = z.infer<typeof clientResponseSchema>;

/**
 * Client list response schema
 */
export const clientListResponseSchema = z.object({
  clients: safeArray(clientResponseSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

export type ClientListResponse = z.infer<typeof clientListResponseSchema>;