/**
 * Unified Supabase Client
 * 
 * This file provides a single point of access for Supabase clients
 * across different environments (browser, server, edge).
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cache } from 'react';
import { type Database } from '@/types/database.types';
import { type SupabaseClient } from '@supabase/supabase-js';
import { ClientCookies } from '@/lib/cookie';

// Type definition for cookie options
export interface CookieOptions {
  maxAge?: number;
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Environment validation
function validateEnvVars() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

/**
 * Clean and normalize the Supabase URL
 */
function getCleanSupabaseUrl(): string {
  validateEnvVars();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // Handle potential URL issues (like double https://)
  return url.replace(/^(https?:\/\/)+(.*)/i, 'https://$2');
}

// Store singleton instance for browser environment
let browserClient: SupabaseClient<Database> | null = null;

// BROWSER ENVIRONMENT

/**
 * Create a Supabase client for browser-side usage
 */
export function createBrowserSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabaseClient can only be used in browser environment');
  }
  
  if (browserClient) return browserClient;
  
  browserClient = createBrowserClient<Database>(
    getCleanSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => ClientCookies.get(name),
        set: (name: string, value: string, options: CookieOptions) => 
          ClientCookies.set(name, value, options),
        remove: (name: string, options: Pick<CookieOptions, 'path' | 'domain'>) => 
          ClientCookies.remove(name, options),
      },
    }
  );
  
  return browserClient;
}

/**
 * Reset the browser client (useful for testing or auth changes)
 */
export function resetBrowserClient(): void {
  browserClient = null;
}

// PUBLIC BROWSER-SAFE API
export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('This client is only for browser use. For server components, use serverClient.');
  }
  return createBrowserSupabaseClient();
}