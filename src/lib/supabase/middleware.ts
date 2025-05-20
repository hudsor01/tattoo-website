/**
 * Supabase Middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  // Create a response to modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase is configured
  if (!process.env['NEXT_PUBLIC_SUPABASE_URL'] || 
      !process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
      process.env['NEXT_PUBLIC_SUPABASE_URL'] === 'https://qrcweallqlcgwiwzhqpb.supabase.co') {
    // Return response without Supabase session update
    return response;
  }

  // Create a Supabase client for middleware usage with non-deprecated cookie methods
  const supabase = createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: (name?: string) => {
          if (name) {
            const cookie = request.cookies.get(name);
            return cookie ? [{ name, value: cookie.value }] : [];
          }
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: (cookies: { name: string; value: string; options?: CookieOptions }[]) => {
          cookies.forEach(({ name, value, options }) => {
            // Set cookie in the request so that it's available to downstream middleware
            request.cookies.set({
              name,
              value,
              ...options,
            });
            
            // Set cookie in the response so that it's available to the browser
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  )

  // Refresh the session
  await supabase.auth.getUser()

  return response
}