/**
 * Customer/Client Schema Definitions
 *
 * This file provides the single source of truth for all customer-related types
 * using Zod schemas. All types related to customers should be derived from
 * these schemas to ensure consistency across the application.
 */

import { z } from 'zod';
export const IDSchema = z.string().min(1, 'ID is required');

/**
 * Customer status options
 */
export const CustomerStatusSchema = z.enum(['active', 'inactive', 'lead', 'returning', 'vip']);

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
  agreeToTerms: z.boolean().refine(val => val === true, {
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

// Export form-specific types for React Hook Form
export type CustomerFormValues = CustomerCreateInput;
