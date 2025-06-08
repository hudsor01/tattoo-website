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

// Core Entity Types (only types that exist in current schema)
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
  Payment,
  CalAnalyticsEvent,
  CalBookingFunnel,
  CalServiceAnalytics,
  CalRealtimeMetrics,
  BookingStatus,
  ContactStatus,
  PaymentStatus,
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
export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

// Booking form data
export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tattooType: string;
  size?: string;
  placement?: string;
  description?: string;
  preferredDate: Date;
};

// Customer form data  
export type CustomerFormData = Pick<
  CustomerCreateInput,
  'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'city' | 'state' | 'postalCode'
>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = Record<string, unknown>> {
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

// Gallery File System Types
export interface GalleryFile {
  id: string;
  type: 'image' | 'video';
  src: string;
  name: string;
  description: string;
  designType: string;
  size: string;
}

export interface GalleryFilesResponse {
  success: boolean;
  files: GalleryFile[];
  total: number;
}

// Customer search response
export interface CustomerSearchResponse {
  customers: (CustomerBasic & { appointmentCount: number })[];
  count: number;
}

// ============================================================================
// STATUS AND ENUM TYPES (Simple string literals)
// ============================================================================

export type UserRole = 'user' | 'admin';
export type DesignType = 'traditional' | 'realism' | 'japanese' | 'geometric' | 'other';

// ============================================================================
// MISSING TYPES FOR LEGACY COMPONENTS
// ============================================================================

// FAQ types (for components that reference non-existent FAQ models)
export interface FAQItemType {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface FAQSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  title: string;
  icon?: string;
  items: FAQItemType[];
}

export interface AllFAQItem {
  category: string;
  id: string;
  item: FAQItemType;
}

// Cal.com integration types (legacy) - Updated to match config
export interface CalService {
  id: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  calEventTypeId: number;
  eventTypeSlug: string;
  bufferTime?: number;
  maxAdvanceBooking?: number;
  requiresApproval: boolean;
  features: string[];
  category: string;
  isActive: boolean;
}

export interface CalEventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  length: number;
  price?: number;
}

export interface CalBooking {
  id: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
}

export interface CalBookingPayload {
  id: string;
  uid: string;
  eventTypeId: number;
  userId: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  location?: string;
  paid: boolean;
  payment?: Array<{
    id: number;
    success: boolean;
    paymentOption: string;
  }>;
}

// Component prop types
export interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  customClassName?: string;
  variant?: 'default' | 'gradient' | 'minimal';
  className?: string;
}

// Form state types
export interface ContactFormState {
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    subject?: string[];
    message?: string[];
  };
  rateLimitInfo?: {
    remaining: number;
    reset: number;
    limit: number;
    retryAfter: number;
    timeRemaining: number;
  };
}

// Pricing types
export interface PricingBreakdown {
  basePrice: number;
  additionalCharges: Array<{
    description: string;
    amount: number;
  }>;
  total: number;
}

export interface StandardPricingData {
  hourlyRate: number;
  minimumCharge: number;
  consultationFee: number;
}

export interface ArtistRate {
  artistId: string;
  hourlyRate: number;
  minimumCharge: number;
  specialtyRates: Record<string, number>;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// Request options for API calls
export interface RequestOptions {
  signal?: AbortSignal;
  cache?: RequestCache;
  timeout?: number;
  retries?: number;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  validationErrors?: Record<string, string[]>;
}

// Analytics error type
export interface AnalyticsError {
  code: string;
  message: string;
  timestamp: number;
  stack?: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };