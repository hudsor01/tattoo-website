export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | null }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Appointment: {
        Row: {
          artistId: string
          cancellationReason: string | null
          colorPalette: string[] | null
          createdAt: string
          customerId: string
          date: string
          depositAmount: number | null
          depositPaid: boolean
          designId: string | null
          duration: number
          endTime: string
          id: string
          isConsultation: boolean
          isPrepaidDeposit: boolean
          notes: string | null
          placement: string
          preparationNotes: string | null
          references: string[] | null
          size: string
          startTime: string
          status: string
          updatedAt: string
        }
        Insert: {
          artistId: string
          cancellationReason?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerId: string
          date: string
          depositAmount?: number | null
          depositPaid?: boolean
          designId?: string | null
          duration: number
          endTime: string
          id?: string
          isConsultation?: boolean
          isPrepaidDeposit?: boolean
          notes?: string | null
          placement: string
          preparationNotes?: string | null
          references?: string[] | null
          size: string
          startTime: string
          status?: string
          updatedAt?: string
        }
        Update: {
          artistId?: string
          cancellationReason?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerId?: string
          date?: string
          depositAmount?: number | null
          depositPaid?: boolean
          designId?: string | null
          duration?: number
          endTime?: string
          id?: string
          isConsultation?: boolean
          isPrepaidDeposit?: boolean
          notes?: string | null
          placement?: string
          preparationNotes?: string | null
          references?: string[] | null
          size?: string
          startTime?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Appointment_artistId_fkey"
            columns: ["artistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_designId_fkey"
            columns: ["designId"]
            referencedRelation: "TattooDesign"
            referencedColumns: ["id"]
          }
        ]
      }
      Artist: {
        Row: {
          bio: string | null
          createdAt: string
          email: string
          id: string
          isActive: boolean
          name: string
          phone: string | null
          portfolioImages: string[] | null
          profileImage: string | null
          rate: number | null
          specialties: string[] | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          bio?: string | null
          createdAt?: string
          email: string
          id?: string
          isActive?: boolean
          name: string
          phone?: string | null
          portfolioImages?: string[] | null
          profileImage?: string | null
          rate?: number | null
          specialties?: string[] | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          bio?: string | null
          createdAt?: string
          email?: string
          id?: string
          isActive?: boolean
          name?: string
          phone?: string | null
          portfolioImages?: string[] | null
          profileImage?: string | null
          rate?: number | null
          specialties?: string[] | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Artist_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Booking: {
        Row: {
          appointmentId: string | null
          colorPalette: string[] | null
          createdAt: string
          customerEmail: string
          customerName: string
          customerPhone: string | null
          date: string | null
          description: string
          id: string
          isFirstTattoo: boolean
          placement: string
          preferredArtistId: string | null
          references: string[] | null
          size: string
          status: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerEmail: string
          customerName: string
          customerPhone?: string | null
          date?: string | null
          description: string
          id?: string
          isFirstTattoo?: boolean
          placement: string
          preferredArtistId?: string | null
          references?: string[] | null
          size: string
          status?: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          colorPalette?: string[] | null
          createdAt?: string
          customerEmail?: string
          customerName?: string
          customerPhone?: string | null
          date?: string | null
          description?: string
          id?: string
          isFirstTattoo?: boolean
          placement?: string
          preferredArtistId?: string | null
          references?: string[] | null
          size?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Booking_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Booking_preferredArtistId_fkey"
            columns: ["preferredArtistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          }
        ]
      }
      Contact: {
        Row: {
          convertedToCustomer: boolean
          createdAt: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          referralSource: string | null
          status: string
          subject: string | null
          updatedAt: string
        }
        Insert: {
          convertedToCustomer?: boolean
          createdAt?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          referralSource?: string | null
          status?: string
          subject?: string | null
          updatedAt?: string
        }
        Update: {
          convertedToCustomer?: boolean
          createdAt?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          referralSource?: string | null
          status?: string
          subject?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      Customer: {
        Row: {
          createdAt: string
          customerSource: string | null
          dateOfBirth: string | null
          email: string
          id: string
          isMinor: boolean
          name: string
          notes: string | null
          phone: string | null
          profileImage: string | null
          tattooHistory: Json | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          customerSource?: string | null
          dateOfBirth?: string | null
          email: string
          id?: string
          isMinor?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          profileImage?: string | null
          tattooHistory?: Json | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          customerSource?: string | null
          dateOfBirth?: string | null
          email?: string
          id?: string
          isMinor?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          profileImage?: string | null
          tattooHistory?: Json | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Customer_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Interaction: {
        Row: {
          appointmentId: string | null
          channel: string
          content: string
          createdAt: string
          customerId: string
          id: string
          interactionType: string
          staffId: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          channel: string
          content: string
          createdAt?: string
          customerId: string
          id?: string
          interactionType: string
          staffId?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          channel?: string
          content?: string
          createdAt?: string
          customerId?: string
          id?: string
          interactionType?: string
          staffId?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Interaction_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Interaction_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Lead: {
        Row: {
          convertedToCustomer: boolean
          createdAt: string
          email: string
          id: string
          leadMagnet: string | null
          leadSource: string | null
          name: string | null
          phone: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          convertedToCustomer?: boolean
          createdAt?: string
          email: string
          id?: string
          leadMagnet?: string | null
          leadSource?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          convertedToCustomer?: boolean
          createdAt?: string
          email?: string
          id?: string
          leadMagnet?: string | null
          leadSource?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Note: {
        Row: {
          appointmentId: string | null
          content: string
          createdAt: string
          createdBy: string | null
          customerId: string | null
          id: string
          noteType: string
          updatedAt: string
        }
        Insert: {
          appointmentId?: string | null
          content: string
          createdAt?: string
          createdBy?: string | null
          customerId?: string | null
          id?: string
          noteType: string
          updatedAt?: string
        }
        Update: {
          appointmentId?: string | null
          content?: string
          createdAt?: string
          createdBy?: string | null
          customerId?: string | null
          id?: string
          noteType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Note_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Note_createdBy_fkey"
            columns: ["createdBy"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Note_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      NotificationQueue: {
        Row: {
          channel: string
          content: Json
          createdAt: string
          id: string
          processedAt: string | null
          recipient: string
          status: string
          type: string
          updatedAt: string
        }
        Insert: {
          channel: string
          content: Json
          createdAt?: string
          id?: string
          processedAt?: string | null
          recipient: string
          status?: string
          type: string
          updatedAt?: string
        }
        Update: {
          channel?: string
          content?: Json
          createdAt?: string
          id?: string
          processedAt?: string | null
          recipient?: string
          status?: string
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Payment: {
        Row: {
          amount: number
          appointmentId: string | null
          createdAt: string
          customerId: string
          date: string
          id: string
          method: string
          notes: string | null
          paymentIntentId: string | null
          paymentType: string
          receiptUrl: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          amount: number
          appointmentId?: string | null
          createdAt?: string
          customerId: string
          date: string
          id?: string
          method: string
          notes?: string | null
          paymentIntentId?: string | null
          paymentType: string
          receiptUrl?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          amount?: number
          appointmentId?: string | null
          createdAt?: string
          customerId?: string
          date?: string
          id?: string
          method?: string
          notes?: string | null
          paymentIntentId?: string | null
          paymentType?: string
          receiptUrl?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_appointmentId_fkey"
            columns: ["appointmentId"]
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Payment_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Service: {
        Row: {
          basePrice: number | null
          category: string | null
          createdAt: string
          description: string | null
          id: string
          isActive: boolean
          name: string
          updatedAt: string
        }
        Insert: {
          basePrice?: number | null
          category?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          isActive?: boolean
          name: string
          updatedAt?: string
        }
        Update: {
          basePrice?: number | null
          category?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          isActive?: boolean
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Session: {
        Row: {
          createdAt: string
          data: Json
          expiresAt: string | null
          id: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          data: Json
          expiresAt?: string | null
          id?: string
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          data?: Json
          expiresAt?: string | null
          id?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Tag: {
        Row: {
          createdAt: string
          id: string
          name: string
          tagType: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          tagType: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          tagType?: string
          updatedAt?: string
        }
        Relationships: []
      }
      TaggedEntity: {
        Row: {
          createdAt: string
          entityId: string
          entityType: string
          id: string
          tagId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          entityId: string
          entityType: string
          id?: string
          tagId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          entityId?: string
          entityType?: string
          id?: string
          tagId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TaggedEntity_tagId_fkey"
            columns: ["tagId"]
            referencedRelation: "Tag"
            referencedColumns: ["id"]
          }
        ]
      }
      TattooDesign: {
        Row: {
          artistId: string | null
          createdAt: string
          customerId: string
          description: string | null
          designFiles: string[]
          id: string
          isApproved: boolean
          name: string
          placementArea: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          artistId?: string | null
          createdAt?: string
          customerId: string
          description?: string | null
          designFiles: string[]
          id?: string
          isApproved?: boolean
          name: string
          placementArea?: string | null
          status?: string
          updatedAt?: string
        }
        Update: {
          artistId?: string | null
          createdAt?: string
          customerId?: string
          description?: string | null
          designFiles?: string[]
          id?: string
          isApproved?: boolean
          name?: string
          placementArea?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "TattooDesign_artistId_fkey"
            columns: ["artistId"]
            referencedRelation: "Artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TattooDesign_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Testimonial: {
        Row: {
          approved: boolean
          content: string
          createdAt: string
          customerId: string | null
          displayName: string
          email: string | null
          id: string
          rating: number
          tattooType: string | null
          updatedAt: string
        }
        Insert: {
          approved?: boolean
          content: string
          createdAt?: string
          customerId?: string | null
          displayName: string
          email?: string | null
          id?: string
          rating: number
          tattooType?: string | null
          updatedAt?: string
        }
        Update: {
          approved?: boolean
          content?: string
          createdAt?: string
          customerId?: string | null
          displayName?: string
          email?: string | null
          id?: string
          rating?: number
          tattooType?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Testimonial_customerId_fkey"
            columns: ["customerId"]
            referencedRelation: "Customer"
            referencedColumns: ["id"]
          }
        ]
      }
      Transaction: {
        Row: {
          amount: number
          createdAt: string
          date: string
          description: string | null
          id: string
          paymentId: string | null
          transactionType: string
          updatedAt: string
        }
        Insert: {
          amount: number
          createdAt?: string
          date: string
          description?: string | null
          id?: string
          paymentId?: string | null
          transactionType: string
          updatedAt?: string
        }
        Update: {
          amount?: number
          createdAt?: string
          date?: string
          description?: string | null
          id?: string
          paymentId?: string | null
          transactionType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transaction_paymentId_fkey"
            columns: ["paymentId"]
            referencedRelation: "Payment"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          lastLoginAt: string | null
          metadata: Json | null
          phoneNumber: string | null
          role: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          lastLoginAt?: string | null
          metadata?: Json | null
          phoneNumber?: string | null
          role?: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          lastLoginAt?: string | null
          metadata?: Json | null
          phoneNumber?: string | null
          role?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
/**
 * database.types.ts
 *
 * Type definitions related to database operations, Prisma, and Supabase.
 * This file serves as a consolidated source for all database-related types.
 */

import { z } from 'zod';
import { UserRole, UserStatus } from './enum-types';
import type { ID, DateString } from './utility-types';

// Common metadata interface used across entities
export interface Metadata {
  createdAt: DateString;
  updatedAt: DateString;
  [key: string]: unknown;
}

// Core entity base interface (used for inheritance)
export interface BaseEntity {
  id: ID;
  createdAt?: DateString;
  updatedAt?: DateString;
}

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
/**
 * database.types.ts
 *
 * Type definitions related to database function parameters, options,
 * and results. This file consolidates all database function-specific types.
 */

/**
 * Options for executing stored procedures
 */
export type ExecuteStoredProcedureOptions = {
  // Whether to log the parameters when calling the function
  logParams?: boolean;
  // Custom timeout for the query in milliseconds
  timeoutMs?: number;
};

/**
 * Database error information
 */
export type DatabaseError = {
  message: string;
  code?: string;
  details?: string;
  originalError?: unknown;
};

/**
 * Generic database operation result
 */
export type DatabaseResult<T> = {
  data: T | null;
  error: DatabaseError | null;
};

/**
 * Parameters for pricing calculations
 */
export type PricingCalculationParams = {
  size: string;
  placement: string;
  complexity?: number;
  artistId?: string;
  customHourlyRate?: number;
};

/**
 * Result of price calculation
 */
export type PricingResult = {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
};

/**
 * Parameters for checking artist availability
 */
export type AvailabilityParams = {
  artistId: string;
  startTime: Date;
  endTime?: Date | null;
  appointmentId?: string | null;
  size?: string;
  complexity?: number;
};

/**
 * Result of availability check
 */
export type AvailabilityResult = {
  isAvailable: boolean;
  conflicts: unknown[] | null;
  error?: string;
};

/**
 * Parameters for customer validation
 */
export type CustomerValidationParams = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthdate?: Date;
};

/**
 * Result of customer validation
 */
export type CustomerValidationResult = {
  isValid: boolean;
  errors: string[];
  normalizedData: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    birthdate: Date | null;
  };
  potentialDuplicates: unknown[] | null;
};

/**
 * Parameters for scheduling an appointment
 */
export type AppointmentScheduleParams = {
  title: string;
  description?: string;
  startDate: Date;
  customerId: string;
  artistId: string;
  tattooSize?: string;
  complexity?: number;
  location?: string;
};

/**
 * Result of appointment scheduling
 */
export type AppointmentScheduleResult = {
  success: boolean;
  error?: string;
  conflicts?: unknown[];
  appointmentId?: string;
  startDate?: Date;
  endDate?: Date;
  deposit?: number;
  totalPrice?: number;
  pricingDetails?: PricingResult;
};

/**
 * Parameters for cancelling an appointment
 */
export type CancellationParams = {
  appointmentId: string;
  cancellationDate?: Date;
  reasonCode?: string;
};

/**
 * Result of cancellation policy evaluation
 */
export type CancellationPolicyResult = {
  success: boolean;
  error?: string;
  appointmentId?: string;
  cancellationDate?: Date;
  daysNotice?: number;
  reasonCode?: string;
  policyApplied?: string;
  feePercentage?: number;
  feeAmount?: number;
  depositRefundable?: boolean;
  allowReschedule?: boolean;
};

export interface UserLike {
  id: string;
}

/**
 * NotificationQueue entity interface
 */
export interface NotificationQueue extends BaseEntity {
  recipientId: string;
  recipientType: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  isProcessed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  actionUrl?: string;
}
