/**
 * API Validation Module
 * 
 * This module exports validation schemas and utilities for API routes.
 * It includes common validation schemas, API route builders, and error handling utilities.
 */

// Import Zod as a namespace to avoid tree-shaking issues in Edge runtime
import * as z from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { formatZodErrors } from './validation-core';

// Re-export utilities from validation-api-utils
export { apiRoute, handleApiError, parseBody, parseQuery, parseParams } from './validation-api-utils';

// Core pagination schema for list endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Date range schema for filtered list endpoints
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Payment Validation Schemas
export { 
  createPaymentIntentSchema, 
  clientPaymentIntentSchema,
  paymentStatusCheckSchema,
  paymentStatusResponseSchema,
  paymentIntentResponseSchema
} from './validation-payment';

// Booking Validation Schemas
export { 
  createBookingSchema,
  depositUpdateSchema,
  getBookingQuerySchema
} from './validation-booking-api';

// Lead Magnet Validation Schemas
export const leadMagnetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7).max(20).optional(),
  magnet: z.string().min(1, "Lead magnet ID is required"),
  sourceInfo: z.object({
    source: z.string().optional(),
    campaign: z.string().optional(),
    medium: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
    referrer: z.string().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
});

export const leadMagnetResponseSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  downloadUrl: z.string().url().optional(),
  message: z.string(),
});

// Import the safe array helper
import { safeArray } from './validation-core';

export const trackingSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  event: z.enum([
    'view', 
    'click', 
    'download_started', 
    'download_completed', 
    'email_opened',
    'email_clicked',
    'form_submitted'
  ]),
  // Use a safer approach for record validation in production
  data: z.preprocess(
    (val) => typeof val === 'object' && val !== null ? val : {},
    z.any()
  ),
});

/**
 * Shared utility function to handle API errors consistently
 */
export function handleApiValidationError(error: unknown): NextResponse {
  console.error('API validation error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: formatZodErrors(error) },
      { status: 400 }
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}

/**
 * Common response types for API endpoints
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  // Use safer validation for data
  data: z.preprocess(
    (val) => typeof val === 'object' && val !== null ? val : {},
    z.any()
  ),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  // Use safer validation for details
  details: z.preprocess(
    (val) => typeof val === 'object' && val !== null ? val : {},
    z.any()
  ),
});

// Type exports for response schemas
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;