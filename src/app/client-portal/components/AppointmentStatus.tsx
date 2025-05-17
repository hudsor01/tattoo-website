'use client';

import React from 'react';
import { useSupabaseSubscription } from '@/hooks/use-supabase-subscription';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import { CalendarCheck, Clock, DollarSign, MapPin, Info, Loader, CalendarX } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  details: string;
  status: string;
  depositPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Real-time appointment status component for client portal
 * Uses RLS policies and real-time subscriptions
 */
export default function AppointmentStatus() {
  const { user } = useAuth();

  // Subscribe to user's appointments with real-time updates
  // This uses RLS policies to only show the user's own appointments
  const {
    data: appointments,
    loading,
    error,
  } = useSupabaseSubscription<Appointment>({
    table: 'Appointment',
    select:
      'id, customerId, startDate, endDate, serviceType, details, status, depositPaid, createdAt, updatedAt',
    filterColumn: 'status',
    filterValue: 'scheduled',
    order: { column: 'startDate', ascending: true },
    limit: 1,
  });

  // Get the next appointment
  const nextAppointment = appointments?.[0];

  // Function to format time from now
  const formatTimeFromNow = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format appointment time
  const formatAppointmentTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status color based on appointment status
  const getStatusColor = (status: string, depositPaid: boolean) => {
    if (!depositPaid) return 'warning';

    switch (status) {
      case 'scheduled':
        return 'info';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={30} sx={{ mb: 2 }} />
          <Typography>Checking your appointment status...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography color="error">
            Error loading appointment status. Please try refreshing.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!nextAppointment) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2, color: 'text.secondary' }}>
            <CalendarX size={40} strokeWidth={1.5} />
          </Box>
          <Typography variant="h6" gutterBottom>
            No Upcoming Appointments
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You don&apos;t have any scheduled appointments at the moment.
          </Typography>
          <Button variant="contained" color="primary" component={Link} href="/booking">
            Book a Consultation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 1.5, color: 'primary.main' }}>
            <CalendarCheck size={28} strokeWidth={1.5} />
          </Box>
          <Box>
            <Typography variant="h6" component="h2">
              Your Next Appointment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimeFromNow(nextAppointment.startDate)}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={nextAppointment.depositPaid ? 'Deposit Paid' : 'Deposit Required'}
              color={getStatusColor(nextAppointment.status, nextAppointment.depositPaid)}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ color: 'text.secondary', mr: 2 }}>
              <Clock size={20} strokeWidth={1.5} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography>{formatAppointmentTime(nextAppointment.startDate)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ color: 'text.secondary', mr: 2 }}>
              <Info size={20} strokeWidth={1.5} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Service Type
              </Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>
                {nextAppointment.serviceType}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ color: 'text.secondary', mr: 2 }}>
              <MapPin size={20} strokeWidth={1.5} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography>Ink 37 Tattoo Studio, Dallas, TX</Typography>
            </Box>
          </Box>

          {!nextAppointment.depositPaid && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ color: 'warning.main', mr: 2 }}>
                <DollarSign size={20} strokeWidth={1.5} />
              </Box>
              <Box>
                <Typography variant="body2" color="warning.main" fontWeight="medium">
                  Deposit Required
                </Typography>
                <Typography variant="body2">
                  A $50 deposit is required to confirm your appointment
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {!nextAppointment.depositPaid ? (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href={`/client/payments/${nextAppointment.id}`}
              startIcon={<DollarSign size={16} />}
            >
              Pay Deposit
            </Button>
          ) : (
            <Button
              variant="outlined"
              component={Link}
              href={`/client/appointments/${nextAppointment.id}`}
            >
              View Details
            </Button>
          )}

          <MuiLink component={Link} href="/client/appointments" color="primary" underline="hover">
            View All Appointments
          </MuiLink>
        </Box>
      </CardContent>
    </Card>
  );
}
