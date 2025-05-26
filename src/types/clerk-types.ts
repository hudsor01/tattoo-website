/**
 * Clerk Authentication Types
 *
 * This file provides type definitions for Clerk authentication.
 * It extends Clerk's built-in types with custom properties for our application.
 */

import type { User } from '@clerk/nextjs/server';

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

export type PermissionType = (typeof Permission)[keyof typeof Permission];

/**
 * Extended user metadata for our application
 */
export interface UserMetadata {
  role?: 'admin' | 'artist' | 'user';
  permissions?: PermissionType[];
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  };
  [key: string]: unknown; // Add index signature for compatibility with Clerk
}

/**
 * Extended user type with custom metadata
 */
export interface ExtendedUser extends Partial<User> {
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
 * Session claims extended with our custom metadata - compatible with Clerk's JwtPayload
 */
export interface CustomSessionClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  picture?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  iss?: string;
  jti?: string;
  nbf?: number;
  org_id?: string;
  org_slug?: string;
  org_role?: string;
  org_permissions?: string[];
  metadata?: UserMetadata;
  publicMetadata?: UserMetadata;
  role?: 'admin' | 'artist' | 'user';
  [key: string]: unknown; // Add index signature for full compatibility
}

/**
 * User role enumeration
 */
export const UserRole = {
  ADMIN: 'admin',
  ARTIST: 'artist',
  USER: 'user',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

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
  user: [Permission.CREATE_BOOKING, Permission.VIEW_OWN_BOOKINGS],
};

/**
 * Type guard to check if user is admin
 */
export function isAdmin(user: ExtendedUser | null): boolean {
  if (!user) return false;

  return user.publicMetadata?.role === 'admin';
}

/**
 * Type guard to check if user has specific permission
 */
export function hasPermission(user: ExtendedUser | null, permission: PermissionType): boolean {
  if (!user) return false;

  const userRole = user.publicMetadata?.role ?? 'user';
  const permissions = user.publicMetadata?.permissions ?? DEFAULT_PERMISSIONS[userRole];

  return permissions.includes(permission);
}

/**
 * Helper to get user permissions
 */
export function getUserPermissions(user: ExtendedUser | null): PermissionType[] {
  if (!user) return [];

  const userRole = user.publicMetadata?.role ?? 'user';
  return user.publicMetadata?.permissions ?? DEFAULT_PERMISSIONS[userRole];
}

/**
 * Clerk Webhook Event Types
 */
export interface ClerkWebhookEvent {
  data: Record<string, unknown>;
  type: string;
  object: string;
}

export interface ClerkUserWebhookData {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: Array<{
    id: string;
    email_address: string;
    verification?: {
      status: string;
    };
  }>;
  phone_numbers?: Array<{
    id: string;
    phone_number: string;
  }>;
  image_url?: string;
  username?: string;
  created_at?: number;
  updated_at?: number;
  last_sign_in_at?: number;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
}

export interface ClerkSessionWebhookData {
  id: string;
  user_id: string;
  client_id: string;
  created_at?: number;
  updated_at?: number;
  last_active_at?: number;
  status?: string;
}

export interface ClerkOrganizationMembershipWebhookData {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at?: number;
  updated_at?: number;
  deleted_at?: number;
}
