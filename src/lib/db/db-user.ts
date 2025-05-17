/**
 * User Database Functions
 * 
 * This file contains functions for user and profile operations
 */

import { User } from '@supabase/supabase-js';
import { prisma } from './prisma';
import { createClient } from '../supabase/client';

/**
 * Check if a user has admin role
 * 
 * @param user The Supabase user object
 * @returns True if the user is an admin, false otherwise
 */
export async function checkIsAdmin(user: User): Promise<boolean> {
  if (!user) return false;
  
  // Check user metadata first (faster)
  if (user.user_metadata?.role === 'admin') {
    return true;
  }
  
  try {
    // Fallback to checking the database with Prisma
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    });
    
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user profile data
 * 
 * @param userId The user's ID
 * @returns The user profile data or null if not found
 */
export async function getUserProfile(userId: string) {
  if (!userId) return null;
  
  try {
    return await prisma.profile.findUnique({
      where: { id: userId }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile data
 * 
 * @param userId The user's ID
 * @param profileData The profile data to update
 * @returns Success status and any error
 */
export async function updateUserProfile(userId: string, profileData: Record<string, any>) {
  if (!userId) return { success: false, error: 'No user ID provided' };
  
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: profileData
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get user auth details including social providers
 * 
 * @param userId The user's ID
 * @returns User auth details or null if not found
 */
export async function getUserAuthDetails(userId: string) {
  if (!userId) return null;
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Error fetching user auth details:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception fetching user auth details:', error);
    return null;
  }
}
