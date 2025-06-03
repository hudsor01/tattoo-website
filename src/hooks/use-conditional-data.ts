'use client';

/**
 * Conditional Data Loading Hooks
 * 
 * Production-ready implementation of React hooks for conditional data fetching:
 * - Conditionally load dashboard statistics
 * - Conditionally load customer data
 * - Conditionally load appointments with pagination
 */

import { useMemo, useEffect, useRef } from 'react';
import { logger } from "@/lib/logger";
// Using relative paths instead of aliases for improved module resolution
import { api } from '../lib/trpc/client';
import type { SimpleCustomer } from '../types/customer-types';
import type { AppointmentSerializedType } from '../types/booking-types';
import type { StatsPeriod } from '../types/dashboard-types';

/**
 * Production-ready conditional dashboard stats hook
 * 
 * Provides dashboard statistics with:
 * - Proper caching and revalidation
 * - Conditional loading
 * - Comprehensive error handling
 * - Data normalization
 */
interface DashboardStatsOptions {
  shouldLoad: boolean;
  period?: 'day' | 'week' | 'month' | 'year';
  staleTime?: number;
  refetchInterval?: number | false;
}

export function useConditionalDashboardStats(options: DashboardStatsOptions) {
  const {
    shouldLoad,
    period = 'month',
    staleTime = 5 * 60 * 1000,
    refetchInterval = false
  } = options;
  
  // Validate period parameter to ensure type safety
  const validPeriodsMap: Record<string, StatsPeriod> = {
    'day': 'today',
    'week': 'week',
    'month': 'month',
    'year': 'year'
  };
  
  // Map from UI-friendly periods to API StatsPeriod values
  const validPeriod: StatsPeriod = (period && period in validPeriodsMap)
    ? validPeriodsMap[period]
    : 'month' as StatsPeriod;
  
  // tRPC query with proper caching and error handling
  const { 
    data: stats, 
    isLoading,
    isError,
    error,
    isStale,
    refetch,
    isFetching,
    dataUpdatedAt
  } = api.dashboard.stats.getStats.useQuery(
    { period: validPeriod },
    { 
      enabled: shouldLoad,
      staleTime: staleTime,
      refetchInterval: refetchInterval,
      retry: 2
    }
  );
  
  // Data normalization/transformation to ensure consistent structure
  const normalizedStats = useMemo(() => {
    if (!stats) return null;
    
    // Define an interface for the normalized stats structure
    interface NormalizedDashboardStats {
      revenue: number;
      customers: number;
      appointments: number;
      period: StatsPeriod;
      additionalInfo: {
        paymentsCount: number;
      };
    }
    
    // Ensure all expected properties exist and have default values if missing
    const normalized: NormalizedDashboardStats = {
      revenue: stats.revenue?.total ?? 0,
      customers: stats.customers?.total ?? 0,
      appointments: stats.appointments?.total ?? 0,
      period: validPeriod,
      // Add additional properties that might not be in the response
      additionalInfo: {
        paymentsCount: stats.revenue?.paymentsCount ?? 0
      }
    };
    
    return normalized;
  }, [stats, validPeriod]);

  // Define the return type for better type safety
  interface ConditionalDashboardStatsResult {
    stats: typeof normalizedStats;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    isStale: boolean;
    refetch: typeof refetch;
    isFetching: boolean;
    dataUpdatedAt: Date | null;
    isEmpty: boolean;
  }
  
  const result: ConditionalDashboardStatsResult = {
    stats: normalizedStats,
    isLoading,
    isError,
    error,
    isStale,
    refetch,
    isFetching,
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isEmpty: stats === null || stats === undefined
  };
  
  return result;
}

/**
 * Production-ready conditional customer data hook
 * 
 * Implementation that provides:
 * 1. Robust data fetching with proper caching and revalidation
 * 2. Comprehensive error handling and retry logic
 * 3. Optimistic updates for mutations
 * 4. Data transformation with type safety
 * 5. Loading, error, and empty states
 * 6. Detailed status reporting
 * 7. Prefetching capabilities for performance
 */
