// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_edge_functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Stripe } from "https://esm.sh/stripe@12.18.0?dts"

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
});

// Handle HTTP request
serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Extract the request data
    const { payment_intent_id, appointment_id, customer_email } = await req.json();
    
    // Validate required fields
    if (!payment_intent_id || !appointment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: payment_intent_id, appointment_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status === 'succeeded') {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabaseAdmin
        .from('Appointment')
        .select('id, customerId, status, depositPaid')
        .eq('id', appointment_id)
        .single();
      
      if (appointmentError) {
        throw new Error(`Error fetching appointment: ${appointmentError.message}`);
      }
      
      if (!appointment) {
        throw new Error(`Appointment with ID ${appointment_id} not found`);
      }
      
      // Update appointment 
      const { error: updateError } = await supabaseAdmin
        .from('Appointment')
        .update({
          depositPaid: true,
          paymentId: payment_intent_id,
          status: 'confirmed',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', appointment_id);
      
      if (updateError) {
        throw new Error(`Error updating appointment: ${updateError.message}`);
      }
      
      // Create payment record
      const { error: paymentError } = await supabaseAdmin
        .from('Payment')
        .insert({
          bookingId: appointment_id,
          amount: paymentIntent.amount / 100, // Convert from cents to dollars
          paymentMethod: paymentIntent.payment_method_types[0] || 'card',
          status: 'completed',
          transactionId: payment_intent_id,
          customerEmail: customer_email,
          metadata: {
            stripe_payment_intent_id: payment_intent_id,
            appointment_id: appointment_id,
          },
        });
      
      if (paymentError) {
        throw new Error(`Error creating payment record: ${paymentError.message}`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          payment_intent: paymentIntent.id,
          appointment_id: appointment_id,
          status: 'confirmed',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Payment not yet successful
      return new Response(
        JSON.stringify({
          success: false,
          payment_intent: paymentIntent.id,
          status: paymentIntent.status,
          message: `Payment is ${paymentIntent.status}`,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing payment:`, errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});