/**
 * tRPC Procedures
 * 
 * This file contains procedures for server-only usage.
 * Should not be imported by client components.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { logger } from '@/lib/logger';
import type { TRPCContext } from './context';

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

// Create auth middleware
const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.auth) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!, // Ensured by the check above
      auth: ctx.auth!, // Clerk auth object
      db: ctx.prisma, // Ensure prisma is passed
    },
  });
});

// Create admin middleware
const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.auth) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Check if user is admin using Clerk's role system
  // For now, we'll implement a simple admin check - later we can enhance with proper roles
  // Clerk stores roles in the user's publicMetadata
  const userMetadata = ctx.auth.sessionClaims?.publicMetadata as any;
  const userRole = userMetadata?.role || 'user';
  
  const isAdmin = userRole === 'admin' || 
                 (Array.isArray(userRole) && userRole.includes('admin'));
  
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!, // Ensured by the check above
      auth: ctx.auth!, // Clerk auth object
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

// Admin procedure - requires admin role
export const adminProcedure = t.procedure
  .use(loggerMiddleware)
  .use(adminMiddleware);