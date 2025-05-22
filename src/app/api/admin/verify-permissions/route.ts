import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkIsAdmin } from '@/lib/supabase/database-functions';
import { logger } from '@/lib/logger';

/**
 * GET endpoint for verifying admin permissions using RLS policies
 *
 * This endpoint:
 * 1. Checks if the user is authenticated
 * 2. Verifies if the user has admin privileges using the database function
 * 3. Returns the user's admin status and metadata
 */
export async function GET() {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      logger.info('Authentication check failed: No authenticated user', {
        error: userError?.message,
        method: 'GET',
        path: '/api/admin/verify-permissions',
      });

      return NextResponse.json(
        {
          status: 'error',
          authorized: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Get user data
    const user = userData.user;

    // Check if the user is an admin using the database function
    // This uses RLS and is more secure than just checking metadata
    const isAdmin = await checkIsAdmin(user);

    // Fix issues if needed
    let fixResults = {};

    // Get the authorized admin emails from environment variables
    const authorizedAdmins = (process.env['ADMIN_EMAILS'] || '').split(',').map(email => email.trim());

    // If not an admin in metadata but should be, update user
    if (!isAdmin && user.email && authorizedAdmins.includes(user.email)) {
      logger.info('Fixing admin permissions for authorized email', {
        email: user.email,
        userId: user.id,
      });

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: 'admin',
          name: user.email.split('@')[0], // Basic name from email
        },
      });

      fixResults = {
        metadataFixed: !updateError,
        metadataError: updateError?.message,
      };

      // Re-check admin status if the update was successful
      if (!updateError) {
        const updatedUserAdmin = await checkIsAdmin(user);

        if (updatedUserAdmin) {
          logger.info('Successfully fixed admin permissions', {
            email: user.email,
            userId: user.id,
          });
        } else {
          logger.warn('Failed to fix admin permissions despite successful update', {
            email: user.email,
            userId: user.id,
          });
        }
      }
    }

    if (!isAdmin && (!user.email || !authorizedAdmins.includes(user.email))) {
      logger.warn('Admin access attempt by unauthorized user', {
        userId: user.id,
        email: user.email,
        method: 'GET',
        path: '/api/admin/verify-permissions',
      });

      return NextResponse.json(
        {
          status: 'error',
          authorized: false,
          message: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }

    // User is authenticated and has admin privileges
    logger.info('Admin permissions verified successfully', {
      userId: user.id,
      email: user.email,
      method: 'GET',
      path: '/api/admin/verify-permissions',
    });

    return NextResponse.json({
      status: 'success',
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin,
        metadata: user.user_metadata,
      },
      fixes: fixResults,
      message: 'Permission check complete',
    });
  } catch (error) {
    // Log the error
    logger.error('Error during admin permission verification', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      method: 'GET',
      path: '/api/admin/verify-permissions',
    });

    return NextResponse.json(
      {
        status: 'error',
        authorized: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
