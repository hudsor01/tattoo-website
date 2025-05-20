import { NextResponse } from 'next/server';
import {
  apiRoute,
  paymentStatusCheckSchema,
  // paymentStatusResponseSchema is defined but unused
} from '@/lib/validations/validation-api-utils';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/services/stripe';

/**
 * Get payment status from Stripe or database
 */
export const GET = apiRoute({
  GET: {
    querySchema: paymentStatusCheckSchema,
    handler: async (query) => {
      try {
        const { id, source } = query;

        // Check payment status from database
        if (source === 'db') {
          const supabase = await createClient();
          
          const { data: payment, error } = await supabase
            .from('Payment')
            .select('*')
            .eq('paymentIntentId', id)
            .single();

          if (error || !payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
          }

          return NextResponse.json({
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            email: payment.email,
            bookingId: payment.bookingId,
            appointmentId: payment.appointmentId,
            source: 'supabase',
          });
        }

        // Check payment status from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(id);

        return NextResponse.json({
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          receipt_email: paymentIntent.receipt_email,
          metadata: paymentIntent.metadata,
          source: 'stripe',
        });
      } catch (error) {
        console.error('Error checking payment status:', error);
        return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
      }
    },
  },
});
