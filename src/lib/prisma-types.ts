/**
 * PRISMA-FIRST TYPE SYSTEM
 * Single Source of Truth for all application types
 * 
 * CRITICAL: All types in this application MUST derive from Prisma schema
 * NO manual type definitions are allowed elsewhere
 */

// ============================================================================
// PRISMA NAMESPACE IMPORT
// ============================================================================

import { Prisma } from '@prisma/client';

// ============================================================================
// ESSENTIAL TYPES (Only models that exist in current schema)
// ============================================================================

// Core Entity Types (simplified schema)
export type { 
  User,
  Session,
  Account,
  Verification,
  RateLimit,
  Customer,
  Booking,
  TattooDesign,
  Contact,
} from '@prisma/client';

// ============================================================================
// QUERY RESULT TYPES (Using Prisma's GetPayload for type-safe queries)
// ============================================================================

// Customer with no relations (simplified)
export type CustomerBasic = Prisma.CustomerGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    phone: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// Booking with customer relation
export type BookingWithCustomer = Prisma.BookingGetPayload<{
  include: {
    customer: true;
  };
}>;

// TattooDesign with basic fields
export type TattooDesignBasic = Prisma.TattooDesignGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    fileUrl: true;
    thumbnailUrl: true;
    designType: true;
    isApproved: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// ============================================================================
// CREATE/UPDATE INPUT TYPES
// ============================================================================

export type CustomerCreateInput = Prisma.CustomerCreateInput;
export type CustomerUpdateInput = Prisma.CustomerUpdateInput;
export type BookingCreateInput = Prisma.BookingCreateInput;
export type BookingUpdateInput = Prisma.BookingUpdateInput;
export type TattooDesignCreateInput = Prisma.TattooDesignCreateInput;
export type TattooDesignUpdateInput = Prisma.TattooDesignUpdateInput;
export type ContactCreateInput = Prisma.ContactCreateInput;

// ============================================================================
// FORM TYPES (For React Hook Form and validation)
// ============================================================================

// Contact form data
export type ContactFormData = Pick<
  ContactCreateInput,
  'name' | 'email' | 'message'
>;

// Booking form data
export type BookingFormData = Pick<
  BookingCreateInput,
  'name' | 'email' | 'phone' | 'tattooType' | 'size' | 'placement' | 'description' | 'preferredDate'
>;

// Customer form data  
export type CustomerFormData = Pick<
  CustomerCreateInput,
  'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'city' | 'state' | 'postalCode'
>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Gallery API response
export interface GalleryResponse {
  designs: TattooDesignBasic[];
  nextCursor?: string;
  totalCount: number;
}

// Customer search response
export interface CustomerSearchResponse {
  customers: (CustomerBasic & { appointmentCount: number })[];
  count: number;
}

// ============================================================================
// STATUS AND ENUM TYPES (Simple string literals)
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type UserRole = 'user' | 'admin';
export type DesignType = 'traditional' | 'realism' | 'japanese' | 'geometric' | 'other';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };