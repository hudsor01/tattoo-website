/**
 * booking-types.ts
 *
 * Type definitions for the booking system.
 * Includes interfaces, type aliases, and Zod schemas for bookings and related operations.
 */

import { z } from 'zod';
import type { BaseEntity, DateString, ApiResponse, ID } from './base-types';
import { BookingSource } from './enum-types';
import { paginationSchema, dateRangeSchema } from './validation-types';

/**
 * Booking form schema for client-side validation
 */
export const BookingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  tattooType: z.string().min(1, "Tattoo type is required"),
  size: z.string().min(1, "Size is required"),
  placement: z.string().min(1, "Placement is required"),
  description: z.string().min(10, "Please provide a brief description of your tattoo idea"),
  preferredDate: z.date({
    required_error: "Please select a date",
  }),
  preferredTime: z.string().min(1, "Preferred time is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  artistId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Type for booking form data
 */
export type BookingFormData = z.infer<typeof BookingFormSchema>;

/**
 * Booking entity interface
 */
export interface Booking extends BaseEntity {
  clientId?: ID;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  tattooType: string;
  tattooSize: TattooSize | string;
  tattooStyle?: TattooStyle | string;
  placement: string;
  description: string;
  referenceImages?: string[];
  preferredDate?: DateString;
  preferredTime?: string;
  alternateDate?: DateString;
  alternateTime?: string;
  depositAmount?: number;
  depositPaid?: boolean;
  paymentStatus?: PaymentStatus | string;
  status: 'new' | 'reviewed' | 'scheduled' | 'rejected' | 'cancelled' | string;
  assignedArtist?: ID;
  source?: BookingSource | string;
  consultationDate?: DateString;
  appointmentCreated?: boolean;
  appointmentId?: ID;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  agreeToTerms?: boolean;
  paymentMethod?: string;
  paymentIntentId?: string;
}

/**
 * Booking creation request
 */
export interface BookingCreateRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  tattooType: string;
  tattooSize: TattooSize | string;
  tattooStyle?: TattooStyle | string;
  placement: string;
  description: string;
  referenceImages?: string[];
  preferredDate?: DateString;
  preferredTime?: string;
  alternateDate?: DateString;
  alternateTime?: string;
  depositAmount?: number;
  source?: BookingSource | string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Booking update request
 */
export interface BookingUpdateRequest {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  tattooType?: string;
  tattooSize?: TattooSize | string;
  tattooStyle?: TattooStyle | string;
  placement?: string;
  description?: string;
  referenceImages?: string[];
  preferredDate?: DateString;
  preferredTime?: string;
  alternateDate?: DateString;
  alternateTime?: string;
  depositAmount?: number;
  depositPaid?: boolean;
  paymentStatus?: PaymentStatus | string;
  status?: string;
  assignedArtist?: ID;
  source?: BookingSource | string;
  consultationDate?: DateString;
  appointmentCreated?: boolean;
  appointmentId?: ID;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

/**
 * Booking with expanded relations
 */
export interface BookingWithRelations extends Booking {
  client?: {
    id: ID;
    name: string;
    email: string;
    phone?: string;
  };
  artist?: {
    id: ID;
    name: string;
    email: string;
  };
  appointment?: {
    id: ID;
    startTime: DateString;
    endTime: DateString;
    status: string;
  };
  payments?: Array<{
    id: ID;
    amount: number;
    status: string;
    createdAt: DateString;
  }>;
}

/**
 * Booking statistics interface
 */
export interface BookingStats {
  total: number;
  new: number;
  reviewed: number;
  scheduled: number;
  rejected: number;
  cancelled: number;
  byArtist?: Record<ID, number>;
  byMonth?: Record<string, number>;
  bySource?: Record<string, number>;
  conversionRate?: number;
}

/**
 * Forms interfaces - previously in booking-types.ts
 */

/**
 * Form data type for the booking form
 */
export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  tattooType: string;
  size: string;
  placement: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  agreeToTerms: boolean;
  referenceImages?: string[];
  paymentMethod?: string;
  paymentIntentId?: string;
  depositPaid?: boolean;
}

/**
 * Infer types from the Zod schemas for consistency
 * These will be properly resolved when imported from the services
 */
export type BookingInputData = z.infer<typeof BookingSchema>;
export type DepositUpdateData = z.infer<typeof DepositUpdateSchema>;

/**
 * Stripe payment intent interface - moved from booking-types.ts
 */
export interface StripePaymentIntent {
  id: string;
  status: string;
  client_secret?: string;
  amount: number;
  currency: string;
  created: number;
  receipt_email?: string;
  metadata?: Record<string, string>;
}

/**
 * Base booking schema used by API
 */
export const bookingBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  tattooType: z.string().min(1, 'Tattoo type is required'),
  size: z.string().min(1, 'Size is required'),
  placement: z.string().min(1, 'Placement is required'),
  description: z.string().min(1, 'Description is required'),
  preferredDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
  referenceImages: z.array(z.string()).optional(),
  paymentMethod: z
    .enum(['cashapp', 'venmo', 'paypal', 'card', 'unspecified'])
    .optional()
    .default('unspecified'),
  paymentIntentId: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingBaseSchema>;

/**
 * Create booking request schema
 */
export const createBookingSchema = bookingBaseSchema;

/**
 * Update booking schema
 */
export const updateBookingSchema = z.object({
  bookingId: z.number().int().positive('Booking ID must be a positive integer'),
  depositPaid: z.boolean().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  paymentMethod: z.enum(['cashapp', 'venmo', 'paypal', 'card']).optional(),
  notes: z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

/**
 * Deposit update schema
 */
export const depositUpdateSchema = z.object({
  bookingId: z.number().int().positive('Booking ID must be a positive integer'),
  paymentMethod: z.enum(['cashapp', 'venmo', 'paypal', 'card']).optional(),
});

export type DepositUpdateInput = z.infer<typeof depositUpdateSchema>;

/**
 * Get booking query parameters schema
 */
export const getBookingQuerySchema = z.object({
  id: z.string().optional(),
  ...paginationSchema.shape,
  status: z.enum(['paid', 'pending', 'all']).optional().default('all'),
  startDate: dateRangeSchema.shape.startDate,
  endDate: dateRangeSchema.shape.endDate,
});

export type GetBookingQueryParams = z.infer<typeof getBookingQuerySchema>;

/**
 * Booking response schema
 */
export const bookingResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  tattooType: z.string(),
  size: z.string(),
  placement: z.string(),
  description: z.string(),
  preferredDate: z.date(),
  preferredTime: z.string(),
  depositPaid: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  payment: z
    .array(
      z.object({
        id: z.number(),
        amount: z.number(),
        paymentMethod: z.string(),
        status: z.string(),
        createdAt: z.date(),
      }),
    )
    .optional(),
});

export type BookingResponse = z.infer<typeof bookingResponseSchema>;

/**
 * Booking list response schema
 */
export const bookingListResponseSchema = z.object({
  bookings: z.array(bookingResponseSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

export type BookingListResponse = z.infer<typeof bookingListResponseSchema>;

/**
 * Email data for booking confirmations
 */
export interface BookingConfirmationEmailData {
  name: string;
  email: string;
  bookingId: number;
  tattooType: string;
  size: string;
  placement: string;
  preferredDate: string;
  preferredTime: string;
  depositPaid: boolean;
  depositConfirmed?: boolean;
  paymentMethod?: string;
  referenceImages?: string[];
}

/**
 * Booking response from the API
 */
export interface BookingApiResponse extends ApiResponse {
  bookingId?: number;
}

/**
 * Payment form props interface
 */
export interface PaymentFormProps {
  formData: BookingFormData;
  onSuccess: (paymentIntent: StripePaymentIntent) => void;
  onError: (error: Error) => void;
}

/**
 * Booking Schema Definitions
 *
 * This file provides the single source of truth for all booking-related types
 * using Zod schemas. All types related to bookings should be derived from
 * these schemas to ensure consistency across the application.
 */

/**
 * Booking status options
 */
export const BookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'new',
  'reviewed',
  'scheduled',
  'rejected',
]);

/**
 * Payment status options
 */
export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

/**
 * Valid payment methods
 */
export const PaymentMethodSchema = z.enum(['cashapp', 'venmo', 'paypal', 'card', 'unspecified']);

/**
 * Tattoo size options
 */
export const TattooSizeSchema = z.enum(['small', 'medium', 'large', 'extra_large', 'custom']);

/**
 * Tattoo style options
 */
export const TattooStyleSchema = z.enum([
  'black_and_grey',
  'traditional',
  'neo_traditional',
  'japanese',
  'realism',
  'watercolor',
  'tribal',
  'other',
]);

/**
 * Base booking schema shared between create/update operations
 */
export const BookingBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(5, 'Phone must be at least 5 characters').optional(),
  tattooType: z.string().min(1, 'Tattoo type is required'),
  size: z.string().min(1, 'Size is required'),
  placement: z.string().min(1, 'Placement is required'),
  description: z.string().min(1, 'Description is required'),
  preferredDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid preferred date format',
  }),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  alternateDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid alternate date format',
    })
    .optional(),
  alternateTime: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
});

