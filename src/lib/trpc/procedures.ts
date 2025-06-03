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

// Create auth middleware for Better Auth
const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    void logger.debug('Auth middleware: No userId found', {
      userId: ctx.userId,
      hasUser: !!ctx.user,
      userEmail: ctx.userEmail,
    });
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  void logger.debug('Auth middleware: User authenticated', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
  });

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user: ctx.user, // Better Auth session user
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
  void logger.info(`[tRPC] ${type} ${path} - ${duration}ms`);

  return result;
});

// Public procedure - accessible without authentication
export const publicProcedure = t.procedure.use(loggerMiddleware).use(
  middleware(async ({ ctx, next }) => {
    return next({
      ctx: {
        ...ctx,
        db: ctx.prisma, // Ensure prisma is passed
      },
    });
  })
);

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(loggerMiddleware).use(authMiddleware);

// Admin role middleware - checks if the user has admin role
const adminMiddleware = middleware(async ({ ctx, next }) => {
  // First ensure user is authenticated
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Then check if user has admin role
  // This assumes user object has a role property - adjust based on your auth implementation
  const hasAdminRole = ctx.user.role === 'admin';
  
  if (!hasAdminRole) {
    void logger.warn('Admin access attempt denied', {
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      action: 'admin_access_denied',
    });
    
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
  
  void logger.debug('Admin access granted', {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
  });
  
  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = t.procedure
  .use(loggerMiddleware)
  .use(authMiddleware)
  .use(adminMiddleware);