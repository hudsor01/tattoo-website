/**
 * Booking API Validation Schemas
 * 
 * This file provides schemas specifically for booking API endpoints.
 * Extends the core booking schemas with API-specific validation.
 */

import * as z from 'zod';
import { safeArray } from './validation-core';
import { bookingCoreSchema } from './validation-booking';

/**
 * Schema for creating a booking via API
 */
export const createBookingSchema = bookingCoreSchema.extend({
  // Add API-specific fields
  clientId: z.string().uuid().optional(),
  paymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  source: z.string().optional(),
  depositAmount: z.number().optional(),
});

/**
 * Schema for updating deposit status
 */
export const depositUpdateSchema = z.object({
  bookingId: z.number().int().positive('Booking ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['pending', 'completed', 'failed']).default('completed'),
});

/**
 * Query parameters for getting bookings
 */
export const getBookingQuerySchema = z.object({
  id: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['pending', 'paid', 'confirmed', 'cancelled', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
});

/**
 * Schema for booking responses in API
 */
export const bookingResponseSchema = z.object({
  id: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  tattooIdea: z.string(),
  placement: z.string(),
  size: z.string(),
  style: z.string(),
  color: z.string(),
  preferredDate: z.string(),
  preferredTime: z.string().optional(),
  referenceImages: z.optional(safeArray(z.string())),
  depositPaid: z.boolean().default(false),
  paymentIntentId: z.string().optional(),
  clientId: z.string().optional(),
  appointmentId: z.string().optional(),
});

/**
 * Schema for booking list responses
 */
export const bookingListResponseSchema = z.object({
  items: safeArray(bookingResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// Type exports
export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
export type DepositUpdateRequest = z.infer<typeof depositUpdateSchema>;
export type GetBookingQuery = z.infer<typeof getBookingQuerySchema>;
export type BookingResponse = z.infer<typeof bookingResponseSchema>;
export type BookingListResponse = z.infer<typeof bookingListResponseSchema>;