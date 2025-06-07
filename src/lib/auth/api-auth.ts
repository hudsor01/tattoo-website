/**
 * API Authentication Utilities
 * 
 * Provides standardized authentication functions for API routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { ApiErrors } from '@/lib/api-errors';
import { User } from '@prisma/client';
// Define ApiError locally
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Get the current session from a Next.js API route
 */
export async function getSessionFromRequest(request: NextRequest) {
  try {
    // Use request headers directly to get session
    return await auth.api.getSession({
      headers: request.headers
    });
  } catch (error) {
    void logger.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns the user if authenticated, throws an error if not
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const session = await getSessionFromRequest(request);
  
  if (!session?.user) {
    throw ApiErrors.unauthorized('Authentication required');
  }
  
  return session.user as User;
}

/**
 * Require admin role for an API route
 * Returns the admin user if authenticated with admin role, throws an error if not
 */
export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request);
  
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    void logger.warn('Unauthorized admin access attempt', {
      userId: user.id,
      email: user.email,
      role: user.role,
      path: request.nextUrl.pathname,
    });
    throw ApiErrors.forbidden('Admin access required');
  }
  
  return user;
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T>(
  handler: (req: NextRequest, user: User) => Promise<T | NextResponse>
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    try {
      const user = await requireAuth(req);
      return await handler(req, user);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
        const apiError = error as ApiError & { status: number };
        return NextResponse.json(
          { error: apiError.message, code: apiError.code },
          { status: apiError.status }
        );
      }
      
      void logger.error('API auth error:', error);
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrapper for API routes that require admin role
 */
export function withAdmin<T>(
  handler: (req: NextRequest, user: User) => Promise<T | NextResponse>
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    try {
      const user = await requireAdmin(req);
      return await handler(req, user);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
        const apiError = error as ApiError & { status: number };
        return NextResponse.json(
          { error: apiError.message, code: apiError.code },
          { status: apiError.status }
        );
      }
      
      void logger.error('API admin auth error:', error);
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      );
    }
  };
}