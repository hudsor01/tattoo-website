import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/email/email';
// import { processBookingAsCRMContact } from '@/lib/services/crm';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { PaymentMetadata } from '@/types/payments-types';

// Initialize Stripe dynamically to prevent it from being included in client bundles
// This is a server-only file so we can safely use dynamic imports
let stripe: import('stripe').default;
import type { Stripe } from 'stripe'; // Import Stripe types

// Helper to get the Stripe instance
async function getStripe() {
  if (!stripe) {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
      apiVersion: '2025-04-30.basil',
    });
  }
  return stripe;
}

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Handler for Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      const signature = request.headers.get('stripe-signature') || '';

      if (!webhookSecret) {
        throw new Error('Stripe webhook secret is not configured');
      }

      const stripeInstance = await getStripe();
      event = stripeInstance.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return new NextResponse(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
      });
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      // Handle more events as needed

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    // Return a success response to Stripe
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error handling Stripe webhook:', error);

    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

/**
 * Handle a successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Get booking ID from metadata
    const bookingId = parseInt(paymentIntent.metadata?.bookingId ?? '0', 10);

    if (!bookingId) {
      logger.error('Payment intent has no booking ID:', paymentIntent.id);
      return;
    }

    const metadata: PaymentMetadata = {
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: paymentIntent.status,
      stripeChargeId: paymentIntent.latest_charge as string,
    };

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Update payment status in database
    const { error: paymentError } = await supabase
      .from('Payment')
      .update({
        status: 'verified',
        updatedAt: new Date().toISOString(),
        metadata: metadata,
      })
      .eq('transactionId', paymentIntent.id);
      
    if (paymentError) {
      logger.error('Error updating payment status:', paymentError);
    }

    // Update booking deposit status
    const { data: booking, error: bookingError } = await supabase
      .from('Booking')
      .update({
        depositPaid: true,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*')
      .single();
      
    if (bookingError) {
      logger.error('Error updating booking status:', bookingError);
      throw new Error('Failed to update booking');
    }

    // Clear cache
    cache.clear();

    // Send confirmation email
    try {
      // Generate the email content
      const emailContent = generateBookingConfirmationEmail({
        ...booking,
        preferredDate: booking.preferredDate.toISOString().split('T')[0],
        agreeToTerms: true,
        depositConfirmed: true,
        paymentMethod: 'stripe' as 'venmo' | 'cashapp' | 'paypal' | 'stripe',
      });

      // Send the email
      await sendEmail({
        to: { email: booking.email, name: booking.name },
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      logger.info(`Deposit confirmation email sent to ${booking.email} for booking ${bookingId}`);
    } catch (emailError) {
      logger.error('Error sending confirmation email:', emailError);
    }

    /* Update CRM - disabled temporarily
    try {
      await processBookingAsCRMContact(
        booking.name,
        booking.email,
        booking.phone,
        {
          ...booking,
          preferredDate: booking.preferredDate.toISOString().split('T')[0],
          depositPaid: true,
          paymentMethod: 'stripe',
          paymentId: paymentIntent.id
        }
      );

      logger.info(`CRM updated for ${booking.name} (booking ${bookingId})`);
    } catch (crmError) {
      logger.error('Error updating CRM:', crmError);
    }
    */

    // Log the success
    logger.info(`Payment succeeded for booking ${bookingId}: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
}

/**
 * Handle a failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Get booking ID from metadata
    const bookingId = parseInt(paymentIntent.metadata?.bookingId ?? '0', 10);

    if (!bookingId) {
      logger.error('Payment intent has no booking ID:', paymentIntent.id);
      return;
    }

    const metadata: PaymentMetadata = {
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: paymentIntent.status,
      stripeLastError: paymentIntent.last_payment_error?.message || 'Unknown error',
    };

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Update payment status in database
    const { error: paymentError } = await supabase
      .from('Payment')
      .update({
        status: 'failed',
        updatedAt: new Date().toISOString(),
        metadata: metadata,
      })
      .eq('transactionId', paymentIntent.id);
      
    if (paymentError) {
      logger.error('Error updating payment status for failed payment:', paymentError);
    }

    // Get booking to send failure email
    const { data: booking, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      logger.error(`Booking ${bookingId} not found for failed payment ${paymentIntent.id}`);
      return;
    }

    // Send payment failure email
    try {
      await sendEmail({
        to: { email: booking.email, name: booking.name },
        subject: 'Payment Failed for Your Tattoo Consultation',
        html: `
          <h2>Payment Failed</h2>
          <p>We were unable to process your payment for the tattoo consultation.</p>
          <p>Error: ${paymentIntent.last_payment_error?.message || 'Unknown error'}</p>
          <p>Please try again or contact us for assistance.</p>
        `,
        text: `
Payment Failed

We were unable to process your payment for the tattoo consultation.

Error: ${paymentIntent.last_payment_error?.message || 'Unknown error'}

Please try again or contact us for assistance.
        `,
      });

      logger.info(`Payment failure email sent to ${booking.email} for booking ${bookingId}`);
    } catch (emailError) {
      logger.error('Error sending payment failure email:', emailError);
    }

    // Log the failure
    logger.info(`Payment failed for booking ${bookingId}: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

/**
 * Handle a refunded charge
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Get payment intent ID
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      logger.error('Charge has no payment intent ID:', charge.id);
      return;
    }

    // Get the payment intent to get booking ID
    const stripeClient = await getStripe();
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    const bookingId = parseInt(paymentIntent.metadata?.bookingId ?? '0', 10);

    if (!bookingId) {
      logger.error('Payment intent has no booking ID:', paymentIntentId);
      return;
    }

    const metadata: PaymentMetadata = {
      stripeChargeId: charge.id,
      stripeRefundId: charge.refunds?.data?.[0]?.id,
      refundAmount: charge.amount_refunded / 100,
      refundReason: charge.refunds?.data?.[0]?.reason || undefined,
    };

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Update payment status in database
    const { error: paymentError } = await supabase
      .from('Payment')
      .update({
        status: 'refunded',
        updatedAt: new Date().toISOString(),
        metadata: metadata,
      })
      .eq('transactionId', paymentIntentId);
      
    if (paymentError) {
      logger.error('Error updating payment status for refund:', paymentError);
    }

    // Get booking for refund notification
    const { data: booking, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      logger.error(`Booking ${bookingId} not found for refund ${charge.id}`);
      return;
    }

    // Send refund notification email to admin
    try {
      await sendEmail({
        to: {
          email: process.env.ADMIN_EMAIL || 'fernando@ink37tattoos.com',
          name: 'Fernando Govea',
        },
        subject: `Refund Processed for Booking #${bookingId}`,
        html: `
          <h2>Payment Refunded</h2>
          <p>A refund has been processed for booking #${bookingId}.</p>
          <p>Customer: ${booking.name} (${booking.email})</p>
          <p>Refund Amount: $${charge.amount_refunded / 100}</p>
          <p>Reason: ${charge.refunds?.data?.[0]?.reason || 'Unknown'}</p>
        `,
        text: `
Payment Refunded

A refund has been processed for booking #${bookingId}.

Customer: ${booking.name} (${booking.email})
Refund Amount: $${charge.amount_refunded / 100}
Reason: ${charge.refunds?.data?.[0]?.reason || 'Unknown'}
        `,
      });

      logger.info(`Refund notification sent for booking ${bookingId}`);
    } catch (emailError) {
      logger.error('Error sending refund notification:', emailError);
    }

    // Log the refund
    logger.info(`Payment refunded for booking ${bookingId}: ${charge.id}`);
  } catch (error) {
    logger.error('Error handling refund:', error);
  }
}

/**
 * Handle a dispute created for a charge
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Get charge ID
    const chargeId = dispute.charge as string;

    if (!chargeId) {
      logger.error('Dispute has no charge ID:', dispute.id);
      return;
    }

    // Get the charge to get payment intent
    const stripeInstance = await getStripe();
    const charge = await stripeInstance.charges.retrieve(chargeId);
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      logger.error('Charge has no payment intent ID:', chargeId);
      return;
    }

    // Get the payment intent to get booking ID
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    const bookingId = parseInt(paymentIntent.metadata?.bookingId ?? '0', 10);

    if (!bookingId) {
      logger.error('Payment intent has no booking ID:', paymentIntentId);
      return;
    }

    const metadata: PaymentMetadata = {
      stripeChargeId: chargeId,
      stripeDisputeId: dispute.id,
      disputeReason: dispute.reason,
      disputeStatus: dispute.status,
      disputeAmount: dispute.amount / 100,
    };

    // Initialize Supabase client
    const supabase = await createClient();
    
    // Update payment status in database
    const { error: paymentError } = await supabase
      .from('Payment')
      .update({
        status: 'disputed',
        updatedAt: new Date().toISOString(),
        metadata: metadata,
      })
      .eq('transactionId', paymentIntentId);
      
    if (paymentError) {
      logger.error('Error updating payment status for dispute:', paymentError);
    }

    // Get booking for dispute notification
    const { data: booking, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      logger.error(`Booking ${bookingId} not found for dispute ${dispute.id}`);
      return;
    }

    // Send dispute notification email to admin
    try {
      await sendEmail({
        to: {
          email: process.env.ADMIN_EMAIL || 'fernando@ink37tattoos.com',
          name: 'Fernando Govea',
        },
        subject: `URGENT: Dispute Filed for Booking #${bookingId}`,
        html: `
          <h2>Payment Disputed</h2>
          <p>A dispute has been filed for booking #${bookingId}.</p>
          <p>Customer: ${booking.name} (${booking.email})</p>
          <p>Dispute Amount: $${dispute.amount / 100}</p>
          <p>Reason: ${dispute.reason}</p>
          <p>Please log in to your Stripe dashboard to respond to this dispute immediately.</p>
        `,
        text: `
URGENT: Payment Disputed

A dispute has been filed for booking #${bookingId}.

Customer: ${booking.name} (${booking.email})
Dispute Amount: $${dispute.amount / 100}
Reason: ${dispute.reason}

Please log in to your Stripe dashboard to respond to this dispute immediately.
        `,
      });

      logger.info(`Dispute notification sent for booking ${bookingId}`);
    } catch (emailError) {
      logger.error('Error sending dispute notification:', emailError);
    }

    // Log the dispute
    logger.info(`Dispute created for booking ${bookingId}: ${dispute.id}`);
  } catch (error) {
    logger.error('Error handling dispute:', error);
  }
}
