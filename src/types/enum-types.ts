export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum UserRole {
  ADMIN = 'admin',
  ARTIST = 'artist',
  CLIENT = 'client',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  FULL = 'full',
  OTHER = 'other',
}

export enum PaymentMethod {
  CREDIT_CARD = 'card',
  CASH = 'cash',
  VENMO = 'venmo',
  PAYPAL = 'paypal',
  CASHAPP = 'cashapp',
}

export enum BookingSource {
  WEBSITE = 'website',
  PHONE = 'phone',
  EMAIL = 'email',
  SOCIAL = 'social',
  WALK_IN = 'walk_in',
  REFERRAL = 'referral',
}

export enum TattooSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large',
  FULL_SLEEVE = 'full_sleeve',
  HALF_SLEEVE = 'half_sleeve',
  BACK_PIECE = 'back_piece',
  CUSTOM = 'custom',
}

export enum TattooStyle {
  TRADITIONAL = 'traditional',
  NEO_TRADITIONAL = 'neo_traditional',
  REALISM = 'realism',
  WATERCOLOR = 'watercolor',
  BLACKWORK = 'blackwork',
  TRIBAL = 'tribal',
  JAPANESE = 'japanese',
  MINIMALIST = 'minimalist',
  GEOMETRIC = 'geometric',
  PORTRAIT = 'portrait',
  SCRIPT = 'script',
  COVER_UP = 'cover_up',
  CUSTOM = 'custom',
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_BOOKED = 'appointment_booked',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  DESIGN_READY = 'design_ready',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  MESSAGE_RECEIVED = 'message_received',
}

export enum BookingStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VIP = 'vip',
  BLACKLISTED = 'blacklisted',
}

export enum EmailStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  FAILED = 'failed',
  SPAM = 'spam',
}

export enum Breakpoint {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = 'xxl',
}

export enum ContactFormStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  NOT_INTERESTED = 'not_interested',
  SPAM = 'spam',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONSULTATION_SCHEDULED = 'consultation_scheduled',
  APPOINTMENT_BOOKED = 'appointment_booked',
  LOST = 'lost',
}

export enum GalleryImageStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FEATURED = 'featured',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// UI related type literals

/**
 * Component Size
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color Scheme
 */
export type ColorScheme = 'light' | 'dark' | 'system';

/**
 * Theme Color
 */
export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

/**
 * Component Variant
 */
export type Variant = 'filled' | 'outlined' | 'ghost' | 'link';

/**
 * Component Orientation
 */
export type Orientation = 'horizontal' | 'vertical';

/**
 * Status Type (for badges, etc.)
 */
export type StatusType = 'success' | 'warning' | 'error' | 'info' | string;

/**
 * Dashboard Section
 */
export type DashboardSection = 'bookings' | 'payments' | 'leads' | 'contacts';

/**
 * Form Field Type
 */
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'time' 
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'hidden';

/**
 * Supported File Types
 */
export type SupportedFileType = 
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Image Fit
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/**
 * Toast Type
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Animation Type
 */
export type AnimationType = 'fade' | 'slide' | 'scale' | 'flip' | 'bounce';

/**
 * Sort Direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Date Format
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'numeric' | 'relative';

/**
 * Time Format
 */
export type TimeFormat = '12h' | '24h';

/**
 * Currency Code
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

/**
 * Modal Size
 */
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';