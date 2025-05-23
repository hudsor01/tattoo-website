/**
 * Clerk Authentication Types
 * 
 * This file provides type definitions for Clerk authentication.
 * It extends Clerk's built-in types with custom properties for our application.
 */

import type { User } from '@clerk/nextjs/server';

/**
 * Extended user metadata for our application
 */
export interface UserMetadata {
  role?: 'admin' | 'artist' | 'user';
  permissions?: string[];
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  };
}

/**
 * Extended user type with custom metadata
 */
export interface ExtendedUser extends User {
  publicMetadata: UserMetadata;
  privateMetadata?: {
    internalNotes?: string;
    lastLoginAt?: string;
  };
}

/**
 * Auth state for our application
 */
export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: ExtendedUser | null;
  userId: string | null;
}

/**
 * Admin auth check result
 */
export interface AdminAuthResult {
  isAdmin: boolean;
  user: ExtendedUser | null;
  permissions: string[];
}

/**
 * Session claims extended with our custom metadata
 */
export interface CustomSessionClaims {
  metadata?: UserMetadata;
  publicMetadata?: UserMetadata;
  role?: 'admin' | 'artist' | 'user';
}

/**
 * User role enumeration
 */
export const UserRole = {
  ADMIN: 'admin',
  ARTIST: 'artist', 
  USER: 'user',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

/**
 * Permission enumeration
 */
export const Permission = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_GALLERY: 'manage_gallery',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Artist permissions
  VIEW_BOOKINGS: 'view_bookings',
  UPDATE_GALLERY: 'update_gallery',
  
  // User permissions
  CREATE_BOOKING: 'create_booking',
  VIEW_OWN_BOOKINGS: 'view_own_bookings',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

/**
 * Default permissions by role
 */
export const DEFAULT_PERMISSIONS: Record<UserRoleType, PermissionType[]> = {
  admin: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_BOOKINGS,
    Permission.MANAGE_PAYMENTS,
    Permission.MANAGE_GALLERY,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_BOOKINGS,
    Permission.UPDATE_GALLERY,
    Permission.CREATE_BOOKING,
    Permission.VIEW_OWN_BOOKINGS,
  ],
  artist: [
    Permission.VIEW_BOOKINGS,
    Permission.UPDATE_GALLERY,
    Permission.CREATE_BOOKING,
    Permission.VIEW_OWN_BOOKINGS,
  ],
  user: [
    Permission.CREATE_BOOKING,
    Permission.VIEW_OWN_BOOKINGS,
  ],
};

/**
 * Type guard to check if user is admin
 */
export function isAdmin(user: ExtendedUser | null): boolean {
  if (!user) return false;
  
  return user.publicMetadata?.role === 'admin' ||
         user.emailAddresses.some(email => 
           email.emailAddress === 'fennyg83@gmail.com'
         );
}

/**
 * Type guard to check if user has specific permission
 */
export function hasPermission(
  user: ExtendedUser | null, 
  permission: PermissionType
): boolean {
  if (!user) return false;
  
  const userRole = user.publicMetadata?.role || 'user';
  const permissions = user.publicMetadata?.permissions || DEFAULT_PERMISSIONS[userRole];
  
  return permissions.includes(permission);
}

/**
 * Helper to get user permissions
 */
export function getUserPermissions(user: ExtendedUser | null): PermissionType[] {
  if (!user) return [];
  
  const userRole = user.publicMetadata?.role || 'user';
  return user.publicMetadata?.permissions || DEFAULT_PERMISSIONS[userRole];
}