'use client'

import { createTRPCQueryHook, createTRPCMutationHook } from './use-trpc-core'

/**
 * Get available booking slots
 */
export const useAvailableSlots = createTRPCQueryHook(
  'booking',
  'getAvailableSlots',
  {
    staleTime: 1000 * 60, // 1 minute
    retry: 1
  }
)

/**
 * Get booking by ID
 */
export const useBookingById = createTRPCQueryHook(
  'booking',
  'getById',
  {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  }
)

/**
 * Get user's bookings
 */
export const useUserBookings = createTRPCQueryHook(
  'booking',
  'getUserBookings',
  {
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1
  }
)

/**
 * Create a new booking
 */
export const useCreateBooking = createTRPCMutationHook(
  'booking',
  'create'
)

/**
 * Cancel a booking
 */
export const useCancelBooking = createTRPCMutationHook(
  'booking',
  'cancel'
)