/**
 * Schema for creating a new booking
 */
export const BookingCreateSchema = BookingBaseSchema.extend({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
  paymentMethod: PaymentMethodSchema.optional().default('unspecified'),
  paymentIntentId: z.string().optional(),
});

/**
 * Schema for updating an existing booking
 */
export const BookingUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  tattooType: z.string().optional(),
  size: z.string().optional(),
  placement: z.string().optional(),
  description: z.string().optional(),
  preferredDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid preferred date format',
    })
    .optional(),
  preferredTime: z.string().optional(),
  alternateDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid alternate date format',
    })
    .optional(),
  alternateTime: z.string().optional(),
  status: BookingStatusSchema.optional(),
  depositPaid: z.boolean().optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  assignedArtist: z.string().optional(),
  consultationDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid consultation date format',
    })
    .optional(),
  appointmentCreated: z.boolean().optional(),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  referenceImages: z.array(z.string()).optional(),
});

/**
 * Schema for a booking in the database
 */
export const BookingSchema = BookingBaseSchema.extend({
  id: z.string(),
  clientId: z.string().optional(),
  status: BookingStatusSchema.default('pending'),
  depositPaid: z.boolean().default(false),
  paymentStatus: PaymentStatusSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  assignedArtist: z.string().optional(),
  consultationDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid consultation date format',
    })
    .optional(),
  appointmentCreated: z.boolean().optional(),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for deposit update
 */
