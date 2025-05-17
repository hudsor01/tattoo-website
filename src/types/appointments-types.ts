/**
 * appointments-types.ts
 *
 * Appointments type definitions extracted from components
 */
import { z } from 'zod';
import { PaymentStatusSchema } from './booking-types';
import type { DateString, ID } from './base-types';

/**
 * Represents a file attachment for an appointment.
 */
export interface FileData {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

// From appointment.ts and AppointmentRepository.tsx
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

// From database-functions.tsx
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

// From booking-confirmation.tsx
export interface BookingConfirmationData extends BookingConfirmationEmailData {
  phone: string;
  description?: string;
  paymentMethod: 'cashapp' | 'venmo' | 'paypal';
  agreeToTerms?: boolean;
  depositConfirmed?: boolean;
}

// From crm.tsx
export interface BookingData {
  tattooType: string;
  preferredDate: string;
  preferredTime: string;
  depositPaid: boolean;
  size?: string;
  placement?: string;
  description?: string;
  paymentMethod?: string;
  bookingId?: number;
  name?: string;
  email?: string;
  phone?: string;
  referenceImages?: string[];
  agreeToTerms?: boolean;
  depositConfirmed?: boolean;
  preferredDateObj?: Date;
}

// From email.tsx
export interface BookingDetails {
  preferredDate: string;
  preferredTime: string;
  name: string;
  email: string;
  depositPaid: boolean;
  tattooType: string;
  size?: string;
  placement?: string;
  bookingId?: number;
  agreeToTerms?: boolean;
  depositAmount?: number;
  paymentMethod?: string;
}

// From booking.ts
export interface BookingConfirmationEmailData {
  name: string;
  email: string;
  bookingId: number;
  tattooType: string;
  size: string;
  placement: string;
  preferredDate: string;
  preferredTime: string;
  depositPaid: boolean;
  depositConfirmed?: boolean;
  paymentMethod?: string;
  referenceImages?: string[];
}

// From email-automations.tsx
export interface CustomerWithAppointments {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  appointments?: Array<{
    id: string | number;
    status?: string;
    startTime: string;
    title?: string;
  }>;
}

export interface AppointmentConfirmationProps {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  artistName: string;
  appointmentType: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  depositAmount: number;
  appointmentId: string;
}
/**
 * Appointment entity interface
 */
export interface BaseEntity {
  id: string | number;
  createdAt: DateString;
  updatedAt: DateString;
}

/**
 * Unified Appointment interface with all possible fields
 */
export interface Appointment extends BaseEntity {
  title: string;
  description?: string;
  clientId: ID;
  artistId: ID;
  bookingId?: ID;
  startTime: DateString;
  endTime: DateString;
  status: AppointmentStatus;
  depositAmount?: number;
  depositPaid?: boolean;
  totalAmount?: number;
  attachments?: FileData[];
  notes?: string;
  location?: string;
  followUpDate?: DateString;
  tags?: string[];
  reminderSent?: boolean;
}

/**
 * Client entity interface
 */
export interface Client {
  id: ID;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Appointment with expanded relations
 */
export interface AppointmentWithRelations extends Appointment {
  client?: Client;
  artist?: {
    id: ID;
    name: string;
    email: string;
  };
  payments?: Array<{
    id: ID;
    amount: number;
    status: string;
    createdAt: DateString;
  }>;
}

/**
 * Time slot interface
 */
export interface TimeSlot {
  startTime: DateString;
  endTime: DateString;
  available: boolean;
  appointmentId?: ID;
}

/**
 * Availability for a specific date
 */
export interface DayAvailability {
  date: DateString;
  slots: TimeSlot[];
  minTime?: `${number}:${number}`; // HH:mm format
  maxTime?: `${number}:${number}`; // HH:mm format
}
/**
 * Calendar constraints
 */
export interface CalendarSettings {
  minTime?: string; // HH:mm format
  maxTime?: string; // HH:mm format
  slotDuration?: number; // in minutes
  bufferTime?: number; // in minutes
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
}
/**
 * Availability for a specific date
 */
export interface DayAvailability {
  date: DateString;
  slots: TimeSlot[];
  minTime?: `${number}:${number}`; // HH:mm format
  maxTime?: `${number}:${number}`; // HH:mm format
}

/**
 * Calendar constraints
 */
export type WorkingHours = Record<string, { start: string; end: string }>;

export interface CalendarSettings {
  minTime?: string; // HH:mm format
  maxTime?: string; // HH:mm format
  slotDuration?: number; // in minutes
  bufferTime?: number; // in minutes
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
  excludeDates?: DateString[];
  workingHours?: WorkingHours;
}

export interface AppointmentResponse {
  success?: boolean;
  appointment_id?: number;
  error?: string;
}

export interface AvailableSlotsResponse {
  available_slots?: Array<{
    start_time: string;
    end_time: string;
  }>;
}

/**
 * Repository-specific interfaces from AppointmentRepository.tsx
 */
export interface AppointmentCreateInput {
  clientId?: ID;
  artistId?: ID;
  bookingId?: ID;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  status?: AppointmentRepositoryStatus;
  location?: string;
  notes?: string;
}

export interface AppointmentUpdateInput {
  clientId?: ID;
  artistId?: ID;
  title?: string;
  description?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  status?: AppointmentRepositoryStatus;
  location?: string;
  notes?: string;
  reminderSent?: boolean;
}

/**
 * Appointment status options
 */
export const AppointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'rescheduled',
  'no_show',
]);