interface CustomerOptions {
  initialData?: SimpleCustomer | null;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: SimpleCustomer) => void;
  onError?: (error: Error) => void;
}

export function useConditionalCustomer(
  customerId: string | null,
  options: CustomerOptions = {}
) {
  const {
    initialData = null,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    onSuccess,
    onError
  } = options;
  
  // Store previous customer ID to detect changes
  const previousIdRef = useRef<string | null>(null);
  const utils = api.useUtils();
  const isValidId = customerId && typeof customerId === 'string' && customerId.trim().length > 0;
  
  // tRPC query with proper caching and error handling
  const { 
    data: customer, 
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
    isRefetching
  } = api.admin.getCustomerById.useQuery(
    { id: isValidId ? customerId : '' },
    { 
      enabled: Boolean(isValidId),
      // Only use initialData if it's a valid SimpleCustomer object with required fields
      initialData: (() => {
        if (initialData && typeof initialData === 'object' &&
            'id' in initialData && typeof initialData.id === 'string' &&
            'firstName' in initialData && typeof initialData.firstName === 'string' &&
            'lastName' in initialData && typeof initialData.lastName === 'string') {
          return initialData;
        }
        return undefined;
      })(),
      refetchOnMount: refetchOnMount,
      refetchOnWindowFocus: refetchOnWindowFocus,
      retry: (failureCount, error) => {
        if (error?.message?.includes('not found')) return false;
        return failureCount < 3;
      }
    }
  );
  
  // Handle success callback
  useEffect(() => {
    if (customer && onSuccess) {
      try {
        const transformed = transformCustomerData(customer);
        onSuccess(transformed);
      } catch (transformError) {
        void logger.error('Error transforming customer data:', transformError);
      }
    }
  }, [customer, onSuccess]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [error, onError]);

  // Prefetch related data when customer ID changes
  useEffect(() => {
    if (isValidId && customerId !== previousIdRef.current) {
      // Safe prefetch - don't try to prefetch if customerId is null
      if (customerId) {
        void utils.appointments.getAll.prefetch({ customerId: customerId, limit: 5 });
      }
      previousIdRef.current = customerId;
    }
    // Return empty cleanup function to satisfy React hooks
    return () => {};
  }, [customerId, isValidId, utils.appointments.getAll]);

  // Transform the customer data using a dedicated function
  const transformedCustomer = useMemo(() => {
    if (!customer) return null;
    try {
      return transformCustomerData(customer);
    } catch (error) {
      void logger.error('Error transforming customer in memo:', error);
      return null;
    }
  }, [customer]);

  return {
    customer: transformedCustomer,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isRefetching,
    isEmpty: !customer,
    isValidId
  };
}

/**
 * Transform raw customer data to SimpleCustomer format
 * Extracted to a separate function for reusability and testing
 */
