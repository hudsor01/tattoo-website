/**
 * Booking Validation Schemas
 * 
 * This file provides consolidated validation schemas for booking functionality.
 * It includes both client-side and server-side validation schemas for bookings.
 */

import * as z from 'zod';
import { createField, createSchema, safeArray } from './validation-core';

/**
 * Core booking schema with common fields
 * Used by both client and server-side validation
 */
export const bookingCoreSchema = createSchema({
  // Client information
  name: createField.name(),
  email: createField.email(),
  phone: createField.phone(),
  
  // Tattoo details
  tattooIdea: createField.text({
    minLength: 10,
    maxLength: 2000,
    fieldName: 'Tattoo idea'
  }),
  placement: createField.text({
    minLength: 2,
    fieldName: 'Tattoo placement'
  }),
  
  // Size, style, and color preferences
  size: createField.text({ fieldName: 'Size' }),
  style: z.string().min(1, { message: 'Please select a tattoo style' }),
  color: z.enum(['color', 'black_and_grey', 'unsure']).default('unsure'),
  
  // Schedule preferences
  preferredDate: z.string().min(1, { message: 'Please provide preferred dates' }),
  preferredTime: z.string().optional(),
  
  // Additional information
  reference_images: createField.array(z.string(), { required: false }),
  additionalInfo: createField.text({
    maxLength: 1000,
    fieldName: 'Additional information',
    required: false
  }),
  
  // Special requests
  cover_up: z.boolean().default(false),
  cover_up_description: createField.text({
    maxLength: 1000,
    fieldName: 'Cover-up description',
    required: false
  }),
  
  // Terms and conditions
  agreeToTerms: createField.agreement('You must agree to the terms and conditions'),
});

/**
 * Extended booking schema for the client-side form
 * Includes additional fields specific to the booking form
 */
export const bookingFormSchema = bookingCoreSchema.extend({
  // Budget information
  budget: z.string().min(1, { message: 'Please provide a budget range' }),
  
  // Tattoo experience
  hasExistingTattoo: z.boolean().default(false),
  firstTattoo: z.boolean().default(false),
  
  // Recaptcha validation
  recaptchaToken: z.string().optional(),
});

/**
 * Type inference for booking form values
 */
export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/**
 * Default values for the booking form
 */
export const defaultBookingFormValues: Partial<BookingFormValues> = {
  name: '',
  email: '',
  phone: '',
  tattooIdea: '',
  placement: '',
  size: '',
  budget: '',
  preferredDate: '',
  preferredTime: '',
  hasExistingTattoo: false,
  firstTattoo: false,
  style: '',
  color: 'unsure',
  reference_images: [],
  additionalInfo: '',
  cover_up: false,
  cover_up_description: '',
  agreeToTerms: false,
};

/**
 * Simplified booking form for returning clients
 * Assumes client details are already known
 */
export const simplifiedBookingFormSchema = createSchema({
  tattooIdea: createField.text({
    minLength: 10,
    maxLength: 2000,
    fieldName: 'Tattoo idea'
  }),
  placement: createField.text({
    minLength: 2,
    fieldName: 'Tattoo placement'
  }),
  size: createField.text({ fieldName: 'Size' }),
  style: z.string().min(1, { message: 'Please select a tattoo style' }),
  color: z.enum(['color', 'black_and_grey', 'unsure']).default('unsure'),
  preferredDate: z.string().min(1, { message: 'Please provide preferred dates' }),
  preferredTime: z.string().optional(),
  budget: z.string().min(1, { message: 'Please provide a budget range' }),
  reference_images: createField.array(z.string(), { required: false }),
  additionalInfo: createField.text({
    maxLength: 1000,
    fieldName: 'Additional information',
    required: false
  }),
  cover_up: z.boolean().default(false),
  cover_up_description: createField.text({
    maxLength: 1000,
    fieldName: 'Cover-up description',
    required: false
  }),
});

/**
 * Type inference for simplified booking form
 */
export type SimplifiedBookingFormValues = z.infer<typeof simplifiedBookingFormSchema>;

/**
 * API booking schema
 * Used for validating requests to the booking API
 */
export const bookingApiSchema = bookingCoreSchema.extend({
  // Add API-specific fields
  clientId: z.string().uuid().optional(),
  paymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  source: z.string().optional(),
});

/**
 * Booking response schema
 * Defines the expected structure of a booking API response
 */
export const bookingResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  name: z.string(),
  email: z.string().email(),
  tattooDetails: z.object({
    idea: z.string(),
    placement: z.string(),
    size: z.string(),
    style: z.string(),
    color: z.string(),
  }),
  referenceImages: z.optional(safeArray(z.string())),
  preferredDate: z.string(),
  preferredTime: z.string().optional(),
  paymentStatus: z.enum(['none', 'deposit_paid', 'fully_paid']).optional(),
});

// Type inference for API schemas
export type BookingApiInput = z.infer<typeof bookingApiSchema>;
export type BookingResponse = z.infer<typeof bookingResponseSchema>;