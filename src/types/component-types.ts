/**
 * Comprehensive consolidated UI component, form, and theme type definitions for the application.
 * This file contains all types related to UI components, forms, themes, and UI utilities.
 */

import type { ReactNode, ButtonHTMLAttributes, ComponentType, HTMLAttributes } from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';

// Export ButtonProps type
export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    href?: string;
    children?: React.ReactNode;
    isActive?: boolean;
  };
import type { FieldValues, FieldPath, UseFormReturn } from 'react-hook-form';
import type { ThemeColor } from './enum-types';
import { z } from 'zod';
import type { Target, TargetAndTransition } from 'framer-motion';

// Removed react-window import - package not installed

/**
 * ========================================================================
 * BASE COMPONENT TYPES
 * ========================================================================
 */

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface UIElementProps extends BaseComponentProps {
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * ========================================================================
 * EXTERNAL COMPONENT TYPE DECLARATIONS
 * ========================================================================
 */

/**
 * React Window Infinite Loader Type Declarations
 */

export interface InfiniteLoaderProps {
  isItemLoaded: (index: number) => boolean;
  itemCount: number;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void> | void;
  threshold?: number;
  minimumBatchSize?: number;
  children: (props: {
    onItemsRendered: (params: {
      visibleStartIndex: number;
      visibleStopIndex: number;
      overscanStartIndex: number;
      overscanStopIndex: number;
    }) => void;
    ref: React.RefObject<unknown>; // FixedSizeList type not available
  }) => ReactNode;
}

/**
 * Framer Motion Type Declarations
 */

// Simple variant with just target properties
export interface SimpleVariant {
  [key: string]: Target | TargetAndTransition;
}

// Variant with transition properties
export interface TransitionVariant {
  [key: string]: TargetAndTransition;
}

// Variant with custom props (like index-based variants)
export interface CustomVariant<P> {
  [key: string]: (props: P) => TargetAndTransition;
}

// Custom variant that accepts a number index
export interface IndexVariant {
  [key: string]: Target | ((i: number) => TargetAndTransition);
}

/**
 * ========================================================================
 * ICON TYPES
 * ========================================================================
 */

export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  href?: string;
  onClick?: () => void;
  isLinked?: boolean;
}

// Type for Lucide React icons
interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

export type LucideIcon = ComponentType<LucideIconProps>;

/**
 * ========================================================================
 * BUTTON & LINK TYPES
 * ========================================================================
 */

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  srOnly?: string;
  ariaLabel?: string;
}

export interface EmailLinkProps {
  email: string;
  subject?: string;
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
}

/**
 * ========================================================================
 * FORM TYPES
 * ========================================================================
 */

export type Size = 'small' | 'medium' | 'large';

// Base form field interface
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

// Form field variants
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

export interface CheckboxFieldProps extends FormField {
  checked?: boolean;
  indeterminate?: boolean;
  color?: ThemeColor;
}

// CTA Section Props
export interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  showLogo?: boolean;
  customClassName?: string;
}

export interface RadioFieldProps extends FormField {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  row?: boolean;
  color?: ThemeColor;
}

export interface SwitchFieldProps extends FormField {
  checked?: boolean;
  color?: ThemeColor;
}

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

// Form structure types
export interface FormSectionProps extends UIElementProps {
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export type FormLayout = 'vertical' | 'horizontal' | 'inline';

// React Hook Form context types
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

export interface FormProviderProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  children: ReactNode;
}

// Form validation and submission
export interface ValidationError {
  path: string;
  message: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  data?: unknown;
}

// Dynamic form configuration
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

/**
 * ========================================================================
 * FORM DATA TYPES
 * ========================================================================
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

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactId?: number;
}

/**
 * ========================================================================
 * THEME TYPES
 * ========================================================================
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Core brand colors
  black: string;
  white: string;
  red: string;
  blue: string;

  // Variations
  blackLight: string;
  blackDark: string;
  redLight: string;
  redDark: string;
  blueLight: string;
  blueDark: string;

  // UI state colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  cardBorder: string;
  muted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  shadow: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  config: ThemeConfig;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

/**
 * ========================================================================
 * TOAST & NOTIFICATION TYPES
 * ========================================================================
 */

export type ToastVariant = 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'open'>) => string;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  removeToast: (id: string) => void;
}

/**
 * ========================================================================
 * LAYOUT & CONTAINER TYPES
 * ========================================================================
 */

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export interface PageHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: ReactNode;
}

export interface SidebarProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: 'left' | 'right';
  variant?: 'default' | 'floating' | 'inset';
}

/**
 * ========================================================================
 * FORM SCHEMAS (Zod)
 * ========================================================================
 */

// Form field base schema
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

// Field schemas
export const TextFieldSchema = FormFieldBaseSchema.extend({
  type: z.enum(['text', 'email', 'password', 'tel', 'url', 'number', 'search']),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  autoComplete: z.string().optional(),
  autoFocus: z.boolean().optional(),
  multiline: z.boolean().optional(),
  rows: z.number().optional(),
});

export const SelectFieldSchema = FormFieldBaseSchema.extend({
  options: z.array(
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
      disabled: z.boolean().optional(),
    })
  ),
  multiple: z.boolean().optional(),
  clearable: z.boolean().optional(),
  searchable: z.boolean().optional(),
});

export const CheckboxFieldSchema = FormFieldBaseSchema.extend({
  checked: z.boolean().optional(),
});

export const DatePickerFieldSchema = FormFieldBaseSchema.extend({
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
  format: z.string().optional(),
  disablePast: z.boolean().optional(),
  disableFuture: z.boolean().optional(),
});

export const FileUploadFieldSchema = FormFieldBaseSchema.extend({
  multiple: z.boolean().optional(),
  accept: z.string().optional(),
  maxFiles: z.number().optional(),
  maxSize: z.number().optional(),
  preview: z.boolean().optional(),
});