export const DepositUpdateSchema = z.object({
  bookingId: z.number(),
  paymentMethod: PaymentMethodSchema.optional(),
});

/**
 * Schema for payment related to booking
 */
export const BookingPaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  amount: z.number().positive(),
  paymentMethod: PaymentMethodSchema,
  status: PaymentStatusSchema,
  transactionId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for booking list query parameters
 */
export const BookingListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  status: BookingStatusSchema.optional(),
  depositPaid: z.boolean().optional(),
  startDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    })
    .optional(),
  endDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    })
    .optional(),
  searchTerm: z.string().optional(),
});

/**
 * Schema for booking list response
 */
export const BookingListResponseSchema = z.object({
  bookings: z.array(BookingSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

/**
 * Schema for booking confirmation email data
 */
export const BookingConfirmationEmailDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  bookingId: z.string(),
  tattooType: z.string(),
  size: z.string(),
  placement: z.string(),
  preferredDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid preferred date format',
  }),
  preferredTime: z.string(),
  depositPaid: z.boolean(),
  depositConfirmed: z.boolean().optional(),
  paymentMethod: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
});

/**
 * Schema for booking response
 */
export const BookingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  bookingId: z.string().optional(),
  error: z.string().optional(),
});

// Export type definitions derived from schemas
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type TattooSize = z.infer<typeof TattooSizeSchema>;
export type TattooStyle = z.infer<typeof TattooStyleSchema>;
export type BookingBase = z.infer<typeof BookingBaseSchema>;
export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;
export type BookingPayment = z.infer<typeof BookingPaymentSchema>;
export type BookingListParams = z.infer<typeof BookingListParamsSchema>;
export type BookingFormValues = BookingCreateInput;

/**
 * Form step interface for multi-step booking forms
 */
export interface FormStep<T> {
  title: string;
  fields: Array<keyof T>;
  validateFields: () => Promise<boolean>;
}
