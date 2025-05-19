/**
 * Type definitions for database entities
 */

/**
 * Minimal user type with essential properties
 * This represents a user from Supabase Auth
 */
export interface UserLike {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  // Add other properties as needed
}
