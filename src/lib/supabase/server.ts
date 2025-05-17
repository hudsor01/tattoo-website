/**
 * Server Supabase Client
 * Use this client in server components and route handlers
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side use without cookies
 * For use in environments where next/headers is not available
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                path: options?.path ?? '/',
                httpOnly: options?.httpOnly ?? true,
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 1 week default
                domain: options?.domain,
                sameSite: typeof options?.sameSite === 'string' ? options.sameSite : undefined,
              });
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

/**
 * Create a Supabase client with a specific cookie store
 * For use with middleware or API routes
 */
export function createServerClientWithCookies(cookieStore: {
  getAll: () => Array<{
    name: string;
    value: string;
    path?: string;
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }>;
  set: (
    name: string,
    value: string,
    options: {
      path: string;
      httpOnly: boolean;
      maxAge: number;
      domain?: string;
      sameSite?: 'strict' | 'lax' | 'none';
    },
  ) => void;
}) {
  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions: {
                path: string;
                httpOnly: boolean;
                maxAge: number;
                domain?: string;
                sameSite?: 'strict' | 'lax' | 'none';
              } = {
                path: options?.path ?? '/',
                httpOnly: options?.httpOnly ?? true,
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 7,
              };
              if (options?.domain !== undefined) {
                cookieOptions.domain = options.domain;
              }
              if (typeof options?.sameSite === 'string') {
                cookieOptions.sameSite = options.sameSite;
              }
              cookieStore.set(name, value, cookieOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
