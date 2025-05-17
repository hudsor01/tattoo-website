/**
 * Core database function types
 * 
 * This file contains shared types used by the database function layer.
 */

import type {
  ExecuteStoredProcedureOptions,
  DatabaseError,
  DatabaseResult,
  PricingCalculationParams,
  PricingResult,
  AvailabilityParams,
  AvailabilityResult,
  CustomerValidationParams,
  CustomerValidationResult,
  AppointmentScheduleParams,
  AppointmentScheduleResult,
  CancellationParams,
  CancellationPolicyResult
} from '@/types/db-function-types';

export type {
  ExecuteStoredProcedureOptions,
  DatabaseError,
  DatabaseResult,
  PricingCalculationParams,
  PricingResult,
  AvailabilityParams,
  AvailabilityResult,
  CustomerValidationParams,
  CustomerValidationResult,
  AppointmentScheduleParams,
  AppointmentScheduleResult,
  CancellationParams,
  CancellationPolicyResult
};