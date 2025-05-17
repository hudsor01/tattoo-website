/**
 * tRPC server initialization
 * 
 * This file exports the base tRPC server instance with user session context
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Context type for tRPC procedures
 */
export interface Context {
  session: {
    user?: {
      id: string;
      email: string;
      roles?: string[];
    };
  } | null;
}

/**
 * Create a new tRPC instance with superjson transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure builders
 */
export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;

/**
 * Public procedure that doesn't require authentication
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure middleware that requires authentication
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/**
 * Admin procedure middleware that requires authentication and admin role
 */
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  const userRoles = ctx.session.user.roles || [];
  const isAdmin = userRoles.includes('admin');
  
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user: ctx.session.user,
      },
    },
  });
});

/**
 * Admin procedure that requires authentication and admin role
 */
export const adminProcedure = t.procedure.use(isAdmin);

/**
 * Utility function to check if a user has a specific role
 */
export function hasRole(user: Context['session']['user'], role: string): boolean {
  if (!user) return false;
  const userRoles = user.roles || [];
  return userRoles.includes(role);
}