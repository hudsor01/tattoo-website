import { z } from 'zod';
import type { ID } from './utility-types';

// ID schema
export const IDSchema = z.string().min(1, 'ID is required');

/**
 * Customer status options
 */
export const CustomerStatusSchema = z.enum([
  'active',
  'inactive',
  'lead',
  'returning',
  'vip',
  'new',
]);

/**
 * Customer source options (how they found the studio)
 */
export const CustomerSourceSchema = z.enum([
  'referral',
  'social_media',
  'website',
  'walk_in',
  'event',
  'other',
]);

/**
 * Notification preference options
 */
export const NotificationPreferenceSchema = z.enum(['email', 'sms', 'both', 'none']);

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
      (val) => {
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
 * Base customer schema shared between create/update operations
 */
export const CustomerBaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(5, 'Phone must be at least 5 characters').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  dateOfBirth: z.date().optional(),
  pronouns: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

/**
 * Schema for creating a new customer
 */
export const CustomerCreateSchema = CustomerBaseSchema.extend({
  source: CustomerSourceSchema.optional(),
  notes: z.string().optional(),
  notificationPreference: NotificationPreferenceSchema.optional().default('email'),
  allowsMarketing: z.boolean().optional().default(true),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

/**
 * Schema for updating an existing customer
 */
export const CustomerUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  dateOfBirth: z.date().optional(),
  status: CustomerStatusSchema.optional(),
  source: CustomerSourceSchema.optional(),
  notes: z.string().optional(),
  notificationPreference: NotificationPreferenceSchema.optional(),
  allowsMarketing: z.boolean().optional(),
  pronouns: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for a customer in the database
 */
export const CustomerSchema = CustomerBaseSchema.extend({
  id: IDSchema,
  userId: IDSchema.optional(),
  status: CustomerStatusSchema.default('active'),
  source: CustomerSourceSchema.optional(),
  notes: z.string().optional(),
  notificationPreference: NotificationPreferenceSchema.default('email'),
  allowsMarketing: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  lifetimeValue: z.number().default(0),
  numberOfAppointments: z.number().int().default(0),
  lastAppointmentDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for customer medical information
 */
export const CustomerMedicalInfoSchema = z.object({
  customerId: IDSchema,
  hasMedicalConditions: z.boolean().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  pregnancyStatus: z.boolean().optional(),
  bloodType: z.string().optional(),
  previousTattooIssues: z.string().optional(),
  skinConditions: z.string().optional(),
});

/**
 * Schema for customer consent form
 */
export const CustomerConsentFormSchema = z.object({
  customerId: IDSchema,
  consentDate: z.date(),
  consentVersion: z.string(),
  ipAddress: z.string().optional(),
  signature: z.string().optional(),
  acceptedTerms: z.boolean(),
  additionalNotes: z.string().optional(),
});

/**
 * Schema for customer list query parameters
 */
export const CustomerListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  status: CustomerStatusSchema.optional(),
  source: CustomerSourceSchema.optional(),
  searchTerm: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  hasAppointments: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for customer list response
 */
export const CustomerListResponseSchema = z.object({
  customers: z.array(CustomerSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

/**
 * Schema for customer search
 */
export const CustomerSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().int().positive().optional().default(10),
});

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
  status?: CustomerStatus | string;
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

/**
 * Schema for contact form validation
 */
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to our terms to continue',
  }),
});

/**
 * Schema for contact form API response
 */
export const ContactFormResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  id: z.string().optional(),
});

/**
 * Interface for contact message objects from the API
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Export type definitions derived from schemas
export type CustomerStatus = z.infer<typeof CustomerStatusSchema>;
export type CustomerSource = z.infer<typeof CustomerSourceSchema>;
export type CustomerBase = z.infer<typeof CustomerBaseSchema>;
export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerMedicalInfo = z.infer<typeof CustomerMedicalInfoSchema>;
export type CustomerConsentForm = z.infer<typeof CustomerConsentFormSchema>;
export type CustomerListParams = z.infer<typeof CustomerListParamsSchema>;
export type CustomerListResponse = z.infer<typeof CustomerListResponseSchema>;
export type CustomerSearch = z.infer<typeof CustomerSearchSchema>;
export type ContactFormValues = z.infer<typeof ContactFormSchema>;
export type ContactFormResponse = z.infer<typeof ContactFormResponseSchema>;

/**
 * Result type for customer search
 */
export interface CustomerSearchResult {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  createdAt: Date;
}

// Export form-specific types for React Hook Form
export type CustomerFormValues = CustomerCreateInput;
export type ClientUpdateFormValues = z.infer<typeof CustomerUpdateSchema>;
