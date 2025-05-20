/**
 * Payments Router
 *
 * This router handles all payment-related tRPC procedures.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../server';
import { createClient } from '@/lib/supabase/server';

export const paymentsRouter = router({
  /**
   * Get all payments for the authenticated user
   */
  getUserPayments: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view payments',
          });
        }
        
        // Build the query
        let query = supabase
          .from('payments')
          .select('*, appointments(*)')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(input.limit);
          
        // Apply cursor if provided
        if (input.cursor) {
          query = query.gte('id', input.cursor);
        }
        
        const { data: payments, error } = await query;
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error fetching payments',
            cause: error,
          });
        }
        
        // Get the next cursor
        let nextCursor: number | null = null;
        if (payments.length === input.limit) {
          nextCursor = payments[payments.length - 1].id;
        }
        
        return {
          items: payments,
          nextCursor,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching payments',
          cause: error,
        });
      }
    }),
    
  /**
   * Get payment by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view payments',
          });
        }
        
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*, appointments(*)')
          .eq('id', input.id)
          .eq('client_id', user.id)
          .single();
          
        if (error || !payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found',
            cause: error,
          });
        }
        
        return payment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching payment',
          cause: error,
        });
      }
    }),
    
  /**
   * Create payment intent for Stripe
   */
  createPaymentIntent: protectedProcedure
    .input(z.object({
      amount: z.number().min(1),
      appointmentId: z.string().uuid().optional(),
      bookingId: z.number().int().positive().optional(),
      paymentType: z.enum(['deposit', 'full', 'installment']).default('deposit'),
      currency: z.string().length(3).default('usd'),
      metadata: z.record(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create a payment intent',
          });
        }
        
        // Get user details for the payment
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (userError || !userData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error fetching user details',
            cause: userError,
          });
        }
        
        // Verify appointment belongs to user if appointmentId is provided
        if (input.appointmentId) {
          const { data: appointment, error: appointmentError } = await supabase
            .from('appointments')
            .select('client_id')
            .eq('id', input.appointmentId)
            .single();
            
          if (appointmentError || !appointment) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Appointment not found',
              cause: appointmentError,
            });
          }
          
          if (appointment.client_id !== user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You do not have permission to create a payment for this appointment',
            });
          }
        }
        
        // Create a payment intent (for build, we'll stub this)
        // In a real implementation, this would call Stripe API
        const paymentIntent = {
          id: `pi_${Date.now()}${Math.floor(Math.random() * 1000)}`,
          client_secret: `pi_${Date.now()}${Math.floor(Math.random() * 1000)}_secret_${Math.floor(Math.random() * 1000)}`,
          amount: input.amount,
          currency: input.currency,
          status: 'requires_payment_method',
        };
        
        // Record the payment intent in the database
        const { error } = await supabase
          .from('payments')
          .insert({
            client_id: user.id,
            appointment_id: input.appointmentId,
            booking_id: input.bookingId,
            amount: input.amount,
            currency: input.currency,
            payment_type: input.paymentType,
            payment_intent_id: paymentIntent.id,
            payment_method: 'card',
            status: 'pending',
            metadata: input.metadata,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error creating payment record',
            cause: error,
          });
        }
        
        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: input.amount,
          currency: input.currency,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating payment intent',
          cause: error,
        });
      }
    }),
    
  /**
   * Check payment status
   */
  checkPaymentStatus: protectedProcedure
    .input(z.object({
      paymentIntentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to check payment status',
          });
        }
        
        // Check payment in database
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*')
          .eq('payment_intent_id', input.paymentIntentId)
          .eq('client_id', user.id)
          .single();
          
        if (error || !payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payment not found',
            cause: error,
          });
        }
        
        return {
          status: payment.status,
          amount: payment.amount,
          paymentId: payment.id,
          paymentIntentId: payment.payment_intent_id,
          createdAt: payment.created_at,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error checking payment status',
          cause: error,
        });
      }
    }),
});