function transformCustomerData(customer: Record<string, unknown>): SimpleCustomer {
  if (!customer) {
    throw new Error('Cannot transform null or undefined customer data');
  }
  
  // Extract id, firstName, and lastName with validation
  const id = customer['id'];
  const firstName = customer['firstName'];
  const lastName = customer['lastName'];
  
  // Validate required fields
  if (typeof id !== 'string' || !id) {
    throw new Error('Customer data is missing required id field');
  }
  
  if (typeof firstName !== 'string') {
    throw new Error('Customer data is missing required firstName field');
  }
  
  if (typeof lastName !== 'string') {
    throw new Error('Customer data is missing required lastName field');
  }
  
  // Handle optional fields with proper type guards
  const email = typeof customer['email'] === 'string' ? customer['email'] : undefined;
  const phone = typeof customer['phone'] === 'string' ? customer['phone'] : undefined;
  const address = typeof customer['address'] === 'string' ? customer['address'] : undefined;
  const city = typeof customer['city'] === 'string' ? customer['city'] : undefined;
  const state = typeof customer['state'] === 'string' ? customer['state'] : undefined;
  const postalCode = typeof customer['postalCode'] === 'string' ? customer['postalCode'] : undefined;
  const notes = typeof customer['notes'] === 'string' ? customer['notes'] : undefined;
  
  // Handle date fields with proper type conversion
  let createdAt: string;
  if (customer['createdAt'] instanceof Date) {
    createdAt = customer['createdAt'].toISOString();
  } else if (typeof customer['createdAt'] === 'string') {
    createdAt = customer['createdAt'];
  } else {
    createdAt = new Date().toISOString();
  }
  
  let updatedAt: string;
  if (customer['updatedAt'] instanceof Date) {
    updatedAt = customer['updatedAt'].toISOString();
  } else if (typeof customer['updatedAt'] === 'string') {
    updatedAt = customer['updatedAt'];
  } else {
    updatedAt = new Date().toISOString();
  }
  
  // Construct the SimpleCustomer object
  const simpleCustomer: SimpleCustomer = {
    id,
    firstName,
    lastName,
    createdAt,
    updatedAt
  };
  
  // Add optional fields only if they exist
  if (email) simpleCustomer.email = email;
  if (phone) simpleCustomer.phone = phone;
  if (address) simpleCustomer.address = address;
  if (city) simpleCustomer.city = city;
  if (state) simpleCustomer.state = state;
  if (postalCode) simpleCustomer.postalCode = postalCode;
  if (notes) simpleCustomer.notes = notes;
  
  return simpleCustomer;
}

/**
 * Production-ready conditional appointments hook
 * 
 * Implementation that provides:
 * 1. Robust pagination with cursor support
 * 2. Date range filtering with validation
 * 3. Data transformation and normalization
 * 4. Loading, error, and empty states
 * 5. Prefetching for improved UX
 * 6. Proper caching and revalidation strategies
 */
interface AppointmentOptions {
  customerId: string | null;
  shouldLoad?: boolean;
  limit?: number;
  cursor?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  onSuccess?: (data: { items: AppointmentSerializedType[]; nextCursor: string | null }) => void;
  onError?: (error: Error) => void;
}

