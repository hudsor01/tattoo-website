// Removed duplicate exports and types

/**
 * forms-types.ts
 *
 * Forms type definitions extracted from components
 */

import { type ReactNode } from 'react';
import { type UIElementProps } from './component-types';
import type { ThemeColor } from './enum-types';
import type { FieldValues, FieldPath } from 'react-hook-form';
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                               Form Field Types                             */
/* -------------------------------------------------------------------------- */

/**
 * Base interface for all form fields.
 */
export interface FormField extends UIElementProps {
  name: string;
  label?: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: Size;
  placeholder?: string;
}

/* ----------------------------- Field Variants ----------------------------- */

/**
 * Text input field.
 */
export interface TextFieldProps extends FormField {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search';
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  minLength?: number;
  maxLength?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Select field.
 */
export interface SelectFieldProps extends FormField {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  native?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * Checkbox field.
 */
export interface CheckboxFieldProps extends FormField {
  checked?: boolean;
  indeterminate?: boolean;
  color?: ThemeColor;
}

/**
 * Radio field.
 */
export interface RadioFieldProps extends FormField {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  row?: boolean;
  color?: ThemeColor;
}

/**
 * Switch field.
 */
export interface SwitchFieldProps extends FormField {
  checked?: boolean;
  color?: ThemeColor;
}

/**
 * Date picker field.
 */
export interface DatePickerFieldProps extends FormField {
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  views?: Array<'year' | 'month' | 'day'>;
  openTo?: 'year' | 'month' | 'day';
  disablePast?: boolean;
  disableFuture?: boolean;
  allowSameDay?: boolean;
  showTodayButton?: boolean;
  todayButtonText?: string;
  clearable?: boolean;
  clearText?: string;
}

/**
 * Time picker field.
 */
export interface TimePickerFieldProps extends FormField {
  minTime?: Date;
  maxTime?: Date;
  format?: string;
  views?: Array<'hours' | 'minutes' | 'seconds'>;
  ampm?: boolean;
  minutesStep?: number;
  clearable?: boolean;
  clearText?: string;
}

/**
 * File upload field.
 */
export interface FileUploadFieldProps extends FormField {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  preview?: boolean;
  previewSize?: number;
  dropzoneText?: string;
  buttonText?: string;
  onDrop?: (files: File[]) => void;
  onDelete?: (file: File | string) => void;
}

/* -------------------------------------------------------------------------- */
/*                               Form Structure                               */
/* -------------------------------------------------------------------------- */

/**
 * Form section.
 */
export interface FormSectionProps extends UIElementProps {
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
}

/**
 * Form layout types.
 */
export type FormLayout = 'vertical' | 'horizontal' | 'inline';

/* -------------------------------------------------------------------------- */
/*                             Validation & Results                           */
/* -------------------------------------------------------------------------- */

/**
 * Form validation error.
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Form submission result.
 */
export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  data?: unknown;
}

/* -------------------------------------------------------------------------- */
/*                        Dynamic Form Configuration Types                    */
/* -------------------------------------------------------------------------- */

/**
 * Form field config for dynamic forms.
 */
export interface FormFieldConfig {
  name: string;
  label?: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'date'
    | 'time'
    | 'datetime'
    | 'file'
    | 'textarea';
  defaultValue?: unknown;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  fullWidth?: boolean;
  size?: Size;
  validation?: {
    type?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean | string;
  };
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  props?: Record<string, unknown>;
  dependsOn?: {
    field: string;
    value: unknown;
    operator?: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
  };
}

/**
 * Dynamic form configuration.
 */
export interface DynamicFormConfig {
  id: string;
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  layout?: FormLayout;
  sections?: Array<{
    title?: string;
    description?: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }>;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  showCancel?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Context & Form Data                            */
/* -------------------------------------------------------------------------- */

// These types are referenced from other files (form.tsx, ModernBookingForm.tsx, contact-form.tsx)
// and are included here for completeness.

export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

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
};

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactId?: number; // Optional ID if available from database
};

/**
 * Form Type Definitions
 *
 * This file serves as the unified source of truth for all form-related types.
 * It consolidates and re-exports form-related types from other schema files
 * and provides additional form-specific types that are used throughout the application.
 */

// Import form-related types from other schema files
import { ContactFormSchema, ContactFormResponseSchema } from './contact';

import type { ContactFormValues } from './contact';

import {
  BookingBaseSchema,
  BookingCreateSchema,
  BookingUpdateSchema,
  DepositUpdateSchema,
  BookingListParamsSchema,
} from './booking-types';

import type { BookingFormValues, DepositUpdateInput, BookingListParams } from './booking-types';
import type { ContactFormResponse } from './contact';

import {
  LoginCredentialsSchema,
  PasswordResetRequestSchema,
  PasswordResetSchema,
  ChangePasswordSchema,
} from './auth-types';

import type {
  LoginFormValues,
  RegisterFormValues,
  PasswordResetFormValues,
  ChangePasswordFormValues,
} from './auth-types';

