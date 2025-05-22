/**
 * Stripe Payment Service
 * 
 * This module handles all Stripe payment integrations including
 * payment intents, customer management, and webhook processing.
 */

import { prisma } from '@/lib/db/prisma';
import type { PaymentIntent, StripePaymentMethod, CheckoutSession } from '@/types/payments-types';
import type { Stripe as StripeType } from 'stripe';

// Initialize Stripe client with the API key, using dynamic import
// to avoid bundling issues in client components
let stripeInstance: StripeType;

// Safely get the Stripe instance only in server environment
const getStripe = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe can only be accessed on the server');
  }
  
  if (!stripeInstance) {
    // Using require to prevent bundling issues
     
    const { default: Stripe } = await import('stripe');
    stripeInstance = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2025-04-30.basil',
    });
  }
  
  return stripeInstance;
};

// Create a proxy that lazily initializes Stripe
export const stripe = new Proxy({} as StripeType, {
  get: async (target, prop) => {
    const stripeClient = await getStripe();
    return stripeClient[prop as keyof StripeType];
  },
});

/**
 * Create a payment intent for processing a payment
 */
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  customerId,
  metadata = {},
  description,
  receiptEmail
}: {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
}): Promise<PaymentIntent> {
  try {
    // Create the payment intent in Stripe
    const createData: StripeType.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true }
    };
    
    if (customerId !== undefined) createData.customer = customerId;
    if (metadata !== undefined) createData.metadata = metadata;
    if (description !== undefined) createData.description = description;
    if (receiptEmail !== undefined) createData.receipt_email = receiptEmail;
    
    const paymentIntent = await stripe.paymentIntents.create(createData);

    // Save the payment intent to our database as a transaction
    if (customerId) {
      const transactionData: any = {
        id: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
        paymentMethod: 'stripe',
        transactionId: paymentIntent.id,
        customerId: customerId,
      };
      
      if (description) {
        transactionData.notes = `${description}. Metadata: ${JSON.stringify(metadata)}`;
      }
      
      await prisma.transaction.create({ data: transactionData });
    }

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret!,
      amount,
      currency,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(
  email: string, 
  name?: string
): Promise<{ id: string }> {
  try {
    // First check if the customer already exists
    const existingCustomers = await stripe.customers.list({ email });
    
    if (existingCustomers.data.length > 0) {
      return { id: existingCustomers.data[0]!.id };
    }
    
    // Create new customer if not found
    const createData: StripeType.CustomerCreateParams = { email };
    if (name !== undefined) createData.name = name;
    
    const customer = await stripe.customers.create(createData);
    
    return { id: customer.id };
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
}

/**
 * Create a checkout session for hosted checkout
 */
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}: {
  lineItems: Array<{
    price_data?: {
      currency: string;
      product_data: {
        name: string;
        description?: string;
      };
      unit_amount: number;
    };
    price?: string;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<CheckoutSession> {
  try {
    const sessionData: StripeType.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl
    };
    
    if (customerId !== undefined) sessionData.customer = customerId;
    if (metadata !== undefined) sessionData.metadata = metadata;
    
    const session = await stripe.checkout.sessions.create(sessionData);
    
    return {
      id: session.id,
      url: session.url!
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Handle a webhook event from Stripe
 */
export async function handleWebhook(
  body: string,
  signature: string
): Promise<{ status: string; id: string; type: string }> {
  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env['STRIPE_WEBHOOK_SECRET']!
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as StripeType.PaymentIntent;
        await updatePaymentStatus(paymentIntent.id, 'succeeded');
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as StripeType.PaymentIntent;
        await updatePaymentStatus(paymentIntent.id, 'failed');
        break;
      }
      // Add other event types as needed
    }
    
    return {
      status: 'success',
      id: event.id,
      type: event.type
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}

/**
 * Update the status of a payment in our database
 */
async function updatePaymentStatus(
  paymentIntentId: string,
  status: string
): Promise<void> {
  await prisma.transaction.update({
    where: { id: paymentIntentId },
    data: { status }
  });
  
  // Additional logic for payment status changes can be added here
}

/**
 * Get payment methods for a customer
 */
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<StripePaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    
    return paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      } : null
    }));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

/**
 * Refund a payment 
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<{ id: string; status: string }> {
  try {
    const refundParams: StripeType.RefundCreateParams = {
      payment_intent: paymentIntentId
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    // Update our database
    await prisma.transaction.update({
      where: { id: paymentIntentId },
      data: { 
        status: 'refunded',
        notes: `Refunded. Refund ID: ${refund.id}`
      }
    });
    
    return {
      id: refund.id,
      status: refund.status || 'pending'
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
}
