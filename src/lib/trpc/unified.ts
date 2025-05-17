/**
 * Unified tRPC Implementation
 * 
 * This file provides a single entry point for both client and server-side
 * tRPC functionality to avoid duplication and ensure consistency.
 */

import { TRPCError, initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { prisma } from '../db/prisma';
import type { Context } from './context';

// Initialize tRPC with context type
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
        code: error.code,
      },
      message: error.message,
    };
  },
});

/**
 * Middleware to require authenticated user
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      // Enhance context with typed user
      user: ctx.user,
      ...ctx,
    },
  });
});

/**
 * Middleware to require user with admin role
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Check if user has admin role
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  return next({
    ctx: {
      user: ctx.user,
      ...ctx,
    },
  });
});

/**
 * Middleware to add prisma instance to context
 */
const withPrisma = t.middleware(async ({ ctx, next }) => {
  return next({
    ctx: {
      db: prisma,
      ...ctx,
    },
  });
});

/**
 * Middleware to add logging
 */
const withLogging = t.middleware(async ({ ctx, path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);
  }
  
  return result;
});

// Export router creator
export const router = t.router;
export const middleware = t.middleware;

// Base procedure with database access and logging
export const publicProcedure = t.procedure
  .use(withPrisma)
  .use(withLogging);

// Protected procedures
export const protectedProcedure = publicProcedure.use(isAuthenticated);
export const adminProcedure = protectedProcedure.use(isAdmin);

// Export merged router type
export type Router = typeof router;

// Create a root router to merge all sub-routers
export function createRootRouter() {
  return router({});
}