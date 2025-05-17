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
  Avatar,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ReceiptLong, Person, Event, AttachMoney } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { createClient } from '@/lib/supabase/client';
import { useRecentPayments } from '@/hooks/use-dashboard';

// Define types for component props
interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  date: string;
  customerId: string;
  clientName: string;
  clientEmail?: string;
  appointmentId?: string;
  appointmentTitle?: string | null;
}

interface RealtimePaymentsProps {
  limit?: number;
  initialPayments?: Payment[];
}

/**
 * Real-time payments component with tRPC and Supabase subscriptions
 */
export default function RealtimePayments({ limit = 5, initialPayments }: RealtimePaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const router = useRouter();

  // Fetch payments if not provided
  const { data, isLoading, error, refetch } = useRecentPayments(
    { status: 'all', limit, page: 1 },
    {
      // Skip the query if initial data was provided
      enabled: !initialPayments,
      // When data is fetched, update state
      onSuccess: data => {
        if (data?.payments) {
          setPayments(data.payments);
        }
      },
    },
  );

  // Set up Supabase realtime subscription
  useEffect(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.channel>;

    // Subscribe to changes in payments
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('payments-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Payment',
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

  // Get payment status chip with proper color
  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return <Chip size="small" label="Paid" color="success" />;
      case 'pending':
        return <Chip size="small" label="Pending" color="warning" />;
      case 'failed':
        return <Chip size="small" label="Failed" color="error" />;
      case 'refunded':
        return <Chip size="small" label="Refunded" color="info" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return 'Credit Card';
      case 'cash':
        return 'Cash';
      case 'venmo':
        return 'Venmo';
      case 'paypal':
        return 'PayPal';
      case 'cashapp':
        return 'Cash App';
      default:
        return method;
    }
  };

  // Format the date to be more human-readable
  const formatPaymentDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (err) {
      return dateStr;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title="Recent Payments"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            size="small"
            variant="text"
            onClick={() => router.push('/admin/dashboard/payments')}
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
            Error loading payments: {error.message}
          </Typography>
        ) : payments?.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No recent payments.
          </Typography>
        ) : (
          <Stack spacing={2} divider={<Box borderBottom={1} borderColor="divider" />}>
            {payments?.map(payment => (
              <Box key={payment.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: '#d62828',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{formatCurrency(payment.amount)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatPaymentMethod(payment.paymentMethod)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatPaymentDate(payment.date)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>{getStatusChip(payment.status)}</Box>
                </Box>

                <Box mt={1} ml={7}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{payment.clientName}</Typography>
                  </Box>
                  {payment.appointmentTitle && (
                    <Box display="flex" alignItems="center">
                      <Event fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{payment.appointmentTitle}</Typography>
                    </Box>
                  )}
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<ReceiptLong />}
                    onClick={() => router.push(`/admin/dashboard/payments/${payment.id}`)}
                  >
                    Details
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
