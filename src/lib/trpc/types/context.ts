/**
 * tRPC Context Types
 * 
 * This file contains shared types for tRPC context.
 */

import type { User } from '@supabase/supabase-js';
import type { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TRPCContext {
  req: NextRequest;
  resHeaders: Headers;
  headers: Record<string, string>;
  supabase?: SupabaseClient;
  prisma: PrismaClient;
  user: User | null;
}