/**
 * Supabase Middleware Integration
 * 
 * This file provides middleware functions for Supabase integration with Next.js.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { type Database } from '@/types/database.types';

/**
 * Create a Supabase client for use in middleware
 */
export function createMiddlewareClient(req: NextRequest) {
  const res = NextResponse.next();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean }) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: { path: string; domain?: string; sameSite?: string; secure?: boolean }) {
          req.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
          
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );
}

/**
 * Middleware to handle Supabase authentication
 * @param req Next.js request
 */
export async function handleSupabaseAuth(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(req);
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { res, supabase, session };
}

/**
 * Check if a user is authenticated in middleware
 * @param req Next.js request
 */
export async function isAuthenticatedInMiddleware(req: NextRequest): Promise<boolean> {
  const { session } = await handleSupabaseAuth(req);
  return !!session;
}

/**
 * Middleware to handle protected routes
 * @param req Next.js request
 * @param loginUrl URL to redirect to if not authenticated
 */
export async function protectRoute(req: NextRequest, loginUrl: string = '/auth/login') {
  const { res, session } = await handleSupabaseAuth(req);
  
  if (!session) {
    const redirectUrl = new URL(loginUrl, req.nextUrl.origin);
    redirectUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}