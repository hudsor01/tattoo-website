import { NextRequest, NextResponse } from 'next/server';
import {
  apiRoute,
  createPaymentIntentSchema,
  paymentIntentResponseSchema,
} from '@/lib/validations/validation-api-utils';
import { stripe } from '@/lib/services/stripe';

export const dynamic = 'force-dynamic';

/**
 * Create a payment intent for standard bookings
 */
export const POST = apiRoute({
  POST: {
    bodySchema: createPaymentIntentSchema,
    handler: async (body, request) => {
      try {
        const {
          amount,
          email,
          name,
          bookingId,
          appointmentId,
          clientId,
          currency,
          description,
          paymentType,
          metadata = {},
        } = body;

        // Add relevant metadata to payment intent
        const paymentMetadata: Record<string, string> = {
          ...metadata,
          ...(bookingId ? { bookingId: bookingId.toString() } : {}),
          ...(appointmentId ? { appointmentId } : {}),
          ...(clientId ? { clientId } : {}),
          paymentType,
        };

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency || 'usd',
          receipt_email: email,
          metadata: paymentMetadata,
          description: description || `Payment for ${paymentType} - ${name || email}`,
        });

        const response = {
          clientSecret: paymentIntent.client_secret!,
          paymentIntentId: paymentIntent.id,
          amount: amount,
          currency: paymentIntent.currency,
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
      }
    },
  },
});
