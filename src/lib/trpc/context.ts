/**
 * TRPC Context Creation with Clerk Authentication
 * 
 * This file handles the creation of context for TRPC procedures.
 * The context includes access to the database via Prisma and user auth via Clerk.
 * 
 * THIS IS A SERVER-SIDE ONLY FILE
 */
import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

/**
 * Creates context for TRPC API route handlers
 */
export async function createTRPCContext({
  req,
  resHeaders,
}: {
  req: NextRequest;
  resHeaders: Headers;
}) {
  try {
    // Get Clerk auth state
    const authState = await auth();
    
    // Get request headers
    const requestHeaders = Object.fromEntries(req.headers.entries());
    
    // Log URL for debugging
    const url = req.url || '';
    const referer = req.headers.get('referer') || '';
    
    // Use our universal logger
    logger.debug('Creating tRPC context', {
      url,
      referer,
      userId: authState.userId,
      sessionId: authState.sessionId,
    });

    // Return the context with database access and auth
    return {
      req,
      resHeaders,
      headers: requestHeaders,
      prisma,
      auth: authState, // Clerk auth object
      userId: authState.userId, // Direct access to user ID
      url
    };
  } catch (error) {
    logger.error('Error creating TRPC context:', error);
    
    // Return a basic context even if there's an error
    return {
      req,
      resHeaders,
      headers: Object.fromEntries(req.headers.entries()),
      prisma,
      auth: null,
      userId: null,
      url: '',
    };
  }
}

/**
 * Context type based on the return value of createTRPCContext
 * with additional types for middleware-added properties
 */
export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>> & {
  // Include the db alias for prisma since middleware adds this
  db?: typeof prisma;
};

/**
 * Exported Context type for use in tRPC initialization
 */
export type Context = TRPCContext;

/**
 * Creates context for React Server Components
 * This is used when calling TRPC procedures from RSCs
 */
export async function createContextForRSC() {
  try {
    // Get Clerk auth state for RSC
    const authState = await auth();
    
    logger.debug('Creating RSC tRPC context', {
      userId: authState.userId,
      sessionId: authState.sessionId,
    });
    
    return {
      prisma,
      auth: authState, // Clerk auth object
      userId: authState.userId, // Direct access to user ID
      db: prisma, // Add db alias for consistency
    };
  } catch (error) {
    logger.error('Error creating RSC context:', error);
    
    return {
      prisma,
      auth: null,
      userId: null,
      db: prisma,
    };
  }
}