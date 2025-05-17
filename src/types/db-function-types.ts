/**
 * db-function-types.ts
 *
 * Type definitions related to database function parameters, options,
 * and results. This file consolidates all database function-specific types.
 */

/**
 * Options for executing stored procedures
 */
export type ExecuteStoredProcedureOptions = {
  // Whether to log the parameters when calling the function
  logParams?: boolean;
  // Custom timeout for the query in milliseconds
  timeoutMs?: number;
};

/**
 * Database error information
 */
export type DatabaseError = {
  message: string;
  code?: string;
  details?: string;
  originalError?: unknown;
};

/**
 * Generic database operation result
 */
export type DatabaseResult<T> = {
  data: T | null;
  error: DatabaseError | null;
};

/**
 * Parameters for pricing calculations
 */
export type PricingCalculationParams = {
  size: string;
  placement: string;
  complexity?: number;
  artistId?: string;
  customHourlyRate?: number;
};

/**
 * Result of price calculation
 */
export type PricingResult = {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
};

/**
 * Parameters for checking artist availability
 */
export type AvailabilityParams = {
  artistId: string;
  startTime: Date;
  endTime?: Date | null;
  appointmentId?: string | null;
  size?: string;
  complexity?: number;
};

/**
 * Result of availability check
 */
export type AvailabilityResult = {
  isAvailable: boolean;
  conflicts: unknown[] | null;
  error?: string;
};

/**
 * Parameters for customer validation
 */
export type CustomerValidationParams = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthdate?: Date;
};

/**
 * Result of customer validation
 */
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

/**
 * Parameters for scheduling an appointment
 */
export type AppointmentScheduleParams = {
  title: string;
  description?: string;
  startDate: Date;
  customerId: string;
  artistId: string;
  tattooSize?: string;
  complexity?: number;
  location?: string;
};

/**
 * Result of appointment scheduling
 */
export type AppointmentScheduleResult = {
  success: boolean;
  error?: string;
  conflicts?: unknown[];
  appointmentId?: string;
  startDate?: Date;
  endDate?: Date;
  deposit?: number;
  totalPrice?: number;
  pricingDetails?: PricingResult;
};

/**
 * Parameters for cancelling an appointment
 */
export type CancellationParams = {
  appointmentId: string;
  cancellationDate?: Date;
  reasonCode?: string;
};

/**
 * Result of cancellation policy evaluation
 */
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

export interface UserLike {
  id: string;
}