/**
 * Base appointment schema shared between create/update operations
 */
export const AppointmentBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1, 'Location is required'),
  includesConsultation: z.boolean().optional().default(false),
  followUp: z.boolean().optional().default(false),
  customerInstructions: z.string().optional(),
});

/**
 * Schema for creating a new appointment
 */
export const AppointmentCreateSchema = AppointmentBaseSchema.extend({
  bookingId: z.union([z.string(), z.number()]).optional(),
  customerId: z.union([z.string(), z.number()]),
  artistId: z.union([z.string(), z.number()]),
  deposit: z.number().optional(),
  price: z.number().optional(),
  isAllDay: z.boolean().optional().default(false),
  reminderSent: z.boolean().optional().default(false),
  sendReminder: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing appointment
 */
export const AppointmentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().min(1).optional(),
  status: AppointmentStatusSchema.optional(),
  deposit: z.number().optional(),
  depositPaid: z.boolean().optional(),
  price: z.number().optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  artistId: z.union([z.string(), z.number()]).optional(),
  includesConsultation: z.boolean().optional(),
  followUp: z.boolean().optional(),
  customerInstructions: z.string().optional(),
  reminderSent: z.boolean().optional(),
  completionNotes: z.string().optional(),
  isAllDay: z.boolean().optional(),
  cancellationReason: z.string().optional(),
});

/**
 * Schema for an appointment in the database
 */
export const AppointmentSchema = AppointmentBaseSchema.extend({
  id: z.union([z.string(), z.number()]),
  customerId: z.union([z.string(), z.number()]),
  artistId: z.union([z.string(), z.number()]),
  bookingId: z.union([z.string(), z.number()]).optional(),
  status: AppointmentStatusSchema.default('scheduled'),
  deposit: z.number().optional(),
  depositPaid: z.boolean().default(false),
  price: z.number().optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  reminderSent: z.boolean().default(false),
  completionNotes: z.string().optional(),
  isAllDay: z.boolean().default(false),
  cancellationReason: z.string().optional(),
  notifyClient: z.boolean().default(true),
  notifyArtist: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for appointment list query parameters
 */
export const AppointmentListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  status: AppointmentStatusSchema.optional(),
  artistId: z.union([z.string(), z.number()]).optional(),
  customerId: z.union([z.string(), z.number()]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  searchTerm: z.string().optional(),
});

/**
 * Schema for appointment list response
 */
export const AppointmentListResponseSchema = z.object({
  appointments: z.array(AppointmentSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

/**
 * Schema for availability check
 */
export const AvailabilityCheckSchema = z.object({
  artistId: z.union([z.string(), z.number()]).optional(),
  date: z.date(),
  duration: z.number().int().positive().optional().default(60), // in minutes
});

/**
 * Schema for available time slot
 */
export const TimeSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  available: z.boolean(),
});

/**
 * Schema for availability response
 */
export const AvailabilityResponseSchema = z.object({
  date: z.date(),
  artistId: z.union([z.string(), z.number()]).optional(),
  artistName: z.string().optional(),
  timeSlots: z.array(TimeSlotSchema),
});

/**
 * Schema for appointment confirmation
 */
export const AppointmentConfirmSchema = z.object({
  appointmentId: z.union([z.string(), z.number()]),
  sendEmail: z.boolean().optional().default(true),
});

/**
 * Schema for appointment cancellation
 */
export const AppointmentCancelSchema = z.object({
  appointmentId: z.union([z.string(), z.number()]),
  reason: z.string().optional(),
  refundDeposit: z.boolean().optional().default(false),
  sendEmail: z.boolean().optional().default(true),
});

/**
 * Schema for appointment reschedule
 */
export const AppointmentRescheduleSchema = z.object({
  appointmentId: z.union([z.string(), z.number()]),
  newStartDate: z.date(),
  newEndDate: z.date(),
  sendEmail: z.boolean().optional().default(true),
});

// Export type definitions derived from schemas

export type AppointmentBase = z.infer<typeof AppointmentBaseSchema>;
export type AppointmentListParams = z.infer<typeof AppointmentListParamsSchema>;
export type AppointmentListResponse = z.infer<typeof AppointmentListResponseSchema>;
export type AvailabilityCheck = z.infer<typeof AvailabilityCheckSchema>;
export type AvailabilityResponse = z.infer<typeof AvailabilityResponseSchema>;
export type AppointmentConfirm = z.infer<typeof AppointmentConfirmSchema>;
export type AppointmentCancel = z.infer<typeof AppointmentCancelSchema>;
export type AppointmentReschedule = z.infer<typeof AppointmentRescheduleSchema>;

// Export form-specific types for React Hook Form
export type AppointmentFormValues = AppointmentCreateInput;

/**
 * Formatted appointment for API responses
 */
export interface FormattedAppointment {
  id: string;
  title: string;
  customerId: string;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
