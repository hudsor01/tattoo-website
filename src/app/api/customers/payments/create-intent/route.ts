import { NextResponse } from 'next/server';
import {
  apiRoute,
  clientPaymentIntentSchema,
} from '@/lib/validations/validation-api-utils';
import { stripe } from '@/lib/services/stripe';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Create a payment intent for client portal payments
 */
export const POST = apiRoute({
  POST: {
    bodySchema: clientPaymentIntentSchema,
    handler: async (body) => {
      try {
        const { appointmentId, clientId, amount, clientEmail, name, description } = body;

        // Initialize Supabase client
        const supabase = await createClient();
        
        // Verify that the appointment exists and belongs to the client
        const { data: appointment, error } = await supabase
          .from('Appointment')
          .select('*')
          .eq('id', appointmentId)
          .eq('clientId', clientId)
          .single();

        if (error || !appointment) {
          return NextResponse.json(
            { error: "Appointment not found or doesn't belong to the client" },
            { status: 404 }
          );
        }

        // Add relevant metadata to payment intent
        const paymentMetadata: Record<string, string> = {
          appointmentId,
          clientId,
          source: 'client_portal',
        };

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          receipt_email: clientEmail,
          metadata: paymentMetadata,
          description: description || `Payment for appointment - ${name || clientEmail}`,
        });

        const response = {
          clientSecret: paymentIntent.client_secret!,
          paymentIntentId: paymentIntent.id,
          amount: amount,
          currency: paymentIntent.currency,
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error creating client payment intent:', error);
        return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
      }
    },
  },
});
