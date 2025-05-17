'use client';

import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Divider,
} from '@mui/material';
import { CreditCard, CheckCircleOutline } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/client';
import { PaymentFormProps } from '@/types/payments-types';

// Load stripe outside of render to avoid recreating stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentFormContent({
  appointmentId,
  bookingId,
  amount,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  onCancel,
  buttonText = 'Pay Now',
  description,
  paymentType = 'deposit',
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [emailInput, setEmailInput] = useState(customerEmail || '');
  const [nameInput, setNameInput] = useState(customerName || '');
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Get current user/customer ID
  useEffect(() => {
    const fetchCustomerId = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setCustomerId(data.user.id);
      }
    };

    fetchCustomerId();
  }, []);

  // Create payment intent on component mount
  useEffect(() => {
    const createIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine which endpoint to use based on available IDs
        const endpoint = appointmentId
          ? '/api/client/payments/create-intent'
          : '/api/payment/create-intent';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Appointment-specific fields
            appointmentId,
            clientId: customerId,

            // Booking-specific fields
            bookingId,

            // Common fields
            amount,
            email: emailInput,
            name: nameInput,
            paymentType,
            description,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError((err as Error).message);
        if (onError) {
          onError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0 && (appointmentId || bookingId) && (emailInput || customerEmail) && customerId) {
      createIntent();
    }
  }, [
    appointmentId,
    bookingId,
    amount,
    customerId,
    emailInput,
    customerEmail,
    nameInput,
    paymentType,
    description,
  ]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nameInput,
            email: emailInput,
          },
        },
        receipt_email: emailInput,
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }
      } else {
        throw new Error('Payment was not completed successfully');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError((err as Error).message);
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (succeeded) {
    return (
      <Box textAlign="center" p={3}>
        <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for your payment of {formatCurrency(amount)}.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A confirmation email has been sent to {emailInput}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {paymentType === 'deposit' ? 'Pay Deposit' : 'Payment'} - {formatCurrency(amount)}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <Box mb={3} mt={3}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          required
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Name on Card"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          disabled={loading}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          Card Details
        </Typography>
        <Box
          sx={{
            p: 2,
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
            },
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif',
                },
              },
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between">
        {onCancel && (
          <Button variant="outlined" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !stripe || !elements || !clientSecret}
          startIcon={loading ? <CircularProgress size={20} /> : <CreditCard />}
          sx={{ ml: onCancel ? 'auto' : 0 }}
        >
          {loading ? 'Processing...' : buttonText}
        </Button>
      </Box>
    </Box>
  );
}

export default function StripePaymentForm(props: PaymentFormProps) {
  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Elements stripe={stripePromise} options={options}>
        <PaymentFormContent {...props} />
      </Elements>
    </Paper>
  );
}
