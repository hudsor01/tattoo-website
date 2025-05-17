/**
 * Supabase Middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/db-types'

export async function updateSession(request: NextRequest) {
  // Create a response to modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client for middleware usage
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; httpOnly: boolean; maxAge: number; domain?: string; sameSite?: 'strict' | 'lax' | 'none' }) {
          // Set cookie in the request so that it's available to downstream middleware
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Set cookie in the response so that it's available to the browser
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path: string; domain?: string }) {
          request.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Refresh the session
  await supabase.auth.getUser()

  return response
}