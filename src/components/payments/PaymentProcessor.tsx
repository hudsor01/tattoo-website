'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { useCreatePaymentIntent, usePaymentStatus } from '@/hooks/usePayments';
import { PaymentIntentRequest } from '@/types/api-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Load Stripe outside of component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentProcessorProps {
  amount: number;
  email: string;
  name?: string;
  bookingId?: number;
  appointmentId?: string;
  paymentType?: string;
  description?: string;
  currency?: string;
  metadata?: Record<string, string>;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: Error) => void;
}

/**
 * A component that handles the entire payment processing flow
 * using tRPC for API communication and Stripe Elements for UI
 */
export default function PaymentProcessor({
  amount,
  email,
  name,
  bookingId,
  appointmentId,
  paymentType = 'deposit',
  description,
  currency = 'usd',
  metadata,
  onPaymentSuccess,
  onPaymentError,
}: PaymentProcessorProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Use tRPC mutation to create payment intent
  const createPaymentIntent = useCreatePaymentIntent();
  
  // Check payment status if we have a payment intent ID
  const { data: paymentStatus } = usePaymentStatus(paymentIntentId || undefined, {
    enabled: !!paymentIntentId && !paymentCompleted,
    refetchInterval: paymentCompleted ? false : 3000, // Poll every 3 seconds until completed
  });

  // Create the payment intent when the component mounts
  useEffect(() => {
    if (!clientSecret && !createPaymentIntent.isPending) {
      const paymentRequest: PaymentIntentRequest = {
        amount,
        email,
        name,
        bookingId,
        appointmentId,
        paymentType,
        description,
        currency,
        metadata,
      };

      createPaymentIntent.mutate(paymentRequest, {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        },
        onError: (error) => {
          if (onPaymentError) {
            onPaymentError(new Error(error.message));
          }
        },
      });
    }
  }, [amount, email, name, bookingId, appointmentId, paymentType, description, currency, metadata]);

  // Monitor payment status for completion
  useEffect(() => {
    if (paymentStatus?.status === 'succeeded') {
      setPaymentCompleted(true);
      if (onPaymentSuccess && paymentIntentId) {
        onPaymentSuccess(paymentIntentId);
      }
    }
  }, [paymentStatus, paymentIntentId, onPaymentSuccess]);

  // Handle payment submission success
  const handlePaymentSuccess = () => {
    // The payment status monitoring will handle this
  };

  // If not ready yet, show loading state
  if (!clientSecret || createPaymentIntent.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If payment is completed, show success message
  if (paymentCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your payment has been processed successfully.</p>
          <p className="text-sm text-muted-foreground mt-2">
            A receipt has been sent to your email.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show the payment form
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm
        email={email}
        amount={amount}
        onSuccess={handlePaymentSuccess}
      />
    </Elements>
  );
}