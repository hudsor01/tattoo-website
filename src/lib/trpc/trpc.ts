/**
 * tRPC server setup
 * 
 * This is your tRPC API configuration with authentication built-in
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { Context } from './context';

/**
 * Initialize tRPC with superjson transformer for dates and other complex types
 */
const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */

// Base router and procedure
export const router = t.router;
export const procedure = t.procedure;

// Public procedure - accessible to all users
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      // Infers the session is non-null
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  const isAdmin = ctx.session.user.roles?.includes('admin') || false;
  
  if (!isAdmin) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'You must be an admin to access this resource'
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Utility function to validate user ID matches the requested resource
export function validateUserAccess(userId: string, requestedUserId: string) {
  if (userId !== requestedUserId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You can only access your own resources',
    });
  }
}