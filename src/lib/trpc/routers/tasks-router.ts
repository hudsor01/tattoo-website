/**
 * Tasks Router
 *
 * This router handles all task-related tRPC procedures.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router, protectedProcedure } from '../server';
import { serverClient } from '@/lib/supabase/server-client';

export const tasksRouter = router({
  /**
   * Get all tasks for the authenticated user
   */
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view tasks',
          });
        }
        
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error fetching tasks',
            cause: error,
          });
        }
        
        return tasks || [];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching tasks',
          cause: error,
        });
      }
    }),
    
  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      due_date: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create tasks',
          });
        }
        
        const { data: task, error } = await supabase
          .from('tasks')
          .insert({
            title: input.title,
            description: input.description,
            due_date: input.due_date,
            priority: input.priority,
            status: input.status,
            user_id: user.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error creating task',
            cause: error,
          });
        }
        
        return task;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating task',
          cause: error,
        });
      }
    }),
    
  /**
   * Update a task
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      due_date: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update tasks',
          });
        }
        
        // Verify user owns the task
        const { data: task, error: fetchError } = await supabase
          .from('tasks')
          .select('user_id')
          .eq('id', input.id)
          .single();
          
        if (fetchError || !task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
            cause: fetchError,
          });
        }
        
        if (task.user_id !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this task',
          });
        }
        
        // Prepare update data
        const updateData: Record<string, any> = {};
        if (input.title) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.due_date) updateData.due_date = input.due_date;
        if (input.priority) updateData.priority = input.priority;
        if (input.status) updateData.status = input.status;
        updateData.updated_at = new Date().toISOString();
        
        // Update the task
        const { data: updatedTask, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single();
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error updating task',
            cause: error,
          });
        }
        
        return updatedTask;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating task',
          cause: error,
        });
      }
    }),
    
  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = serverClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete tasks',
          });
        }
        
        // Verify user owns the task
        const { data: task, error: fetchError } = await supabase
          .from('tasks')
          .select('user_id')
          .eq('id', input.id)
          .single();
          
        if (fetchError || !task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
            cause: fetchError,
          });
        }
        
        if (task.user_id !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this task',
          });
        }
        
        // Delete the task
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', input.id);
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error deleting task',
            cause: error,
          });
        }
        
        return { success: true, id: input.id };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error deleting task',
          cause: error,
        });
      }
    }),
});