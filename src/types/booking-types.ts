/**
 * booking-types.ts
 *
 * Consolidated type definitions for the entire booking system.
 * Includes bookings, appointments, availability, and calendar integration types.
 */

import { z } from 'zod';
import type { DateString, ID } from './utility-types';
import type { BaseEntity } from './database.types';
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
 * Type for booking form data from Zod schema
 */
export type BookingFormValues = z.infer<typeof BookingFormSchema>;

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
  status: 'new' | 'reviewed' | 'scheduled' | 'rejected' | 'cancelled' | 'confirmed' | 'pending' | string;
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
  // Cal.com integration fields
  calBookingId?: string;
  calBookingUid?: string;
  calEventTypeId?: number;
  calStatus?: string;
  calMeetingUrl?: string;
  calMetadata?: Record<string, unknown>;
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
  // Cal.com integration fields
  calBookingId?: string;
  calBookingUid?: string;
  calEventTypeId?: number;
  calStatus?: string;
  calMeetingUrl?: string;
  calMetadata?: Record<string, unknown>;
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
 * ========================================================================
 * APPOINTMENT TYPES (from appointments-types.ts)
 * ========================================================================
 */

/**
 * Represents a file attachment for an appointment.
 */
export interface FileData {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

// Appointment status type
export const appointmentStatusEnum = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;

// Repository-specific appointment status type
export type AppointmentRepositoryStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export const getAppointmentQueryParamsSchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().optional(),
});

export type GetAppointmentQueryParams = z.infer<typeof getAppointmentQueryParamsSchema>;

// Appointment parameters
export interface CreateAppointmentParams {
  customerId: number;
  startDate: string;
  endDate: string;
  serviceType: string;
  details?: string;
  // Legacy support
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  service_type?: string;
}

// Appointment entity
export interface Appointment extends BaseEntity {
  id: ID;
  clientId: ID;
  bookingId?: ID;
  startTime: DateString;
  endTime: DateString;
  duration: number;
  service: AppointmentService;
  status: AppointmentStatus | AppointmentRepositoryStatus;
  artist?: {
    id: ID;
    name: string;
  };
  location?: string;
  notes?: string;
  deposit?: {
    amount: number;
    paid: boolean;
    paidAt?: DateString;
  };
  price?: {
    service: number;
    extras?: number;
    tax?: number;
    total: number;
  };
  checkinAt?: DateString;
  checkoutAt?: DateString;
  cancellationReason?: string;
  rescheduledFrom?: ID;
  rescheduledTo?: ID;
  calBookingId?: string;
  calEventId?: string;
  files?: FileData[];
}

// Appointment service details
export interface AppointmentService {
  type: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export interface AppointmentCreateRequest {
  clientId: ID;
  bookingId?: ID;
  startTime: DateString;
  duration: number;
  service: {
    type: string;
    name: string;
    price: number;
  };
  artistId?: ID;
  notes?: string;
  deposit?: {
    amount: number;
    required: boolean;
  };
}

export interface AppointmentUpdateRequest {
  startTime?: DateString;
  endTime?: DateString;
  duration?: number;
  status?: AppointmentStatus;
  notes?: string;
  deposit?: {
    paid: boolean;
    paidAt?: DateString;
  };
  cancellationReason?: string;
}

/**
 * Schema for creating appointments via API
 */
export const AppointmentCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().optional(),
  customerId: z.string(),
  artistId: z.string().optional(),
  tattooSize: z.enum(['small', 'medium', 'large', 'extra_large']).optional().default('medium'),
  complexity: z.number().int().min(1).max(5).optional().default(3),
  location: z.string().optional().default('main_studio'),
});

/**
 * Type for appointment creation input
 */
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;

/**
 * ========================================================================
 * AVAILABILITY TYPES (from availability-types.ts)
 * ========================================================================
 */

/**
 * Parameters for checking availability
 */
export interface AvailabilityParams {
  date: string;
  duration?: number;
  artistId?: string;
}

/**
 * Result of an availability check
 */