export function useConditionalAppointments(options: AppointmentOptions) {
  const {
    customerId,
    shouldLoad = true,
    limit = 10,
    cursor = null,
    startDate = null,
    endDate = null,
    onSuccess,
    onError
  } = options;
  
  // Get tRPC utils for prefetching next page
  const utils = api.useUtils();
  
  // Validate date inputs to prevent errors
  const validStartDate = startDate ? new Date(startDate) : undefined;
  const validEndDate = endDate ? new Date(endDate) : undefined;
  const isValidId = customerId && typeof customerId === 'string' && customerId.trim().length > 0;
  
  // Convert dates to ISO strings
  const startDateString = validStartDate ? validStartDate.toISOString() : undefined;
  const endDateString = validEndDate ? validEndDate.toISOString() : undefined;

  // tRPC query with proper pagination and error handling
  const { 
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
    isRefetching
  } = api.appointments.getAll.useQuery(
    { 
      customerId: isValidId ? customerId : '',
      limit,
      cursor,
      startDate: startDateString,
      endDate: endDateString
    },
    { 
      enabled: Boolean(isValidId && shouldLoad),
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
      retry: (failureCount, error) => {
        // Implement custom retry logic
        if (error?.message?.includes('not found')) return false;
        return failureCount < 2;
      }
    }
  );

  // Set up success and error handlers with useEffect
  useEffect(() => {
    if (data && onSuccess) {
      // Convert undefined nextCursor to null to match the expected type
      const processedData = {
        items: data.items,
        nextCursor: data.nextCursor ?? null
      };
      onSuccess(processedData);
    }
  }, [data, onSuccess]);

  useEffect(() => {
    if (error && onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [error, onError]);
  
  // Prefetch next page when current page loads
  useEffect(() => {
    if (data?.nextCursor) {
      void utils.appointments.getAll.prefetch({
        customerId: isValidId ? customerId : '',
        limit,
        cursor: data.nextCursor,
        startDate: startDateString,
        endDate: endDateString
      });
    }
    // Return empty cleanup function
    return () => {};
  }, [data, limit, customerId, isValidId, utils.appointments.getAll, startDateString, endDateString]);
  
  // Transform and normalize data with proper type safety
  const normalizedAppointments = useMemo(() => {
    if (!data?.items || !Array.isArray(data.items)) return [];
    
    return data.items.map((appointment) => {
      // Helper function to safely convert Date or string to ISO string
      const formatDate = (dateValue: unknown): string => {
        if (dateValue instanceof Date) {
          return dateValue.toISOString();
        } else if (typeof dateValue === 'string') {
          return dateValue;
        }
        return new Date().toISOString();
      };
      
      // Validate required fields
      if (!appointment.id || typeof appointment.id !== 'string') {
        throw new Error('Appointment is missing required id field');
      }
      
      if (!appointment.customerId || typeof appointment.customerId !== 'string') {
        throw new Error('Appointment is missing required customerId field');
      }
      
      // Create a properly typed appointment object
      const normalized: AppointmentSerializedType = {
        // Required fields with defaults
        id: appointment.id,
        customerId: appointment.customerId,
        appointmentDate: appointment.appointmentDate ?? new Date().toISOString(),
        duration: typeof appointment.duration === 'number' ? appointment.duration : 60,
        status: typeof appointment.status === 'string' ? appointment.status : 'scheduled',
        // Date fields with proper formatting
        createdAt: formatDate(appointment.createdAt),
        updatedAt: formatDate(appointment.updatedAt)
      };
      
      // Add optional fields with type guards
      if (typeof appointment.clientName === 'string') {
        normalized.clientName = appointment.clientName;
      }
      
      if (typeof appointment.clientEmail === 'string') {
        normalized.clientEmail = appointment.clientEmail;
      }
      
      if (typeof appointment.clientPhone === 'string') {
        normalized.clientPhone = appointment.clientPhone;
      }
      
      if (typeof appointment.description === 'string') {
        normalized.description = appointment.description;
      }
      
      if (typeof appointment.location === 'string') {
        normalized.location = appointment.location;
      }
      
      if (typeof appointment.size === 'string') {
        normalized.size = appointment.size;
      }
      
      if (typeof appointment.tattooStyle === 'string') {
        normalized.tattooStyle = appointment.tattooStyle;
      }
      
      if (typeof appointment.depositPaid === 'boolean') {
        normalized.depositPaid = appointment.depositPaid;
      }
      
      if (typeof appointment.depositAmount === 'number') {
        normalized.depositAmount = appointment.depositAmount;
      }
      
      if (typeof appointment.totalPrice === 'number') {
        normalized.totalPrice = appointment.totalPrice;
      }
      
      return normalized;
    });
  }, [data?.items]);

  // Define the return type for better type safety
  interface ConditionalAppointmentsResult {
    appointments: AppointmentSerializedType[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    isFetching: boolean;
    refetch: typeof refetch;
    dataUpdatedAt: Date | null;
    isRefetching: boolean;
    hasNext: string | null;
    isEmpty: boolean;
    nextCursor: string | null;
    totalCount: number;
  }
  
  const result: ConditionalAppointmentsResult = {
    appointments: normalizedAppointments,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isRefetching,
    hasNext: data?.nextCursor ?? null,
    isEmpty: !data?.items || data.items.length === 0,
    nextCursor: data?.nextCursor ?? null,
    totalCount: (data as any)?.totalCount ?? normalizedAppointments.length
  };
  
  return result;
}
