/**
 * Server Supabase Client
 * Use this client in server components and route handlers
 */

import { createServerClient as createSupabaseServerClient, createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { type Database } from '@/types/db-types';

// Re-export for backward compatibility
export const createServerClient = createSupabaseServerClient;

/**
 * Create a Supabase client for server-side operations
 * Uses cookies for authentication to work with App Router and server components
 */
export async function serverClient() {
  // Ensure we're in a server context
  if (typeof window !== 'undefined') {
    console.warn('serverClient() was called in a browser context. Using browserClient() instead.');
    return browserClient();
  }
  
  // Dynamically import cookies to prevent client-side errors
  let cookieStore;
  try {
    const { cookies } = await import('next/headers');
    cookieStore = cookies();
  } catch (error) {
    console.warn('Could not import cookies from next/headers. This should only happen in a client component.');
    return createDirectClient();
  }
  
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean }) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // This can fail in middleware or other contexts where cookie setting isn't supported
            // This is handled in middleware.ts
          }
        },
        remove(name: string, options: { path: string; domain?: string; sameSite?: string; secure?: boolean }) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // This can fail in middleware or other contexts where cookie setting isn't supported
            // This is handled in middleware.ts
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for browser/client components
 * This should be used in 'use client' components
 */
export function browserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Create a Supabase client without cookie handling
 * For cases where cookie access isn't available (some edge functions)
 */
export function createDirectClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * For admin operations requiring service role
 * This bypasses RLS and should only be used from secure server contexts
 */
export function adminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  // Create the client with service role key for admin operations
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * BACKWARD COMPATIBILITY
 * This function is for backward compatibility with existing code
 * @deprecated Use serverClient() for server components and browserClient() for client components
 */
export function createClient() {
  if (typeof window !== 'undefined') {
    return browserClient();
  } else {
    return createDirectClient();
  }
}