// Re-export form types
export type {
  ContactFormSchema,
  ContactFormValues,
  ContactFormResponseSchema,
  ContactFormResponse,
  BookingBaseSchema,
  BookingCreateSchema,
  BookingUpdateSchema,
  BookingFormValues,
  DepositUpdateSchema,
  DepositUpdateInput,
  BookingListParamsSchema,
  BookingListParams,
  LoginCredentialsSchema,
  PasswordResetRequestSchema,
  PasswordResetSchema,
  ChangePasswordSchema,
  LoginFormValues,
  RegisterFormValues,
  PasswordResetFormValues,
  ChangePasswordFormValues,
};

/**
 * Lead Magnet Form Schema
 */
export const LeadMagnetFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive marketing emails',
  }),
  leadType: z.string().optional(),
});

/**
 * Newsletter Subscription Schema
 */
export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive marketing emails',
  }),
});

/**
 * Form Field Base Schema
 */
export const FormFieldBaseSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  defaultValue: z.unknown().optional(),
  hidden: z.boolean().optional(),
});

/**
 * Text Field Schema
 */
export const TextFieldSchema = FormFieldBaseSchema.extend({
  type: z.enum(['text', 'email', 'password', 'tel', 'url', 'number', 'search']),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  autoComplete: z.string().optional(),
  autoFocus: z.boolean().optional(),
  multiline: z.boolean().optional(),
  rows: z.number().optional(),
});

/**
 * Select Field Schema
 */
export const SelectFieldSchema = FormFieldBaseSchema.extend({
  options: z.array(
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
      disabled: z.boolean().optional(),
    }),
  ),
  multiple: z.boolean().optional(),
  clearable: z.boolean().optional(),
  searchable: z.boolean().optional(),
});

/**
 * Checkbox Field Schema
 */
export const CheckboxFieldSchema = FormFieldBaseSchema.extend({
  checked: z.boolean().optional(),
});

/**
 * Radio Field Schema
 */
export const RadioFieldSchema = FormFieldBaseSchema.extend({
  options: z.array(
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
      disabled: z.boolean().optional(),
    }),
  ),
  row: z.boolean().optional(),
});

/**
 * Switch Field Schema
 */
export const SwitchFieldSchema = FormFieldBaseSchema.extend({
  checked: z.boolean().optional(),
});

/**
 * Date Picker Field Schema
 */
export const DatePickerFieldSchema = FormFieldBaseSchema.extend({
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
  format: z.string().optional(),
  disablePast: z.boolean().optional(),
  disableFuture: z.boolean().optional(),
});

/**
 * File Upload Field Schema
 */
export const FileUploadFieldSchema = FormFieldBaseSchema.extend({
  multiple: z.boolean().optional(),
  accept: z.string().optional(),
  maxFiles: z.number().optional(),
  maxSize: z.number().optional(),
  preview: z.boolean().optional(),
});

/**
 * Form Schema
 */
export const FormSchema = z.object({
  id: z.string(),
  fields: z.array(
    z.union([
      TextFieldSchema,
      SelectFieldSchema,
      CheckboxFieldSchema,
      RadioFieldSchema,
      SwitchFieldSchema,
      DatePickerFieldSchema,
      FileUploadFieldSchema,
    ]),
  ),
  layout: z.enum(['vertical', 'horizontal', 'inline']).optional(),
  submitLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  resetLabel: z.string().optional(),
  showReset: z.boolean().optional(),
  showCancel: z.boolean().optional(),
});

/**
 * Form Submission Result Schema
 */
export const FormSubmissionResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  errors: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
  data: z.unknown().optional(),
});

/**
 * Dynamic Field Config Schema
 */
export const FormFieldConfigSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: z.enum([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'select',
    'multiselect',
    'checkbox',
    'radio',
    'switch',
    'date',
    'time',
    'datetime',
    'file',
    'textarea',
  ]),
  defaultValue: z.unknown().optional(),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  hidden: z.boolean().optional(),
  validation: z
    .object({
      type: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  options: z
    .array(
      z.object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
        disabled: z.boolean().optional(),
      }),
    )
    .optional(),
});

// Derive types from schemas
export type LeadMagnetFormValues = z.infer<typeof LeadMagnetFormSchema>;
export type NewsletterSubscription = z.infer<typeof NewsletterSubscriptionSchema>;
export type FormFieldBase = z.infer<typeof FormFieldBaseSchema>;
export type TextField = z.infer<typeof TextFieldSchema>;
export type SelectField = z.infer<typeof SelectFieldSchema>;
export type CheckboxField = z.infer<typeof CheckboxFieldSchema>;
export type RadioField = z.infer<typeof RadioFieldSchema>;
export type SwitchField = z.infer<typeof SwitchFieldSchema>;
export type DatePickerField = z.infer<typeof DatePickerFieldSchema>;
export type FileUploadField = z.infer<typeof FileUploadFieldSchema>;
export type Form = z.infer<typeof FormSchema>;

/**
 * Form Layout Type
 */
export type Size = 'small' | 'medium' | 'large';
