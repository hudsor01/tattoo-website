/**
 * Authentication Validation Schemas
 * 
 * This file provides consolidated validation schemas for authentication.
 * It includes schemas for login, registration, password reset, etc.
 */

import { z } from 'zod';
import { createField, createSchema } from './validation-consolidated';

/**
 * Login form schema
 */
export const loginSchema = createSchema({
  email: createField.email(),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().default(false),
});

/**
 * Type inference for login form
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Default values for login form
 */
export const defaultLoginValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};

/**
 * Registration form schema
 */
export const registrationSchema = createSchema({
  name: createField.name(),
  email: createField.email(),
  password: createField.password(),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  phone: createField.phone({ required: false }),
  agreeToTerms: createField.agreement('You must agree to the terms and conditions'),
  marketingConsent: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Type inference for registration form
 */
export type RegistrationFormValues = z.infer<typeof registrationSchema>;

/**
 * Default values for registration form
 */
export const defaultRegistrationValues: Partial<RegistrationFormValues> = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeToTerms: false,
  marketingConsent: false,
};

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = createSchema({
  email: createField.email(),
});

/**
 * Type inference for forgot password form
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Password reset schema (when user has a reset token)
 */
export const resetPasswordSchema = createSchema({
  password: createField.password(),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  token: z.string().min(1, { message: 'Reset token is required' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Type inference for reset password form
 */
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Password change schema (for authenticated users)
 */
export const changePasswordSchema = createSchema({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: createField.password(),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Type inference for change password form
 */
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Profile update schema
 */
export const profileUpdateSchema = createSchema({
  name: createField.name(),
  email: createField.email(),
  phone: createField.phone({ required: false }),
  bio: createField.text({
    maxLength: 500,
    fieldName: 'Bio',
    required: false
  }),
  avatarUrl: z.string().url().optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }).optional(),
});

/**
 * Type inference for profile update form
 */
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;