export interface AvailabilityResult {
  date: string;
  duration_minutes: number;
  is_authenticated: boolean;
  available_slots?: Array<{
    start_time: string;
    end_time: string;
  }>;
  error?: string;
}

/**
 * Time slot structure returned from availability endpoints
 */
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  conflict_reason?: string;
}

/**
 * Artist availability schedule
 */
export interface ArtistAvailability {
  artistId: ID;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  exceptions?: Array<{
    date: string;
    startTime?: string;
    endTime?: string;
    isAvailable: boolean;
    reason?: string;
  }>;
}

/**
 * Availability configuration
 */
export interface AvailabilityConfig {
  minBookingHours: number; // Minimum hours before booking
  maxBookingDays: number; // Maximum days in advance
  slotDuration: number; // Duration of each slot in minutes
  bufferTime: number; // Buffer time between appointments
  workingHours: {
    [key: string]: { // day of week or 'default'
      start: string;
      end: string;
      breaks?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

/**
 * ========================================================================
 * CAL.COM INTEGRATION TYPES (from cal-types.ts)
 * ========================================================================
 */

/**
 * Cal.com event types available on their platform
 */
export type CalEventType = 
  | 'tattoo-consultation'
  | 'deposit-payment'
  | 'follow-up'
  | 'touch-up'
  | 'design-review';

/**
 * Cal.com booking status
 */
export type CalBookingStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'rescheduled';

/**
 * Cal.com webhook event types
 */
export type CalWebhookEvent = 
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.rescheduled';

/**
 * Cal.com webhook payload structure
 */
export interface CalWebhookPayload {
  /** Type of the webhook event */
  event: CalWebhookEvent;
  /** Unique identifier for the webhook call */
  id: string;
  /** Timestamp when the event occurred */
  timestamp: number;
  /** The actual booking data */
  payload: CalBookingPayload;
}

/**
 * Cal.com booking payload
 */
export interface CalBookingPayload {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: CalBookingStatus;
  eventType: {
    id: number;
    title: string;
    slug: string;
  };
  organizer: {
    id: number;
    name: string;
    email: string;
    timeZone: string;
    username?: string;
  };
  attendees: Array<{
    id: number;
    email: string;
    name: string;
    timeZone: string;
    locale?: string;
    metadata?: Record<string, unknown>;
  }>;
  location?: string;
  meetingUrl?: string;
  destinationCalendar?: {
    id: number;
    integration: string;
    externalId: string;
  };
  metadata?: Record<string, unknown>;
  customInputs?: Array<{ label: string; value: string }> | Record<string, unknown>;
  additionalNotes?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  payment?: {
    amount: number;
    currency: string;
    status: string;
  };
}

/**
 * Cal.com availability
 */
export interface CalAvailability {
  dateRanges: Array<{
    start: string;
    end: string;
  }>;
  days: number[]; // 0-6 representing days of week
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timeZone: string;
}

/**
 * Cal.com integration settings
 */
export interface CalIntegrationSettings {
  enabled: boolean;
  apiKey?: string;
  eventTypeId?: number;
  calendarId?: string;
  defaultDuration?: number;
  bufferTime?: number;
  webhookSecret?: string;
}

/**
 * ========================================================================
 * BOOKING SCHEMAS
 * ========================================================================
 */

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
 * Payment status schema from existing booking-types
 */
export const PaymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/**
 * Payment method schema from existing booking-types
 */
export const PaymentMethodSchema = z.enum(['cashapp', 'venmo', 'paypal', 'card', 'cash']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// Add missing enums that were referenced
export type TattooSize = 'small' | 'medium' | 'large' | 'extra_large';
export type TattooStyle = 'traditional' | 'realism' | 'tribal' | 'japanese' | 'blackwork' | 'watercolor' | 'other';

/**
 * Additional booking schemas from older form types
 */

/**
 * Base booking schema
 */
export const BookingBaseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  tattooType: z.string().min(1, 'Tattoo type is required'),
  size: z.string().min(1, 'Size is required'),
  placement: z.string().min(1, 'Placement is required'),
  description: z.string().min(10, 'Please describe your tattoo idea'),
  preferredDate: z.string(),
  preferredTime: z.string(),
  referenceImages: z.array(z.string()).optional(),
  status: z.enum(['new', 'reviewed', 'scheduled', 'confirmed', 'completed', 'cancelled']).optional().default('new'),
  paymentStatus: PaymentStatusSchema.optional().default('pending'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

/**
 * Schema for creating a new booking
 */
export const BookingCreateSchema = BookingBaseSchema.extend({
  recaptchaToken: z.string().optional(),
  source: z.string().optional().default('website'),
  clientId: z.string().optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  paymentIntentId: z.string().optional(),
  paymentCustomerId: z.string().optional(),
});

/**
 * Schema for updating a booking
 */
export const BookingUpdateSchema = BookingBaseSchema.partial().extend({
  id: z.string(),
  status: z.enum(['new', 'reviewed', 'scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  depositPaid: z.boolean().optional(),
  finalPrice: z.number().optional(),
  notes: z.string().optional(),
  artistNotes: z.string().optional(),
});

/**
 * Schema for deposit payment update
 */
export const DepositUpdateSchema = z.object({
  bookingId: z.number(),
  paymentIntentId: z.string(),
  paymentMethod: PaymentMethodSchema,
  amount: z.number(),
});

/**
 * Booking list params schema
 */
export const BookingListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  status: z.string().optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'preferredDate', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Infer types from Zod schemas
 */
// Removed duplicate - already defined above
export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof BookingUpdateSchema>;
export type BookingListParams = z.infer<typeof BookingListParamsSchema>;

/**
 * Payment intent interface
 */
export interface PaymentIntent {
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
 * Booking form data type for forms
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
  // Cal.com integration fields
  calBookingId?: string;
  calBookingUid?: string;
  calEventTypeId?: number;
}

/**
 * Schema for Cal.com webhook payload validation
 */
export const CalWebhookSchema = z.object({
  event: z.string() as z.ZodType<CalWebhookEvent>,
  id: z.string(),
  timestamp: z.number(),
  payload: z.object({
    id: z.string(),
    uid: z.string(),
    eventTypeId: z.number(),
    title: z.string(),
    description: z.string().optional(),
    additionalNotes: z.string().optional(),
    customInputs: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number(), z.boolean()]),
      type: z.string(),
    })).optional(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.array(z.object({
      email: z.string().email(),
      name: z.string(),
      timeZone: z.string(),
      locale: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    })),
    organizer: z.object({
      email: z.string().email(),
      name: z.string(),
      timeZone: z.string(),
      username: z.string(),
    }),
    status: z.string(),
    location: z.string().optional(),
    meetingUrl: z.string().optional(),
    payment: z.object({
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      paymentMethod: z.string().optional(),
      externalId: z.string().optional(),
    }).optional(),
    metadata: z.record(z.any()).optional(),
    cancellationReason: z.string().optional(),
    previousBookingId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

/**
 * ========================================================================
 * API ENDPOINTS TYPES
 * ========================================================================
 */

/**
 * Customer type for admin dashboard
 */
export interface CustomerType {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment type for admin dashboard
 */
export interface AppointmentType {
  id: string;
  customerId: string;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  appointmentDate: Date;
  duration: number;
  status: string;
  depositPaid?: boolean;
  depositAmount?: number;
  totalPrice?: number;
  tattooStyle?: string | null;
  description?: string | null;
  location?: string | null;
  size?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API type with extended properties from Appointment model including Customer details
 */
export interface AppointmentWithCustomer {
  id: string;
  title: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  Customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  Artist?: {
    User?: {
      name?: string | null;
    };
  };
}

/**
 * Formatted appointment response for API endpoints
 */
export interface FormattedAppointment {
  id: string;
  title: string;
  customerId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  artist?: {
    name: string;
  } | null;
}