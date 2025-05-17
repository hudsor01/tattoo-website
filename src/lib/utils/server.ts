/**
 * Server-only utilities
 * Do not import this file in client components
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cookies } from 'next/headers';
import { serverClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

/**
 * Utility function for combining TailwindCSS classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a user is an admin by querying the database
 */
export async function checkAdmin(userId?: string): Promise<boolean> {
  if (!userId) {
    try {
      // Get session
      const supabase = serverClient();
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
      if (!userId) return false;
    } catch (error) {
      console.error('Error getting session:', error);
      return false;
    }
  }
  
  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    // Check if the user has an admin role
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Verify admin access (server-only method)
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    // Get the current session
    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // No session means no admin access
    if (!session?.user?.id) return false;
    
    // Check admin status
    return await checkAdmin(session.user.id);
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}

/**
 * Sleep utility for server components/routes
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
