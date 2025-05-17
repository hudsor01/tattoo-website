/**
 * availability-types.ts
 *
 * Type definitions for appointment availability-related functionality.
 * This includes interfaces, type aliases, and Zod schemas for checking availability,
 * managing time slots, and handling appointment scheduling.
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
 * Parameters for appointment creation
 */
export interface CreateAppointmentParams {
  customer_id: number | string;
  start_date: string;
  end_date: string;
  service_type: string;
  details?: string;
  // Normalized alternatives (camelCase)
  customerId?: number | string;
  startDate?: string;
  endDate?: string;
  serviceType?: string;
}

/**
 * Result of appointment creation
 */
export interface CreateAppointmentResult {
  success: boolean;
  appointment_id?: number | string;
  error?: string;
  conflicts?: TimeSlot[];
}

/**
 * Calendar settings for availability
 */
export interface CalendarSettings {
  working_hours: {
    [day: string]: {
      start: string;
      end: string;
      is_available: boolean;
    };
  };
  block_out_dates: string[];
  appointment_duration: number;
  buffer_time: number;
}

/**
 * Day availability for calendar display
 */
export interface DayAvailability {
  date: string;
  is_available: boolean;
  available_slots: TimeSlot[];
  working_hours?: {
    start: string;
    end: string;
  };
}