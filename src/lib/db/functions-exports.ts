/**
 * PostgreSQL Functions - A typed interface for database functions
 *
 * This module provides a clean interface to call PostgreSQL functions
 * with proper type definitions and error handling.
 */
import { executeStoredProcedure } from './prisma';

// Types for function parameters and results
export type AppointmentAvailabilityResult = {
  isAvailable: boolean;
  conflicts: unknown[] | null;
  error?: string;
};

export type PricingBreakdown = {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
};

export type CustomerValidationResult = {
  isValid: boolean;
  errors: string[];
  normalizedData: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    birthdate: Date | null;
  };
  potentialDuplicates: unknown[] | null;
};

export type CancellationPolicyResult = {
  success: boolean;
  error?: string;
  appointmentId?: string;
  cancellationDate?: Date;
  daysNotice?: number;
  reasonCode?: string;
  policyApplied?: string;
  feePercentage?: number;
  feeAmount?: number;
  depositRefundable?: boolean;
  allowReschedule?: boolean;
};

export type AppointmentScheduleResult = {
  success: boolean;
  error?: string;
  conflicts?: unknown[];
  appointmentId?: string;
  startDate?: Date;
  endDate?: Date;
  deposit?: number;
  totalPrice?: number;
  pricingDetails?: PricingBreakdown;
};

export type CustomerLtv = {
  customerId: string;
  totalSpent: number;
  appointmentCount: number;
  firstAppointment: Date | null;
  lastAppointment: Date | null;
  relationshipDays: number;
  avgAppointmentValue: number;
  frequencyDays: number;
  projectedAnnualValue: number;
};

export type ArtistPerformanceMetrics = {
  artistId: string;
  artistName: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    avgPerAppointment: number;
  };
  utilization: {
    hoursBooked: number;
    hoursAvailable: number;
    utilizationRate: number;
  };
};

export type BusinessDashboardMetrics = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    deposits: number;
    avgTicket: number;
  };
  customers: {
    new: number;
  };
  appointments: {
    total: number;
    cancellationRate: number;
  };
  topArtists: Array<{
    artistId: string;
    artistName: string;
    appointments: number;
    revenue: number;
  }>;
};

