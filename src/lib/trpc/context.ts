/**
 * TRPC Context Creation with Clerk Authentication
 * 
 * This file handles the creation of context for TRPC procedures.
 * The context includes access to the database via Prisma and user auth via Clerk.
 * 
 * THIS IS A SERVER-SIDE ONLY FILE
 */
import 'server-only';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import type { PrismaClient } from '@prisma/client';
import type { CustomSessionClaims } from '@/types/clerk-types';

/**
 * Base tRPC context interface
 */
export interface TRPCContext {
  req?: NextRequest;
  resHeaders?: Headers;
  headers?: Record<string, string>;
  prisma: PrismaClient;
  user: CustomSessionClaims | null; // Clerk session claims
  userId: string | null;
  userEmail: string | null;
  url?: string;
  db: PrismaClient; // Alias for prisma
}

/**
 * Authenticated context - user is guaranteed to exist
 */
export interface AuthenticatedTRPCContext extends TRPCContext {
  userId: string;
  user: CustomSessionClaims;
  userEmail: string;
}

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
    const { userId, sessionClaims } = await auth();
    
    // Get request headers
    const requestHeaders = Object.fromEntries(req.headers.entries());
    
    // Log URL for debugging
    const url = req.url ?? '';
    const referer = req.headers.get('referer') ?? '';
    
    // Use our universal logger
    void logger.debug('Creating tRPC context', {
      url,
      referer,
      userId: userId,
      userEmail: sessionClaims?.email,
      authError: userId ? null : 'Auth session missing!',
    });

    // Return the context with database access and auth
    return {
      req,
      resHeaders,
      headers: requestHeaders,
      prisma,
      user: sessionClaims as CustomSessionClaims | null, // Clerk session claims
      userId: userId ?? null, // Direct access to user ID
      userEmail: (sessionClaims as CustomSessionClaims)?.email ?? null, // Direct access to user email
      url,
      db: prisma // Add db alias for compatibility
    };
  } catch (error) {
    void logger.error('Error creating TRPC context:', error);
    
    // Return a basic context even if there's an error
    return {
      req,
      resHeaders,
      headers: Object.fromEntries(req.headers.entries()),
      prisma,
      user: null,
      userId: null,
      userEmail: null,
      url: '',
      db: prisma // Add db alias for compatibility
    };
  }
}

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
    const { userId, sessionClaims } = await auth();
    
    void logger.debug('Creating RSC tRPC context', {
      userId: userId,
      userEmail: sessionClaims?.email,
      authError: userId ? null : 'Auth session missing!',
    });
    
    return {
      prisma,
      user: sessionClaims as CustomSessionClaims | null, // Clerk session claims
      userId: userId ?? null, // Direct access to user ID
      userEmail: (sessionClaims as CustomSessionClaims)?.email ?? null, // Direct access to user email
      db: prisma, // Add db alias for consistency
    };
  } catch (error) {
    void logger.error('Error creating RSC context:', error);
    
    return {
      prisma,
      user: null,
      userId: null,
      userEmail: null,
      db: prisma,
    };
  }
}