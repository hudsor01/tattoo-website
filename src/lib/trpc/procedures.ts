/**
 * tRPC Procedures
 * 
 * This file contains procedures for server-only usage.
 * Should not be imported by client components.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { logger } from '@/lib/logger';
import type { TRPCContext } from './types/context';

// Initialize tRPC with context
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof Error ? error.cause : null,
    },
  }),
});

// Export reusable router and procedure helpers
export const router = t.router;
export const middleware = t.middleware;

// Create auth middleware for Clerk
const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    logger.debug('Auth middleware: No userId found', { 
      userId: ctx.userId, 
      hasUser: !!ctx.user,
      userEmail: ctx.userEmail 
    });
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  logger.debug('Auth middleware: User authenticated', { 
    userId: ctx.userId, 
    userEmail: ctx.userEmail 
  });
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user: ctx.user, // Clerk session claims (can be null)
      userEmail: ctx.userEmail, // User email
      db: ctx.prisma, // Ensure prisma is passed
    },
  });
});

// Create logger middleware
const loggerMiddleware = middleware(async ({ path, next, type }) => {
  const start = Date.now();
  
  const result = await next();
  
  const duration = Date.now() - start;
  logger.info(`[tRPC] ${type} ${path} - ${duration}ms`);
  
  return result;
});

// Public procedure - accessible without authentication
export const publicProcedure = t.procedure
  .use(loggerMiddleware)
  .use(middleware(async ({ ctx, next }) => {
    return next({
      ctx: {
        ...ctx,
        db: ctx.prisma, // Ensure prisma is passed
      },
    });
  }));

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(authMiddleware);

// Admin procedure - now just an alias for protected since all signed-in users are admins
export const adminProcedure = protectedProcedure;