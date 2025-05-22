/**
 * tRPC Configuration
 * 
 * This file sets up the core tRPC configuration including:
 * - Router creation
 * - Middleware setup  
 * - Procedure builders
 * 
 * THIS IS A SERVER-SIDE ONLY FILE
 */

import 'server-only';
import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';
import superjson from 'superjson';
import { logger } from '@/lib/logger';

/**
 * Initialize tRPC with context and transformer
 */
export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause : null,
      },
    };
  },
});

/**
 * Create a tRPC router
 */
export const router = t.router;

/**
 * Create a middleware that runs before every procedure
 */
export const middleware = t.middleware;

/**
 * Reusable middleware for logging requests
 */
const loggerMiddleware = middleware(async ({ path, next, type }) => {
  const start = Date.now();
  
  const result = await next();
  
  const duration = Date.now() - start;
  logger.info(`[tRPC] ${type} ${path} - ${duration}ms`);
  
  return result;
});

/**
 * Public procedure - accessible without authentication
 */
export const publicProcedure = t.procedure
  .use(loggerMiddleware)
  .use(middleware(async ({ ctx, next }) => {
    return next({
      ctx: {
        ...ctx,
        db: ctx.prisma, // Add db alias for Prisma
      },
    });
  }));

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(loggerMiddleware).use(
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        db: ctx.prisma, // Add db alias for Prisma
      },
    });
  })
);

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = t.procedure.use(loggerMiddleware).use(
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    
    // Check if user is admin
    const isAdmin = ctx.user.user_metadata?.["role"] === 'admin' || 
                    ctx.user.app_metadata?.["role"] === 'admin';
    
    if (!isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You must be an admin to access this resource',
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        db: ctx.prisma, // Add db alias for Prisma
      },
    });
  })
);

/**
 * Create the root router type
 */
export const createRootRouter = router;