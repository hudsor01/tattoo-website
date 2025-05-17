/**
 * db-types.ts
 *
 * Type definitions related to database operations, Prisma, and Supabase.
 * This file serves as a consolidated source for all database-related types.
 */

import { z } from 'zod';
import { UserRole, UserStatus } from './enum-types';
import type { ID, BaseEntity, DateString } from './base-types';

// Supabase related types

/**
 * Supabase subscription options
 */
export interface SupabaseSubscriptionOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  filterColumn?: string;
  filterValue?: string | number;
}

/**
 * Repository filter option
 */
export interface RepositoryFilter {
  column: string;
  value: unknown;
  operator?: string;
}

/**
 * Repository query options
 */
export interface RepositoryQueryOptions {
  filters?: RepositoryFilter[];
  order?: { column: string; ascending?: boolean };
  pagination?: { page?: number; pageSize?: number };
  select?: string[];
  includeRelations?: boolean;
  include?: Record<string, boolean>;
}

/**
 * Repository response with pagination
 */
export interface RepositoryPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Repository event types
 */
export type RepositoryEventType = 'create' | 'update' | 'delete';

/**
 * Repository event handler
 */
export type RepositoryEventHandler<T> = (data: T, eventType: RepositoryEventType) => void;

/**
 * Repository event subscription
 */
export interface RepositorySubscription {
  unsubscribe: () => void;
}

/**
 * Supabase upload options
 */
export interface SupabaseUploadOptions {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  cacheControl?: number;
  upsert?: boolean;
}

/**
 * Supabase storage file metadata
 */
export interface SupabaseStorageFile {
  name: string;
  id: string;
  bucket_id: string;
  owner: string;
  size: number;
  mimetype: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  path: string;
}

/**
 * Supabase bucket management parameters
 */
export interface BucketOptions {
  public?: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

/**
 * Supabase Real-time subscription change event
 */
export interface SupabaseChangeEvent<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

/**
 * Supabase storage file upload result
 */
export interface SupabaseUploadResult {
  path: string;
  fullPath: string;
  key: string;
  url: string;
  id?: string;
  size?: number;
  mimetype?: string;
}

/**
 * File upload progress event
 */
export interface UploadProgressEvent {
  name: string;
  progress: number;
  loaded: number;
  total: number;
}

// User related database types

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notificationPreferences?: {
    email?: boolean;
    app?: boolean;
    sms?: boolean;
  };
  emailPreferences?: {
    marketing?: boolean;
    updates?: boolean;
    reminders?: boolean;
  };
  dashboardLayout?: string;
  defaultView?: string;
  timezone?: string;
  language?: string;
}

/**
 * User entity interface
 */
export interface DBUser extends BaseEntity {
  email: string;
  name?: string;
  role: UserRole | string;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLogin?: DateString;
  profileImage?: string;
  clientId?: ID;
  artistId?: ID;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
}

/**
 * User creation request
 */
export interface UserCreateRequest {
  email: string;
  password: string;
  name?: string;
  role?: UserRole | string;
  isActive?: boolean;
  profileImage?: string;
  clientId?: ID;
  artistId?: ID;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
}

/**
 * User update request
 */
export interface UserUpdateRequest {
  email?: string;
  name?: string;
  role?: UserRole | string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  profileImage?: string;
  clientId?: ID;
  artistId?: ID;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
}

// User related validation schemas - only type exports here
export type UserBase = z.infer<typeof UserBaseSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type User = z.infer<typeof UserSchema>;
export type ArtistProfile = z.infer<typeof ArtistProfileSchema>;
export type UserPreferencesType = z.infer<typeof UserPreferencesSchema>;
export type UserListParams = z.infer<typeof UserListParamsSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// Schema definitions (should be moved to a validation directory later)
/**
 * Base user schema shared between create/update operations
 */
export const UserBaseSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * Schema for creating a new user
 */
export const UserCreateSchema = UserBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z
    .enum([UserRole.ADMIN, UserRole.ARTIST, UserRole.CLIENT, UserRole.GUEST])
    .optional()
    .default(UserRole.CLIENT),
  phone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
});

/**
 * Schema for updating an existing user
 */
export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING, UserStatus.BLOCKED])
    .optional(),
  role: z.enum([UserRole.ADMIN, UserRole.ARTIST, UserRole.CLIENT, UserRole.GUEST]).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema for a user in the database
 */
export const UserSchema = UserBaseSchema.extend({
  id: z.union([z.string(), z.number()]),
  role: z
    .enum([UserRole.ADMIN, UserRole.ARTIST, UserRole.CLIENT, UserRole.GUEST])
    .default(UserRole.CLIENT),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING, UserStatus.BLOCKED])
    .default(UserStatus.ACTIVE),
  phone: z.string().optional(),
  emailVerified: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for artist profile
 */
export const ArtistProfileSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  workingHours: z.record(z.array(z.string())).optional(), // e.g. { "monday": ["10:00", "18:00"] }
  portfolioLinks: z.array(z.string().url()).optional(),
  socialMediaLinks: z.record(z.string().url()).optional(),
  acceptingBookings: z.boolean().default(true),
  hourlyRate: z.number().positive().optional(),
  minBookingAmount: z.number().positive().optional(),
  availableForCustomWork: z.boolean().default(true),
  displayInDirectory: z.boolean().default(true),
});

/**
 * Schema for user preferences
 */
export const UserPreferencesSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    browser: z.boolean().default(true),
    marketing: z.boolean().default(true),
  }),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dashboardLayout: z.record(z.unknown()).optional(),
});

/**
 * Schema for user list query parameters
 */
export const UserListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  role: z.enum([UserRole.ADMIN, UserRole.ARTIST, UserRole.CLIENT, UserRole.GUEST]).optional(),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING, UserStatus.BLOCKED])
    .optional(),
  searchTerm: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema for user list response
 */
export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});