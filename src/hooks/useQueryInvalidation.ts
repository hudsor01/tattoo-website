'use client'

import { trpc } from '@/lib/trpc'
import { QUERY_KEYS } from './core'

/**
 * Type-safe query invalidation functions
 * 
 * This hook provides methods to invalidate queries when related
 * data changes, ensuring the UI always shows fresh data.
 * 
 * Usage:
 * ```tsx
 * const { invalidateGallery, invalidateBookingsAndAppointments } = useQueryInvalidation()
 * 
 * // After a mutation:
 * const onSuccess = () => {
 *   invalidateGallery()
 * }
 * ```
 */
export function useQueryInvalidation() {
  const utils = trpc.useContext()
  
  return {
    // Gallery invalidations
    invalidateGallery: () => {
      utils.gallery.getPhotos.invalidate()
      utils.gallery.getInfinitePhotos.invalidate()
    },
    
    invalidateGalleryPhoto: (id: string) => {
      utils.gallery.getPhotoById.invalidate({ id })
      utils.gallery.getPhotos.invalidate()
    },
    
    // Booking invalidations
    invalidateBookings: () => {
      utils.booking.getAll.invalidate()
      utils.admin.getBookings.invalidate()
    },
    
    invalidateBooking: (id: string) => {
      utils.booking.getById.invalidate({ id })
      utils.booking.getAll.invalidate()
      utils.admin.getBookings.invalidate()
    },
    
    invalidateUserBookings: (userId: string) => {
      utils.booking.getUserBookings.invalidate({ userId })
      utils.booking.getAll.invalidate()
    },
    
    // Appointment invalidations
    invalidateAppointments: () => {
      utils.appointments.getAll.invalidate()
      utils.appointments.getUpcoming.invalidate()
      utils.admin.getAppointments.invalidate()
    },
    
    invalidateAppointment: (id: string) => {
      utils.appointments.getById.invalidate({ id })
      utils.appointments.getAll.invalidate()
      utils.appointments.getUpcoming.invalidate()
      utils.admin.getAppointments.invalidate()
    },
    
    // Payment invalidations
    invalidatePayments: () => {
      utils.payments.getAll.invalidate()
      utils.admin.getPayments.invalidate()
    },
    
    invalidatePayment: (id: string) => {
      utils.payments.getById.invalidate({ id })
      utils.payments.getAll.invalidate()
      utils.admin.getPayments.invalidate()
    },
    
    // Combined invalidations for related entities
    invalidateBookingsAndAppointments: () => {
      utils.booking.getAll.invalidate()
      utils.appointments.getAll.invalidate()
      utils.appointments.getUpcoming.invalidate()
      utils.admin.getBookings.invalidate()
      utils.admin.getAppointments.invalidate()
    },
    
    invalidateBookingWithPayments: (bookingId: string) => {
      utils.booking.getById.invalidate({ id: bookingId })
      utils.payments.getByBooking.invalidate({ bookingId })
      utils.admin.getBookings.invalidate()
      utils.admin.getPayments.invalidate()
    },
    
    invalidateUserData: (userId: string) => {
      utils.booking.getUserBookings.invalidate({ userId })
      utils.appointments.getUserAppointments.invalidate({ userId })
      utils.payments.getUserPayments.invalidate({ userId })
      utils.user.getProfile.invalidate({ userId })
    },
    
    // Admin dashboard invalidations
    invalidateAdminDashboard: () => {
      utils.admin.getDashboardStats.invalidate()
      utils.admin.getBookings.invalidate()
      utils.admin.getAppointments.invalidate()
      utils.admin.getPayments.invalidate()
      utils.admin.getClients.invalidate()
    },
    
    // Task invalidations
    invalidateTasks: () => {
      utils.tasks.getAll.invalidate()
    },
    
    invalidateTask: (id: string) => {
      utils.tasks.getById.invalidate({ id })
      utils.tasks.getAll.invalidate()
    },
  }
}