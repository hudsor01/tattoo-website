/**
 * Hook for managing Cal.com bookings
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/components/ui/use-toast';

interface UseCalBookingsOptions {
  limit?: number;
  status?: string;
  eventTypeId?: number;
}

export function useCalBookings(options: UseCalBookingsOptions = {}) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Fetch bookings from tRPC
  const { 
    data: bookings = [], 
    isLoading,
    error,
    refetch
  } = trpc.cal.getBookings.useQuery(options, {
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // onError is not supported in newer tRPC versions
  });

  // Check Cal.com configuration
  const { data: configStatus } = trpc.cal.getConfigStatus.useQuery(undefined, {
    staleTime: Infinity,
  });

  // Mutation for syncing bookings
  const syncMutation = trpc.cal.syncBookings.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Bookings synced successfully',
        description: `Created: ${data.stats.created}, Updated: ${data.stats.updated}`,
      });
      refetch();
      setIsSyncing(false);
    },
    onError: (err) => {
      toast({
        title: 'Error syncing bookings',
        description: err.message,
        variant: 'destructive',
      });
      setIsSyncing(false);
    },
  });

  // Mutation for updating booking status
  const updateStatusMutation = trpc.cal.updateBookingStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Booking status updated',
        description: 'The booking status has been updated successfully.',
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: 'Error updating booking status',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for rescheduling bookings
  const rescheduleMutation = trpc.cal.rescheduleBooking.useMutation({
    onSuccess: () => {
      toast({
        title: 'Booking rescheduled',
        description: 'The booking has been rescheduled successfully.',
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: 'Error rescheduling booking',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  // Sync bookings
  const syncBookings = async () => {
    setIsSyncing(true);
    syncMutation.mutate();
  };

  // Update booking status
  const updateBookingStatus = async (uid: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    updateStatusMutation.mutate({ uid, status });
  };

  // Reschedule booking
  const rescheduleBooking = async (uid: string, newTime: { start: string; end: string }) => {
    rescheduleMutation.mutate({ uid, newTime });
  };

  // Filter bookings by status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  return {
    bookings: filteredBookings,
    allBookings: bookings,
    isLoading,
    error,
    isSyncing,
    filterStatus,
    setFilterStatus,
    syncBookings,
    updateBookingStatus,
    rescheduleBooking,
    refetch,
    isConfigured: configStatus?.configured || false,
  };
}