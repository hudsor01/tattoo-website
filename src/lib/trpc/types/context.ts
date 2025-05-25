/**
 * tRPC Context Types
 * 
 * This file defines the context types for tRPC with Supabase authentication.
 */

import type { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

/**
 * Base tRPC context with Supabase authentication
 */
export interface TRPCContext {
  req: NextRequest;
  resHeaders: Headers;
  headers: Record<string, string>;
  prisma: PrismaClient;
  supabase: SupabaseClient | null;
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  url: string;
  // db alias for compatibility
  db: PrismaClient;
}

/**
 * Protected context - guaranteed to have auth
 */
export interface ProtectedTRPCContext extends TRPCContext {
  supabase: SupabaseClient;
  user: User;
  userId: string;
  userEmail: string;
}

/**
 * Admin context - guaranteed to have admin auth
 */
export type AdminTRPCContext = ProtectedTRPCContext;

/**
 * RSC (React Server Component) context
 */
export interface RSCContext {
  prisma: PrismaClient;
  supabase: SupabaseClient | null;
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  db: PrismaClient;
}