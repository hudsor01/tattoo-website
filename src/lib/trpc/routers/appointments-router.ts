/**
 * Appointments Router
 *
 * This router handles all appointment-related tRPC procedures.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from '../server';
import { serverClient } from '@/lib/supabase/server-client';

export const appointmentsRouter = router({
  /**
   * Get all appointments for the authenticated user
   */
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view appointments',
          });
        }
        
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('client_id', user.id)
          .order('start_date', { ascending: false });
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error fetching appointments',
            cause: error,
          });
        }
        
        return appointments;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching appointments',
          cause: error,
        });
      }
    }),
    
  /**
   * Get a specific appointment by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view appointments',
          });
        }
        
        const { data: appointment, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', input.id)
          .eq('client_id', user.id)
          .single();
          
        if (error || !appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
            cause: error,
          });
        }
        
        return appointment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching appointment',
          cause: error,
        });
      }
    }),
    
  /**
   * Create a new appointment
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      start_date: z.date(),
      end_date: z.date().optional(),
      client_id: z.string().uuid().optional(),
      artist_id: z.string().uuid(),
      status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).default('scheduled'),
      deposit_paid: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create appointments',
          });
        }
        
        // Calculate end time if not provided (default to 2 hours after start)
        const endDate = input.end_date || new Date(input.start_date.getTime() + 2 * 60 * 60 * 1000);
        
        const { data: appointment, error } = await supabase
          .from('appointments')
          .insert({
            title: input.title,
            description: input.description,
            start_date: input.start_date.toISOString(),
            end_date: endDate.toISOString(),
            client_id: input.client_id || user.id,
            artist_id: input.artist_id,
            status: input.status,
            deposit_paid: input.deposit_paid,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error creating appointment',
            cause: error,
          });
        }
        
        return appointment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating appointment',
          cause: error,
        });
      }
    }),
    
  /**
   * Update an existing appointment
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      start_date: z.date().optional(),
      end_date: z.date().optional(),
      status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
      deposit_paid: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update appointments',
          });
        }
        
        // Verify user owns the appointment or is an artist/admin
        const { data: appointment, error: fetchError } = await supabase
          .from('appointments')
          .select('*, client_id')
          .eq('id', input.id)
          .single();
          
        if (fetchError || !appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
            cause: fetchError,
          });
        }
        
        if (appointment.client_id !== user.id) {
          // Check if user is artist or admin (would need role info)
          const { data: userInfo } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (!userInfo || !['admin', 'artist'].includes(userInfo.role)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You do not have permission to update this appointment',
            });
          }
        }
        
        // Prepare update data
        const updateData: Record<string, any> = {};
        if (input.title) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.start_date) updateData.start_date = input.start_date.toISOString();
        if (input.end_date) updateData.end_date = input.end_date.toISOString();
        if (input.status) updateData.status = input.status;
        if (input.deposit_paid !== undefined) updateData.deposit_paid = input.deposit_paid;
        updateData.updated_at = new Date().toISOString();
        
        // Update the appointment
        const { data: updatedAppointment, error } = await supabase
          .from('appointments')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error updating appointment',
            cause: error,
          });
        }
        
        return updatedAppointment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating appointment',
          cause: error,
        });
      }
    }),
    
  /**
   * Cancel an appointment
   */
  cancel: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to cancel appointments',
          });
        }
        
        // Verify user owns the appointment
        const { data: appointment, error: fetchError } = await supabase
          .from('appointments')
          .select('client_id, status')
          .eq('id', input.id)
          .single();
          
        if (fetchError || !appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
            cause: fetchError,
          });
        }
        
        if (appointment.client_id !== user.id) {
          // Check if user is artist or admin (would need role info)
          const { data: userInfo } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (!userInfo || !['admin', 'artist'].includes(userInfo.role)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You do not have permission to cancel this appointment',
            });
          }
        }
        
        if (appointment.status === 'cancelled') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This appointment is already cancelled',
          });
        }
        
        if (appointment.status === 'completed') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel a completed appointment',
          });
        }
        
        // Update the appointment to cancelled
        const { data: updatedAppointment, error } = await supabase
          .from('appointments')
          .update({
            status: 'cancelled',
            cancellation_reason: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error cancelling appointment',
            cause: error,
          });
        }
        
        return updatedAppointment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error cancelling appointment',
          cause: error,
        });
      }
    }),
});