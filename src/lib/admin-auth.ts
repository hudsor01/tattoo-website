/**
 * Admin Authentication Module
 * 
 * Provides robust admin authorization functions that use database verification
 * rather than just client-side metadata which can be tampered with.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../supabase/server-client';
import { prisma } from '../prisma';
import { logger } from '../logger';

export type AdminAuthOptions = {
  throwOnUnauthorized?: boolean;
  returnUnauthorized?: boolean;
};

/**
 * Verify if a user is an admin by checking the database records
 * This is more secure than just checking the JWT metadata
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Check the user record in our database
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        role: true
      }
    });
    
    return user?.role === 'admin';
  } catch (error) {
    logger.error('Error checking admin status', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Middleware to verify admin access for API routes
 * Uses a database check rather than just checking JWT claims
 */
export async function verifyAdminAccess(
  req: NextRequest,
  options: AdminAuthOptions = {}
) {
  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      logger.info('Admin auth failed: No authenticated user', {
        error: userError?.message,
        path: req.nextUrl.pathname,
      });
      
      if (options.throwOnUnauthorized) {
        throw new Error('Not authenticated');
      }
      
      if (options.returnUnauthorized) {
        return {
          success: false,
          status: 401,
          message: 'Not authenticated',
        };
      }
      
      return NextResponse.json(
        {
          status: 'error',
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }
    
    const user = userData.user;
    
    // Check if the user is an admin using the database check
    const isAdmin = await checkIsAdmin(user.id);
    
    if (!isAdmin) {
      logger.warn('Admin access attempt by unauthorized user', {
        userId: user.id,
        email: user.email,
        path: req.nextUrl.pathname,
      });
      
      if (options.throwOnUnauthorized) {
        throw new Error('Insufficient permissions');
      }
      
      if (options.returnUnauthorized) {
        return {
          success: false,
          status: 403,
          message: 'Insufficient permissions',
        };
      }
      
      return NextResponse.json(
        {
          status: 'error',
          message: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }
    
    // User is authenticated and has admin privileges
    logger.info('Admin permissions verified', {
      userId: user.id,
      path: req.nextUrl.pathname,
    });
    
    return {
      success: true,
      user,
      isAdmin: true,
    };
  } catch (error) {
    logger.error('Error during admin authentication', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: req.nextUrl.pathname,
    });
    
    if (options.throwOnUnauthorized) {
      throw error;
    }
    
    if (options.returnUnauthorized) {
      return {
        success: false,
        status: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Higher-order function to wrap API route handlers with admin authentication
 */
export function withAdminAuth(handler: Function) {
  return async (req: NextRequest) => {
    const authResult = await verifyAdminAccess(req, { returnUnauthorized: true });
    
    if (!authResult.success) {
      return NextResponse.json(
        {
          status: 'error',
          message: authResult.message,
        },
        { status: authResult.status }
      );
    }
    
    // Pass the authenticated user to the handler
    return handler(req, authResult.user);
  };
}

/**
 * Reset admin permissions in metadata if they don't match database
 * Can be used to repair user permissions if needed
 */
export async function syncAdminPermissions(userId: string): Promise<boolean> {
  try {
    // Check database status
    const isDbAdmin = await checkIsAdmin(userId);
    
    // Get user from Supabase
    const supabase = createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      logger.error('Failed to get user during permission sync', {
        userId,
        error: userError?.message,
      });
      return false;
    }
    
    const user = userData.user;
    const isMetadataAdmin = user.user_metadata?.role === 'admin';
    
    // If metadata doesn't match database, update it
    if (isDbAdmin !== isMetadataAdmin) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...user.user_metadata,
          role: isDbAdmin ? 'admin' : 'user',
        },
      });
      
      if (updateError) {
        logger.error('Failed to update user metadata during permission sync', {
          userId,
          error: updateError.message,
        });
        return false;
      }
      
      logger.info('Successfully synced admin permissions', {
        userId,
        dbAdmin: isDbAdmin,
        metadataAdmin: isMetadataAdmin,
      });
      
      return true;
    }
    
    // Permissions already in sync
    return true;
  } catch (error) {
    logger.error('Error syncing admin permissions', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}