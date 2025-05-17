/**
 * client-types.ts
 *
 * Type definitions for client-related data, forms, and operations.
 * Clients and Customers represent the same concept in different contexts.
 */

import { z } from 'zod';
import { ID } from './base-types';

/**
 * Client form validation schema
 */
export const clientSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .max(50, { message: 'First name must be less than 50 characters' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name must be less than 50 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  phone: z
    .string()
    .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
      message: 'Please enter a valid phone number',
    })
    .optional(),
  dob: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true;
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18;
      },
      { message: 'Client must be at least 18 years old' }
    ),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(1000, { message: 'Notes must be less than 1000 characters' }).optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

/**
 * Client update form validation schema
 */
export const clientUpdateSchema = z.object({
  id: z.string().uuid({ message: 'Invalid client ID' }),
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .max(50, { message: 'First name must be less than 50 characters' })
    .optional(),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name must be less than 50 characters' })
    .optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z
    .string()
    .regex(/^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
      message: 'Please enter a valid phone number',
    })
    .optional(),
  dob: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true;
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18;
      },
      { message: 'Client must be at least 18 years old' }
    ),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(1000, { message: 'Notes must be less than 1000 characters' }).optional(),
});

export type ClientUpdateFormValues = z.infer<typeof clientUpdateSchema>;

/**
 * Client entity interface
 */
export interface Client {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  notes?: string;
  status?: 'active' | 'inactive' | 'lead' | 'new' | string;
  lastAppointment?: string;
  appointmentCount?: number;
  lifetimeValue?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Basic client info interface
 */
export interface ClientBasicInfo {
  id: ID;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Client with related appointments
 */
export interface ClientWithAppointments extends Client {
  appointments?: Array<{
    id: ID;
    date: string;
    serviceName: string;
    status: string;
    amount?: number;
    notes?: string;
  }>;
}

/**
 * Client search parameters
 */
export interface ClientSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Client list response
 */
export interface ClientListResponse {
  clients: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}