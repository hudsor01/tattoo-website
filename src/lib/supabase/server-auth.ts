/**
 * Supabase Server Authentication
 * 
 * Server-side authentication methods for Supabase
 */

import { createClient } from './server';
import { cache } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Verify the server session exists and get the user
 */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get the server session
 * This is cached to prevent multiple requests to Supabase
 */
export const getSession = cache(async (): Promise<Session | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
});

/**
 * Check if a user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getUser();
  return user?.user_metadata?.['role'] === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Server-side authentication check
 * Redirect to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/login'): Promise<User> {
  const user = await getUser();
  
  if (!user) {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Server-side admin check
 * Redirect to dashboard if not an admin
 */
export async function requireAdmin(redirectTo: string = '/unauthorized'): Promise<User> {
  const user = await requireAuth('/login');
  
  // Check user metadata for admin role
  if (user.user_metadata?.['role'] !== 'admin') {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Create a server session from an auth callback request
 * This is used to handle redirects from OAuth providers
 */
export async function handleAuthCallback(request: NextRequest): Promise<NextResponse> {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    }
    
    // Get the return URL or use a default
    const returnTo = requestUrl.searchParams.get('returnTo') || '/';
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}