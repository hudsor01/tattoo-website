import { NextRequest, NextResponse } from 'next/server';
import { NextFetchEvent } from 'next/server';
import Stripe from 'stripe';
import { serverClient } from '@/lib/supabase/server';
import { sendAppointmentConfirmation } from '@/lib/email/email-service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Create a payment session for an appointment deposit
 *
 * This is an Edge Function optimized for performance
 */
// export const runtime = 'edge';

export async function POST(request: NextRequest, context: NextFetchEvent) {
  try {
    // Initialize Supabase client
    const supabase = serverClient();
    
    // Get authenticated session
    const { data: { session } } = await supabase.auth.getSession();

    // Check for authentication
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // Get appointment details with customer
    const { data: appointment, error } = await supabase
      .from('Appointment')
      .select(`
        *,
        customer:Customer(*)
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify deposit amount is set
    if (!appointment.deposit || appointment.deposit <= 0) {
      return NextResponse.json(
        { error: 'No deposit required for this appointment' },
        { status: 400 },
      );
    }

    // Format date for display in Stripe
    const appointmentDate = new Date(appointment.startDate).toLocaleString();
    
    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit for ${appointment.title}`,
              description: `Appointment on ${appointmentDate}`,
            },
            unit_amount: Math.round(appointment.deposit * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env['WEBSITE_URL']}/appointments/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env['WEBSITE_URL']}/appointments/${appointmentId}`,
      customer_email: appointment.customer?.email || undefined,
      client_reference_id: appointmentId,
      metadata: {
        appointmentId: appointmentId,
        customerId: appointment.customerId,
        paymentType: 'deposit',
      },
    });

    // Return checkout session URL
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating payment session:', error);

    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
  }
}

// Stripe webhook handler
export async function PUT(request: NextRequest) {
  try {
    // Get Stripe signature from header
    const signature = request.headers.get('stripe-signature') as string;
    if (!signature) {
      return NextResponse.json({ error: 'Stripe signature missing' }, { status: 400 });
    }

    // Get request body as text
    const body = await request.text();

    // Verify the webhook event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;

        if (!appointmentId) {
          throw new Error('Appointment ID missing from session metadata');
        }

        // Initialize Supabase client
        const supabase = serverClient();
        
        // Update appointment with deposit paid status
        const { error: updateError } = await supabase
          .from('Appointment')
          .update({
            depositPaid: true,
            status: 'confirmed',
          })
          .eq('id', appointmentId);
          
        if (updateError) {
          console.error('Failed to update appointment:', updateError);
          throw new Error('Failed to update appointment status');
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('Transaction')
          .insert({
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            status: 'completed',
            paymentMethod: 'card',
            transactionId: session.payment_intent as string,
            receiptUrl: (session as any).receipt_url, // May not be available
            notes: 'Deposit payment via Stripe',
            customerId: session.metadata?.customerId!,
            appointmentId: appointmentId,
          });
          
        if (transactionError) {
          console.error('Failed to create transaction record:', transactionError);
          throw new Error('Failed to record transaction');
        }

        // Send confirmation email
        await sendAppointmentConfirmation(appointmentId);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const appointmentId = paymentIntent.metadata?.appointmentId;

        if (appointmentId) {
          // Initialize Supabase client
          const supabase = serverClient();
          
          // Log failed payment attempt
          const { error: transactionError } = await supabase
            .from('Transaction')
            .insert({
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'failed',
              paymentMethod: 'card',
              transactionId: paymentIntent.id,
              notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
              customerId: paymentIntent.metadata?.customerId!,
              appointmentId: appointmentId,
            });
            
          if (transactionError) {
            console.error('Failed to record failed transaction:', transactionError);
            throw new Error('Failed to record failed transaction');
          }
        }

        break;
      }
    }

    // Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);

    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
