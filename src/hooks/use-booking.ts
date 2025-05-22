/**
 * Booking hooks for the tattoo website
 * 
 * This file provides hooks for managing bookings and appointments.
 */

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

/**
 * Hook for booking management
 */
export const useBooking = () => {
  const createBookingMutation = trpc.booking.create.useMutation();
  const updateBookingMutation = trpc.booking.update.useMutation();
  const deleteBookingMutation = trpc.booking.delete.useMutation();
  
  const createBooking = useCallback(
    (bookingData: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      serviceId: string;
      appointmentDate: Date;
      notes?: string;
    }) => {
      try {
        return createBookingMutation.mutate(bookingData);
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    },
    [createBookingMutation],
  );

  const updateBooking = useCallback(
    (bookingId: string, updateData: {
      appointmentDate?: Date;
      notes?: string;
      status?: 'confirmed' | 'cancelled' | 'completed';
    }) => {
      try {
        return updateBookingMutation.mutate({ bookingId, ...updateData });
      } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
      }
    },
    [updateBookingMutation],
  );

  const cancelBooking = useCallback(
    (bookingId: number, reason?: string) => {
      try {
        return deleteBookingMutation.mutate({ id: bookingId });
      } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
      }
    },
    [deleteBookingMutation],
  );

  return {
    createBooking,
    updateBooking,
    cancelBooking,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    isCancelling: deleteBookingMutation.isPending,
    createSuccess: createBookingMutation.isSuccess,
    updateSuccess: updateBookingMutation.isSuccess,
    cancelSuccess: deleteBookingMutation.isSuccess,
    createError: createBookingMutation.error,
    updateError: updateBookingMutation.error,
    cancelError: deleteBookingMutation.error,
  };
};

/**
 * Hook for fetching bookings for admin dashboard
 */
export const useAdminBookings = () => {
  const { data, isLoading, error, refetch } = trpc.booking.getAll.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return {
    bookings: data || [],
    isLoading,
    error,
    refetchBookings: refetch,
  };
};