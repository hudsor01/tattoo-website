/**
 * tRPC Context Types
 * 
 * This file defines the context types for tRPC with Clerk authentication.
 */

import type { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';
import type { Auth } from '@clerk/nextjs/server';

/**
 * Base tRPC context with Clerk authentication
 */
export interface TRPCContext {
  req: NextRequest;
  resHeaders: Headers;
  headers: Record<string, string>;
  prisma: PrismaClient;
  auth: Auth | null;
  userId: string | null;
  url: string;
  // Legacy db alias for compatibility
  db?: PrismaClient;
}

/**
 * Protected context - guaranteed to have auth
 */
export interface ProtectedTRPCContext extends TRPCContext {
  auth: Auth;
  userId: string;
}

/**
 * Admin context - guaranteed to have admin auth
 */
export interface AdminTRPCContext extends ProtectedTRPCContext {
  // Additional admin-specific context properties can be added here
}

/**
 * RSC (React Server Component) context
 */
export interface RSCContext {
  prisma: PrismaClient;
  auth: Auth | null;
  userId: string | null;
  db: PrismaClient;
}