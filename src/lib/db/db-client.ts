/**
 * Database Client (Deprecated)
 * 
 * This file is deprecated and should not be used directly.
 * Import from './prisma.ts' instead.
 */

import { prisma, withTransaction as txn } from './prisma';
import { createClient as createSupabaseClient } from '@supabase/ssr';

/**
 * Create a Supabase client for database operations
 * This client is meant for server-side use
 */
export function createSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Re-export from prisma.ts
export { prisma };

// For backward compatibility
export function getPrismaClient() {
  return prisma;
}

// For backward compatibility
export const withTransaction = txn;