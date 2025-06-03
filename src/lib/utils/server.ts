/**
 * Server-only utilities
 * Do not import this file in client components
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { type User, UserRole } from '@prisma/client';

// Helper function to check if user is admin
function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;
}

import { logger } from "@/lib/logger";
/**
 * Utility function for combining TailwindCSS classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sleep utility for server components/routes
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Verify admin access for API routes
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    // Get session from BetterAuth
    // We use the getSession method from auth that works with server components
    // Use cookies directly in a format compatible with auth.api.getSession
    const cookiesHeader = cookies().toString();
    const session = await auth.api.getSession({ 
      headers: new Headers({ cookie: cookiesHeader })
    });
    
    // Check if user is authenticated and has admin role
    if (!session?.user) {
      return false;
    }
    
    // Cast the user to the User type from auth-types
    return isAdmin(session.user as User);
  } catch (error) {
    void logger.error('Error verifying admin access:', error);
    return false;
  }
}
