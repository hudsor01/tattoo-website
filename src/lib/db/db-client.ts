import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Re-export the prisma client for use by other modules
export { prisma };

export const dbClient = {
  query: () => Promise.resolve(null),
};

export function createSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}