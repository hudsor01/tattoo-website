/**
 * TRPC Context Creation with Better Auth Authentication
 *
 * This file handles the creation of context for TRPC procedures.
 * The context includes access to the database via Prisma and user auth via Better Auth.
 *
 * THIS IS A SERVER-SIDE ONLY FILE
 */
import 'server-only';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import type { PrismaClient } from '@prisma/client';

/**
 * Session user type from Better Auth
 */
interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null | undefined;
  role?: string;
}

/**
 * Base tRPC context interface
 */
export interface TRPCContext {
  req?: NextRequest;
  resHeaders?: Headers;
  headers?: Record<string, string>;
  prisma: PrismaClient;
  user: SessionUser | null; // Better Auth session user
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
  user: SessionUser;
  userEmail: string;
  isAdmin?: boolean;
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
    // Get Better Auth session
    const session = await auth.api.getSession({ req });
    const user = session?.user ?? null;

    // Get request headers
    const requestHeaders = Object.fromEntries(req.headers.entries());

    // Log URL for debugging
    const url = req.url ?? '';
    const referer = req.headers.get('referer') ?? '';

    // Use our universal logger
    void logger.debug('Creating tRPC context', {
      url,
      referer,
      userId: user?.id,
      userEmail: user?.email,
      authError: user ? null : 'Auth session missing!',
    });

    // Return the context with database access and auth
    return {
      req,
      resHeaders,
      headers: requestHeaders,
      prisma,
      user, // Better Auth session user
      userId: user?.id ?? null, // Direct access to user ID
      userEmail: user?.email ?? null, // Direct access to user email
      url,
      db: prisma, // Add db alias for compatibility
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
      db: prisma, // Add db alias for compatibility
    };
  }
}

/**
 * Exported Context type for use in tRPC initialization
 */
export type Context = TRPCContext;

/**
 * Creates context for React Server Components and Server Actions
 * This is used for direct tRPC procedure calls from the server
 * without going through the HTTP API layer
 */
export async function createContextForRSC() {
  try {
    // Get Better Auth session for RSC
    const session = await auth.api.getSession();
    const user = session?.user ?? null;

    void logger.debug('Creating RSC tRPC context', {
      userId: user?.id,
      userEmail: user?.email,
      authError: user ? null : 'Auth session missing!',
    });

    return {
      prisma,
      user, // Better Auth session user
      userId: user?.id ?? null, // Direct access to user ID
      userEmail: user?.email ?? null, // Direct access to user email
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