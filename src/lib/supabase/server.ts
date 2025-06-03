import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRequiredEnvVar } from '@/lib/utils/env';
// Cookie types for Supabase SSR
type CookieOptions = {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

type CookiesToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies();
  
  // Get required environment variables for Supabase server client
  const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            void cookiesToSet.forEach(
              ({ name, value, options }: { name: string; value: string; options?: CookieOptions }) => {
                // Handle the case where options is undefined separately
                if (options === undefined) {
                  void cookieStore.set(name, value);
                } else {
                  void cookieStore.set(name, value, options);
                }
              }
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
