'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Button,
} from '@mui/material';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { Edit, Phone, Delete, CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { createClient } from '@/lib/supabase/client';
import { useUpcomingAppointments } from '@/hooks/use-dashboard';

// Define types for component props
interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  customerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  depositPaid: boolean;
  depositAmount: number;
  price: number;
  description: string;
}

interface RealtimeAppointmentsProps {
  limit?: number;
  initialAppointments?: Appointment[];
}

/**
 * Real-time appointments component with tRPC and Supabase subscriptions
 */
export default function RealtimeAppointments({
  limit = 5,
  initialAppointments,
}: RealtimeAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const router = useRouter();
  const utils = trpc.useContext();

  // Fetch appointments if not provided
  const { data, isLoading, error, refetch } = useUpcomingAppointments(
    { status: 'all', limit, page: 1 },
    {
      // Skip the query if initial data was provided
      enabled: !initialAppointments,
      // When data is fetched, update state
      onSuccess: data => {
        if (data?.appointments) {
          setAppointments(data.appointments);
        }
      },
    },
  );

  // Set up Supabase realtime subscription
  useEffect(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.channel>;

    // Subscribe to changes in appointments
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('appointments-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Appointment',
            },
            () => {
              // Refresh data when changes occur
              refetch();
            },
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up subscription:', err);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [refetch, limit]);

  // Confirm appointment mutation
  const confirmMutation = trpc.dashboard.confirmAppointment.useMutation({
    // Optimistically update the UI
    onMutate: async appointmentId => {
      // Cancel any outgoing refetches
      await utils.dashboard.getUpcomingAppointments.cancel();

      // Get snapshot of current appointments
      const previousAppointments = utils.dashboard.getUpcomingAppointments.getData({
        status: 'all',
        limit,
        page: 1,
      });

      // Optimistically update to the new value
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === appointmentId ? { ...appointment, status: 'confirmed' } : appointment,
        ),
      );

      // Return a context object with the snapshot
      return { previousAppointments };
    },

    // If the mutation fails, rollback to the previous value
    onError: (err, appointmentId, context) => {
      console.error('Error confirming appointment:', err);

      if (context?.previousAppointments) {
        setAppointments(context.previousAppointments.appointments || []);
      }
    },

    // Always refetch after mutating to ensure data consistency
    onSettled: () => {
      utils.dashboard.getUpcomingAppointments.invalidate();
    },
  });

  // Get appointment status component with proper color
  const getStatusChip = (appointment: Appointment) => {
    const { status, depositPaid } = appointment;

    if (!depositPaid) {
      return <Chip size="small" label="Deposit Required" color="warning" />;
    }

    switch (status) {
      case 'scheduled':
        return <Chip size="small" label="Scheduled" color="info" />;
      case 'confirmed':
        return <Chip size="small" label="Confirmed" color="success" />;
      case 'completed':
        return <Chip size="small" label="Completed" color="secondary" />;
      case 'cancelled':
        return <Chip size="small" label="Cancelled" color="error" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Format the date/time to be more human-readable
  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      let prefix = '';

      if (isToday(date)) {
        prefix = 'Today';
      } else if (isTomorrow(date)) {
        prefix = 'Tomorrow';
      } else if (date < addDays(new Date(), 7)) {
        prefix = format(date, 'EEEE'); // Day of week
      } else {
        return format(date, 'PPP');
      }

      return `${prefix}, ${format(date, 'h:mm a')}`;
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title="Upcoming Appointments"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            size="small"
            variant="text"
            onClick={() => router.push('/admin/dashboard/appointments')}
          >
            View All
          </Button>
        }
      />

      <CardContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            Error loading appointments: {error.message}
          </Typography>
        ) : appointments?.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No upcoming appointments scheduled.
          </Typography>
        ) : (
          <Stack spacing={2} divider={<Box borderBottom={1} borderColor="divider" />}>
            {appointments?.map(appointment => (
              <Box key={appointment.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1">
                      {appointment.clientName || 'Unknown Client'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatAppointmentDate(appointment.startTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.title}
                    </Typography>
                  </Box>

                  <Box>{getStatusChip(appointment)}</Box>
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button
                    size="small"
                    startIcon={<Phone />}
                    sx={{ mr: 1 }}
                    onClick={() => {
                      if (appointment.clientPhone) {
                        window.open(`tel:${appointment.clientPhone}`, '_blank');
                      }
                    }}
                    disabled={!appointment.clientPhone}
                  >
                    Call
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<Edit />}
                    sx={{ mr: 1 }}
                    onClick={() => router.push(`/admin/dashboard/appointments/${appointment.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => confirmMutation.mutate(appointment.id)}
                    disabled={appointment.status === 'confirmed' || confirmMutation.isLoading}
                  >
                    {confirmMutation.isLoading && confirmMutation.variables === appointment.id ? (
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                    ) : null}
                    Confirm
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