// Function to check appointment availability
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date | null = null,
  appointmentId: string | null = null,
  size?: string,
  complexity?: string,
): Promise<AppointmentAvailabilityResult> {
  try {
    // If endTime is not provided but size is, we'll let the database function calculate it
    if (!endTime && size) {
      const result = await executeStoredProcedure<AppointmentAvailabilityResult>(
        'check_appointment_availability',
        [artistId, startTime, null, appointmentId, size, complexity || '3'],
      );
      return result;
    }

    const result = await executeStoredProcedure<AppointmentAvailabilityResult>(
      'check_appointment_availability',
      [artistId, startTime, endTime, appointmentId],
    );
    return result;
  } catch (error) {
    console.error('Error checking appointment availability:', error);
    return {
      isAvailable: false,
      conflicts: null,
      error: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

// Function to calculate pricing
export async function calculatePricing(
  size: string,
  placement: string,
  complexity: number = 3,
  artistId?: string,
  customHourlyRate?: number,
): Promise<PricingBreakdown> {
  try {
    const result = await executeStoredProcedure<PricingBreakdown>('calculate_pricing', [
      size,
      placement,
      complexity,
      artistId || null,
      customHourlyRate || null,
    ]);
    return result;
  } catch (error) {
    console.error('Error calculating pricing:', error);
    throw error;
  }
}

// Function to validate customer data
export async function validateCustomerData(
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  birthdate?: Date,
): Promise<CustomerValidationResult> {
  try {
    const result = await executeStoredProcedure<CustomerValidationResult>(
      'validate_customer_data',
      [firstName, lastName, email || null, phone || null, birthdate || null],
    );
    return result;
  } catch (error) {
    console.error('Error validating customer data:', error);
    throw error;
  }
}

// Function to enforce cancellation policy
export async function enforceCancellationPolicy(
  appointmentId: string,
  cancellationDate: Date = new Date(),
  reasonCode: string = 'customer_request',
): Promise<CancellationPolicyResult> {
  try {
    const result = await executeStoredProcedure<CancellationPolicyResult>(
      'enforce_cancellation_policy',
      [appointmentId, cancellationDate, reasonCode],
    );
    return result;
  } catch (error) {
    console.error('Error enforcing cancellation policy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error applying cancellation policy',
    };
  }
}

// Function to calculate appointment duration
export async function calculateAppointmentDuration(
  size: string,
  complexity: number = 3,
): Promise<string> {
  try {
    const result = await executeStoredProcedure<{ duration: string }>(
      'calculate_appointment_duration',
      [size, complexity],
    );
    return result.duration;
  } catch (error) {
    console.error('Error calculating appointment duration:', error);
    throw error;
  }
}

// Function to schedule an appointment
export async function scheduleAppointment(params: {
  title: string;
  description?: string;
  startDate: Date;
  customerId: string;
  artistId: string;
  tattooSize?: string;
  complexity?: number;
  location?: string;
}): Promise<AppointmentScheduleResult> {
  try {
    const {
      title,
      description = '',
      startDate,
      customerId,
      artistId,
      tattooSize = 'medium',
      complexity = 3,
      location = 'main_studio',
    } = params;

    const result = await executeStoredProcedure<AppointmentScheduleResult>('schedule_appointment', [
      title,
      description,
      startDate,
      customerId,
      artistId,
      tattooSize,
      complexity,
      location,
    ]);
    return result;
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error scheduling appointment',
    };
  }
}

// Function to reschedule an appointment
export async function rescheduleAppointment(
  appointmentId: string,
  newStartDate: Date,
  reason?: string,
): Promise<AppointmentScheduleResult> {
  try {
    const result = await executeStoredProcedure<AppointmentScheduleResult>(
      'reschedule_appointment',
      [appointmentId, newStartDate, reason || null],
    );
    return result;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error rescheduling appointment',
    };
  }
}

// Function to calculate customer lifetime value
export async function getCustomerLTV(customerId: string): Promise<CustomerLtv> {
  try {
    const result = await executeStoredProcedure<CustomerLtv>('calculate_customer_ltv', [
      customerId,
    ]);
    return result;
  } catch (error) {
    console.error('Error calculating customer LTV:', error);
    throw error;
  }
}

// Function to get artist performance metrics
export async function getArtistPerformanceMetrics(
  artistId: string,
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: Date = new Date(),
): Promise<ArtistPerformanceMetrics> {
  try {
    const result = await executeStoredProcedure<ArtistPerformanceMetrics>(
      'generate_artist_performance_metrics',
      [artistId, startDate, endDate],
    );
    return result;
  } catch (error) {
    console.error('Error getting artist performance metrics:', error);
    throw error;
  }
}

// Function to get business dashboard metrics
export async function getBusinessDashboardMetrics(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: Date = new Date(),
): Promise<BusinessDashboardMetrics> {
  try {
    const result = await executeStoredProcedure<BusinessDashboardMetrics>(
      'generate_business_dashboard_metrics',
      [startDate, endDate],
    );
    return result;
  } catch (error) {
    console.error('Error getting business dashboard metrics:', error);
    throw error;
  }
}

// Function to search customers with fuzzy matching
export async function searchCustomers(searchTerm: string, limit: number = 20): Promise<unknown[]> {
  try {
    const result = await executeStoredProcedure<unknown[]>('search_customers', [searchTerm]);

    // Limit results if needed
    return Array.isArray(result) ? result.slice(0, limit) : [];
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

// Export default object with all functions
export default {
  checkAppointmentAvailability,
  calculatePricing,
  validateCustomerData,
  enforceCancellationPolicy,
  calculateAppointmentDuration,
  scheduleAppointment,
  rescheduleAppointment,
  getCustomerLTV,
  getArtistPerformanceMetrics,
  getBusinessDashboardMetrics,
  searchCustomers,
};