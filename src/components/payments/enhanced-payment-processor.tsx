'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { useCreatePaymentIntent, usePaymentStatus } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { EnhancedErrorBoundary } from '@/components/error/enhanced-error-boundary';
import { ERROR_MESSAGES } from '@/lib/toast';
import { PaymentIntentRequest } from '@/types/api-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Load Stripe outside of component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface EnhancedPaymentProcessorProps {
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
 * Payment processor content component with enhanced error handling
 */
function PaymentProcessorContent({
  const toast = useToast();
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
}: EnhancedPaymentProcessorProps) {
  const { toast } = useToast();
  const { handleError, withErrorHandling } = useErrorHandling({
    component: 'PaymentProcessor',
    severity: 'high'
  });
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Use tRPC mutation to create payment intent
  const createPaymentIntent = useCreatePaymentIntent();
  
  // Check payment status if we have a payment intent ID
  const { data: paymentStatus, isError: isPaymentStatusError } = usePaymentStatus(paymentIntentId || undefined, {
    enabled: !!paymentIntentId && !paymentCompleted && !paymentFailed,
    refetchInterval: paymentCompleted || paymentFailed ? false : 3000, // Poll every 3 seconds until status changes
  });

  // Function to initialize the payment intent
  const initializePaymentIntent = withErrorHandling(async () => {
    if (clientSecret || createPaymentIntent.isPending) return;
    
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

    const data = await createPaymentIntent.mutateAsync(paymentRequest);
    setClientSecret(data.clientSecret);
    setPaymentIntentId(data.paymentIntentId);
    toast.info(`Payment initialized for ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`);
  }, { action: 'initialize-payment' });

  // Create the payment intent when the component mounts
  useEffect(() => {
    initializePaymentIntent();
  }, []);

  // Handle payment status errors
  useEffect(() => {
    if (isPaymentStatusError && paymentIntentId && !paymentCompleted && !paymentFailed) {
      handleError(new Error('Unable to check payment status'), { action: 'check-payment-status' });
    }
  }, [isPaymentStatusError, paymentIntentId, paymentCompleted, paymentFailed]);

  // Monitor payment status for completion
  useEffect(() => {
    if (paymentStatus?.status === 'succeeded') {
      setPaymentCompleted(true);
      toast.success('Payment processed successfully');
      
      if (onPaymentSuccess && paymentIntentId) {
        onPaymentSuccess(paymentIntentId);
      }
    } else if (paymentStatus?.status === 'canceled' || paymentStatus?.status === 'failed') {
      setPaymentFailed(true);
      
      // Show appropriate error message
      const errorMessage = paymentStatus.status === 'canceled' 
        ? 'Payment was canceled' 
        : 'Payment processing failed';
      
      toast.error(errorMessage, {
        action: {
          label: 'Try again',
          onClick: () => {
            // Reset states to retry
            setPaymentFailed(false);
            setClientSecret(null);
            setPaymentIntentId(null);
            setRetryCount(retryCount + 1);
          }
        }
      });
      
      if (onPaymentError) {
        onPaymentError(new Error(errorMessage));
      }
    }
  }, [paymentStatus, paymentIntentId, retryCount]);

  // Handle payment submission success
  const handlePaymentSuccess = () => {
    // The payment status monitoring will handle this
    toast.loading('Processing payment...');
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

  // If payment failed, show error message with retry option
  if (paymentFailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We encountered an issue processing your payment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try again or use a different payment method.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            // Reset states to retry
            setPaymentFailed(false);
            setClientSecret(null);
            setPaymentIntentId(null);
            setRetryCount(retryCount + 1);
          }}>
            Try Again
          </Button>
        </CardFooter>
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

/**
 * Enhanced Payment Processor Component with error boundary
 * 
 * A component that handles the entire payment processing flow
 * using tRPC for API communication and Stripe Elements for UI,
 * with enhanced error handling and recovery mechanisms.
 */
export function EnhancedPaymentProcessor(props: EnhancedPaymentProcessorProps) {
  return (
    <EnhancedErrorBoundary
      componentName="PaymentProcessor"
      title="Payment System Unavailable"
      description="We're having trouble connecting to our payment processor. Please try again later."
      showToast={true}
      severity="high"
      canRecover={true}
      errorContext={{
        action: 'payment-processing',
        additionalData: {
          amount: props.amount,
          paymentType: props.paymentType,
          appointmentId: props.appointmentId
        }
      }}
    >
      <PaymentProcessorContent {...props} />
    </EnhancedErrorBoundary>
  );
}

export default EnhancedPaymentProcessor;
