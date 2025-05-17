/**
 * contact.ts
 *
 * Schema definitions for contact form and related types using Zod
 */

import { z } from 'zod';

/**
 * Schema for contact form validation
 */
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to our terms to continue',
  }),
});

/**
 * Type for the contact form values
 */
export type ContactFormValues = z.infer<typeof ContactFormSchema>;

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
 * Type for the contact form API response
 */
export type ContactFormResponse = z.infer<typeof ContactFormResponseSchema>;

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