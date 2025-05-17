'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Check, Payments, ReceiptLong, ErrorOutline } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';

interface PaymentStatusTrackerProps {
  transactionId?: string;
  appointmentId?: string;
  status?: string;
  paymentType?: 'deposit' | 'full' | 'other';
  showTitle?: boolean;
}

/**
 * Component to track payment status with realtime updates
 */
export default function PaymentStatusTracker({
  transactionId,
  appointmentId,
  status: initialStatus,
  paymentType = 'deposit',
  showTitle = true,
}: PaymentStatusTrackerProps) {
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [loading, setLoading] = useState(!initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Steps in the payment process
  const steps = [
    { label: 'Processing Payment', icon: <Payments /> },
    { label: 'Payment Verified', icon: <Check /> },
    { label: 'Receipt Generated', icon: <ReceiptLong /> },
  ];

  // Map status to step
  useEffect(() => {
    switch (status) {
      case 'pending':
        setActiveStep(0);
        break;
      case 'verified':
      case 'completed':
        setActiveStep(1);
        break;
      case 'receipt_ready':
        setActiveStep(2);
        break;
      case 'failed':
        setActiveStep(-1); // Special case for failure
        break;
      default:
        setActiveStep(0);
    }
  }, [status]);

  // If transactionId is provided, check status periodically
  useEffect(() => {
    if (!transactionId) return;

    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment/status?id=${transactionId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }

        const data = await response.json();
        setStatus(data.status);

        // If payment is still pending, check again in a few seconds
        if (data.status === 'pending') {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        // Use structured logging in production
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [transactionId]);

  // If appointmentId is provided, set up realtime subscription
  useEffect(() => {
    if (!appointmentId) return;

    const supabase = createClient();
    let subscription: unknown;

    const fetchInitialStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Payment')
          .select('status, transactionId')
          .eq('appointmentId', appointmentId)
          .order('createdAt', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          setStatus(data.status);
          // If we found a transaction ID and didn't have one before, store it
          // Store transaction ID for future reference if needed
          if (data.transactionId && !transactionId) {
            // In production, we'd store or use this ID
            // but we don't need to log it
          }
        }
      } catch (err) {
        // Don't set error here, as the payment might not exist yet
        // Use structured logging in production
      } finally {
        setLoading(false);
      }
    };

    // Set up realtime subscription
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('payment-status')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Payment',
              filter: `appointmentId=eq.${appointmentId}`,
            },
            payload => {
              if (payload.new && 'status' in payload.new) {
                setStatus(payload.new.status as string);
              }
            },
          )
          .subscribe();
      } catch (err) {
        // Use structured logging in production
        // Non-critical error, can continue without subscription
      }
    };

    fetchInitialStatus();
    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [appointmentId, transactionId]);

  // Render appropriate status message
  const renderStatusMessage = () => {
    if (loading) {
      return (
        <Box display="flex" alignItems="center">
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Checking payment status...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <Typography variant="body2" color="text.secondary">
            Your payment is being processed. This might take a moment.
          </Typography>
        );
      case 'verified':
      case 'completed':
        return (
          <Typography variant="body2" color="success.main">
            Your payment has been successfully processed. Thank you!
          </Typography>
        );
      case 'failed':
        return (
          <Alert severity="error" sx={{ mt: 2 }}>
            Payment failed. Please try again or contact support.
          </Alert>
        );
      case 'refunded':
        return (
          <Alert severity="info" sx={{ mt: 2 }}>
            This payment has been refunded.
          </Alert>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            {status}
          </Typography>
        );
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom>
          {paymentType === 'deposit' ? 'Deposit' : 'Payment'} Status
        </Typography>
      )}

      {status === 'failed' ? (
        <Alert severity="error" icon={<ErrorOutline />} sx={{ mb: 2 }}>
          Payment failed. Please try again or contact support.
        </Alert>
      ) : (
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor:
                        index < activeStep
                          ? 'success.main'
                          : index === activeStep
                            ? 'primary.main'
                            : 'action.disabled',
                      color: 'white',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Box mt={3}>{renderStatusMessage()}</Box>
    </Paper>
  );
}