// Lead magnet form schema
export const LeadMagnetFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to receive marketing emails',
  }),
  leadType: z.string().optional(),
});

// Newsletter subscription schema
export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to receive marketing emails',
  }),
});

// Form submission result schema
export const FormSubmissionResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  errors: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
  data: z.unknown().optional(),
});

/**
 * ========================================================================
 * UTILITY & CONSTANT EXPORTS
 * ========================================================================
 */

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check the form for errors and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  DATA_FETCH_ERROR: 'Failed to fetch data. Please try again.',
  DATA_SUBMIT_ERROR: 'Failed to submit data. Please try again.',
  REQUIRED_FIELD: 'Please fill in all required fields.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SAVED: 'Saved successfully.',
  SUBMITTED: 'Submitted successfully.',
  UPLOADED: 'Uploaded successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
  APPOINTMENT_BOOKED: 'Appointment booked successfully.',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
  PAYMENT_SUCCESSFUL: 'Payment successful.',
};

// Toast durations
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 100000,
};

// Re-exports from react-hook-form
export type { FieldPath, FieldValues, ControllerProps, UseFormReturn } from 'react-hook-form';

// Import needed types
import type { ID } from './utility-types';

// Type derivations from schemas
export type LeadMagnetFormValues = z.infer<typeof LeadMagnetFormSchema>;
export type NewsletterSubscription = z.infer<typeof NewsletterSubscriptionSchema>;
// File/Media types
export interface FileData {
  id?: ID;
  name?: string;
  url?: string;
  path?: string;
  size?: number;
  type?: string;
  rawFile?: File;
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Common form submission states
export interface FormState {
  isSubmitting: boolean;
  isError: boolean;
  isSuccess: boolean;
  message?: string;
}

export type FormFieldBase = z.infer<typeof FormFieldBaseSchema>;
export type TextField = z.infer<typeof TextFieldSchema>;
export type SelectField = z.infer<typeof SelectFieldSchema>;
export type CheckboxField = z.infer<typeof CheckboxFieldSchema>;
export type DatePickerField = z.infer<typeof DatePickerFieldSchema>;
export type FileUploadField = z.infer<typeof FileUploadFieldSchema>;

// Service type for the ServiceCard component
export interface Service {
  features: string[];
  id: string;
  title: string;
  description: string;
  shortDescription: string; // Add this new property
  process: string[];
  detailedProcess: {
    title: string;
    description: string;
  }[];
  image: string;
  icon: LucideIcon;
  color: string;
  featured?: boolean; // Optional boolean property to indicate if a service is featured
}

/**
 * ========================================================================
 * ADMIN DASHBOARD COMPONENT TYPES
 * ========================================================================
 */

export interface Column<T = Record<string, unknown>> {
  header: string;
  accessorKey?: keyof T;
  renderCell?: (row: T) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface ActionColumn<T = Record<string, unknown>> {
  header: string;
  renderCell?: (row: T) => React.ReactNode;
  onView?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  width?: number;
  renderCustomActions?: (id: string | number) => React.ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> {
  rows: T[];
  loading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onRefreshClick?: () => void;
  onAddClick?: () => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  columnsConfig?: Column<T>[];
  pagination?: PaginationState;
  actionColumn?: ActionColumn<T>;
  title?: string;
  searchPlaceholder?: string;
  customToolbarActions?: React.ReactNode;
  columns?: Column<T>[];
}

export interface VirtualizedBookingsListProps {
  defaultStatus?: string | null;
  containerHeight?: number;
}

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export interface StatusBadgeProps extends UIElementProps {
  status: StatusType;
  text: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Cal.com specific component types
 */
export interface CalCustomInput {
  label: string;
  value: string;
}

/**
 * ========================================================================
 * GALLERY COMPONENT TYPES
 * ========================================================================
 */

export type SharePlatform =
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'pinterest'
  | 'email'
  | 'linkedin';

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'tattoo' | 'video';
  contentId: number;
  title: string;
}

export interface ShareMetadata {
  title: string;
  description: string;
  url: string;
  image: string;
}

export interface ShareButton {
  name: SharePlatform;
  icon: React.ElementType;
  color: string;
}

/**
 * ========================================================================
 * FAQ COMPONENT TYPES
 * ========================================================================
 */

export interface FAQItemType {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  items: FAQItemType[];
}

export interface FAQSearchProps {
  categories: FAQCategory[];
}

export interface FAQAccordionProps {
  items: FAQItemType[];
}

export interface AllFAQItem {
  category: string;
  id: string;
  item: FAQItemType;
}

/**
 * ========================================================================
 * SERVICE COMPONENT TYPES
 * ========================================================================
 */

export interface ServiceCardProps {
  service: Service;
  index: number;
}

export interface ServicesHeaderProps {
  title?: string;
  description?: string;
}

/**
 * ========================================================================
 * LAYOUT COMPONENT TYPES
 * ========================================================================
 */

export interface SharedLayoutProps {
  children: React.ReactNode;
}

export interface NavigationLink {
  href: string;
  label: string;
  isButton?: boolean;
}

export interface FooterNavItem {
  name: string;
  href: string;
}

/**
 * ========================================================================
 * CONTACT COMPONENT TYPES
 * ========================================================================
 */

export interface UploadedImage {
  url: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface SuccessMessageProps {
  onReset: () => void;
}

export interface InvalidFileError {
  file: File;
  reason: string;
}

export interface ContactFormErrorResponse {
  message?: string;
  success: boolean;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * ========================================================================
 * SERVER ACTION TYPES (React 19)
 * ========================================================================
 */

export interface ContactFormState {
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string[]>;
  submissionId?: string;
}
