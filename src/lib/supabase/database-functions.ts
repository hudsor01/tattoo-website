/**
 * Supabase Database Functions
 * 
 * This file contains functions that interact with Supabase database,
 * including role checks and other database operations.
 */

import { User } from '@supabase/supabase-js';
import { createClient } from './client';
import { logger } from '@/lib/logger';

/**
 * Check if a user has admin privileges
 * This function can be used in both client and server contexts
 * 
 * @param user - The Supabase user object
 * @returns true if the user is an admin, false otherwise
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) {
    return false;
  }

  try {
    // Check if user has admin role in metadata
    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};
    
    // Check various ways admin role might be stored
    const isAdminInMetadata = 
      metadata.role === 'admin' || 
      appMetadata.role === 'admin' ||
      metadata.is_admin === true ||
      appMetadata.is_admin === true;

    if (isAdminInMetadata) {
      return true;
    }

    // If not in metadata, check against the allowed admin emails
    const authorizedAdmins = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
    
    if (user.email && authorizedAdmins.includes(user.email)) {
      return true;
    }

    // You could also check against a database table if needed
    // For example:
    // const supabase = createClient();
    // const { data, error } = await supabase
    //   .from('admin_users')
    //   .select('id')
    //   .eq('user_id', user.id)
    //   .single();
    // 
    // return !error && !!data;

    return false;
  } catch (error) {
    logger.error('Error checking admin status:', {
      error,
      userId: user.id,
    });
    return false;
  }
}

/**
 * Get user role from the database or metadata
 * 
 * @param userId - The user ID to check
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // First check user metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (!userError && userData?.user?.id === userId) {
      const role = userData.user.user_metadata?.role || userData.user.app_metadata?.role;
      if (role) {
        return role;
      }
    }

    // If not in metadata, you could check a database table
    // For example:
    // const { data, error } = await supabase
    //   .from('user_roles')
    //   .select('role')
    //   .eq('user_id', userId)
    //   .single();
    // 
    // if (!error && data) {
    //   return data.role;
    // }

    return null;
  } catch (error) {
    logger.error('Error getting user role:', {
      error,
      userId,
    });
    return null;
  }
}

/**
 * Update user role in the database
 * 
 * @param userId - The user ID to update
 * @param role - The new role to assign
 * @returns Success status
 */
export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Note: admin.updateUserById is only available with service role key
    // For client-side apps, you would need to call an API endpoint that uses server-side Supabase
    // This is just a placeholder that won't work in the browser
    
    logger.warn('updateUserRole should be called from a server-side API endpoint', {
      userId,
      role,
    });
    
    return false;
  } catch (error) {
    logger.error('Error updating user role:', {
      error,
      userId,
      role,
    });
    return false;
  }
}