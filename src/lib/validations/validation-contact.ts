/**
 * Contact Validation Schemas
 * 
 * This file provides consolidated validation schemas for contact functionality.
 * It includes both client-side and server-side validation schemas for contact forms.
 */

import * as z from 'zod';
import { createField, createSchema, safeArray } from './validation-core';

/**
 * Core contact schema with common fields
 * Used by both client and server-side validation
 */
export const contactCoreSchema = createSchema({
  // Contact information
  name: createField.name(),
  email: createField.email(),
  phone: createField.phone({ required: false }),
  
  // Message details
  message: createField.text({
    minLength: 10,
    maxLength: 1000,
    fieldName: 'Message'
  }),
  
  // Optional fields
  subject: createField.text({
    minLength: 2, 
    maxLength: 100,
    fieldName: 'Subject',
    required: false
  }),
  
  // Additional details
  service: z.string().optional(),
  referralSource: z.string().optional(),
  preferredTime: z.string().optional(),
  
  // Terms and conditions
  agreeToTerms: createField.agreement('You must agree to the terms and conditions'),
});

/**
 * Extended contact schema for the client-side form
 * Includes additional fields specific to the contact form
 */
export const contactFormSchema = contactCoreSchema.extend({
  // Budget information
  budget: z.enum(['$100-$300', '$300-$500', '$500-$1000', '$1000+', 'Not sure']).optional(),
  
  // Reference materials
  hasReference: z.boolean().default(false),
  referenceImages: safeArray(z.string()).optional(),
  
  // Recaptcha validation
  recaptchaToken: z.string().optional(),
});

/**
 * Type inference for contact form values
 */
export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Default values for the contact form
 */
export const defaultContactFormValues: Partial<ContactFormValues> = {
  name: '',
  email: '',
  phone: '',
  message: '',
  subject: 'Tattoo Inquiry',
  service: '',
  referralSource: '',
  preferredTime: '',
  budget: undefined,
  hasReference: false,
  referenceImages: [],
  agreeToTerms: false,
};

/**
 * Lead magnet form schema
 * Used for lead generation forms
 */
export const leadMagnetFormSchema = createSchema({
  name: createField.name(),
  email: createField.email(),
  phone: createField.phone({ required: false }),
  magnet: z.string({ required_error: 'Please select a lead magnet' }),
  agreeToTerms: createField.agreement('You must agree to the terms and conditions'),
  recaptchaToken: z.string().optional(),
});

/**
 * Type inference for lead magnet form
 */
export type LeadMagnetFormValues = z.infer<typeof leadMagnetFormSchema>;

/**
 * Default values for lead magnet form
 */
export const defaultLeadMagnetFormValues: Partial<LeadMagnetFormValues> = {
  name: '',
  email: '',
  phone: '',
  magnet: '',
  agreeToTerms: false,
};

/**
 * API contact schema
 * Used for validating requests to the contact API
 */
export const contactApiSchema = contactCoreSchema.extend({
  // Add API-specific fields
  source: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

/**
 * Contact response schema
 * Defines the expected structure of a contact API response
 */
export const contactResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  status: z.enum(['new', 'read', 'responded', 'archived']),
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  subject: z.string().optional(),
});

/**
 * Contact form response schema
 * Simple success/error response for form submissions
 */
export const contactFormResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  id: z.string().uuid().optional(),
});

// Type inference for API schemas
export type ContactApiInput = z.infer<typeof contactApiSchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;
export type ContactFormResponse = z.infer<typeof contactFormResponseSchema>;