/**
 * Type definitions for analytics-related features including event tracking,
 * data collection, and reporting.
 */

import { z } from 'zod';

/**
 * Event category enumeration
 */
export enum EventCategory {
  PAGE_VIEW = 'page_view',
  INTERACTION = 'interaction',
  BOOKING = 'booking',
  GALLERY = 'gallery',
  ADMIN = 'admin',
  CLIENT = 'client',
  CONVERSION = 'conversion',
  ERROR = 'error',
  SYSTEM = 'system' // Added system category
}

/**
 * Base analytics event type
 */
export interface BaseEventType {
  // Metadata
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
  
  // Event information
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  
  // Context
  path?: string;
  referrer?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  os?: string;
}

/**
 * Page view event
 */
export interface PageViewEventType extends BaseEventType {
  category: EventCategory.PAGE_VIEW;
  action: 'view';
  pageTitle: string;
  pageType?: string;
  loadTime?: number;
}

/**
 * User interaction event
 */
export interface InteractionEventType extends BaseEventType {
  category: EventCategory.INTERACTION;
  action: string;
  elementId?: string;
  elementType?: string;
  position?: {
    x?: number;
    y?: number;
  };
}

/**
 * Booking-related event
 */
export interface BookingEventType extends BaseEventType {
  category: EventCategory.BOOKING;
  action: 'start' | 'select_service' | 'select_date' | 'enter_details' | 'payment' | 'complete' | 'abandon';
  bookingId?: string;
  serviceId?: string;
  serviceName?: string;
  appointmentDate?: Date;
  step?: number;
  totalSteps?: number;
  timeSpent?: number;
}

/**
 * Gallery-related event
 */
export interface GalleryEventType extends BaseEventType {
  category: EventCategory.GALLERY;
  action: 'view' | 'filter' | 'search' | 'open_details' | 'share' | 'favorite' | 'unfavorite' | 'zoom' | 'swipe' | 'download' | 'request_similar';
  designId?: string;
  designType?: string;
  artist?: string;
  tags?: string[];
  position?: number; // Position in list
  viewTime?: number; // Time spent viewing in ms
}

/**
 * Conversion event
 */
export interface ConversionEventType extends BaseEventType {
  category: EventCategory.CONVERSION;
  action: 'signup' | 'book_appointment' | 'purchase' | 'contact_request' | 'newsletter_signup' | 'download_asset';
  conversionId?: string;
  conversionValue?: number;
  conversionSource?: string;
  conversionMedium?: string;
  couponCode?: string;
}

/**
 * Error event
 */
export interface ErrorEventType extends BaseEventType {
  category: EventCategory.ERROR;
  action: 'error';
  errorCode?: string;
  errorMessage: string;
  errorStack?: string;
  componentName?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Union type for all analytics events
 */
export type AnalyticsEventType =
  | PageViewEventType
  | InteractionEventType
  | BookingEventType
  | GalleryEventType
  | ConversionEventType
  | ErrorEventType;

/**
 * Analytics filter options
 */
export interface AnalyticsFilterType {
  startDate?: Date;
  endDate?: Date;
  categories?: EventCategory[];
  actions?: string[];
  userId?: string;
  path?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  limit?: number;
  page?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Time period for analytics reporting
 */
export enum AnalyticsTimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

/**
 * Analytics summary data
 */
export interface AnalyticsSummary {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsByAction: Record<string, number>;
  topPages: Array<{path: string; count: number}>;
  deviceBreakdown: Record<string, number>;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
}

/**
 * Event types schema for validation
 */
export const EventTypeSchema = z.enum([
  'page_view',
  'gallery_view',
  'design_view',
  'booking_started',
  'booking_completed',
  'contact_submitted',
]);

/**
 * Schema for tracking events
 */
export const TrackEventSchema = z.object({
  eventType: EventTypeSchema,
  itemId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  clientId: z.string().optional(), // Anonymous client identifier
});

/**
 * Base Event Schema for validation
 */
export const BaseEventSchema = z.object({
  // Metadata
  timestamp: z.date().optional().default(() => new Date()),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Event information
  category: z.nativeEnum(EventCategory),
  action: z.string(),
  label: z.string().optional(),
  value: z.number().optional(),
  
  // Context
  path: z.string().optional(),
  referrer: z.string().optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

/**
 * Page view event schema
 */
export const PageViewEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.PAGE_VIEW),
  action: z.literal('view'),
  pageTitle: z.string(),
  pageType: z.string().optional(),
  loadTime: z.number().optional(),
});

/**
 * Interaction event schema for user actions
 */
export const InteractionEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.INTERACTION),
  action: z.string(),
  elementId: z.string().optional(),
  elementType: z.string().optional(),
  position: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
  }).optional(),
});

/**
 * Booking flow event schema
 */
export const BookingEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.BOOKING),
  action: z.enum([
    'start', 
    'select_service', 
    'select_date', 
    'enter_details', 
    'payment', 
    'complete', 
    'abandon'
  ]),
  bookingId: z.string().optional(),
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  appointmentDate: z.date().optional(),
  step: z.number().optional(),
  totalSteps: z.number().optional(),
  timeSpent: z.number().optional(),
});

/**
 * Gallery interaction event schema
 */
export const GalleryEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.GALLERY),
  action: z.enum([
    'view',
    'filter',
    'search',
    'open_details',
    'share',
    'favorite',
    'unfavorite',
    'zoom',
    'swipe',
    'download',
    'request_similar'
  ]),
  designId: z.string().optional(),
  designType: z.string().optional(),
  artist: z.string().optional(),
  tags: z.array(z.string()).optional(),
  position: z.number().optional(), // Position in list
  viewTime: z.number().optional(), // Time spent viewing in ms
});

/**
 * Conversion event schema
 */
export const ConversionEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.CONVERSION),
  action: z.enum([
    'signup',
    'book_appointment',
    'purchase',
    'contact_request',
    'newsletter_signup',
    'download_asset'
  ]),
  conversionId: z.string().optional(),
  conversionValue: z.number().optional(),
  conversionSource: z.string().optional(),
  conversionMedium: z.string().optional(),
  couponCode: z.string().optional(),
});

/**
 * Error event schema
 */
export const ErrorEventSchema = BaseEventSchema.extend({
  category: z.literal(EventCategory.ERROR),
  action: z.literal('error'),
  errorCode: z.string().optional(),
  errorMessage: z.string(),
  errorStack: z.string().optional(),
  componentName: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * Complete analytics event schema combining all event types
 */
export const AnalyticsEventSchema = z.discriminatedUnion('category', [
  PageViewEventSchema,
  InteractionEventSchema,
  BookingEventSchema,
  GalleryEventSchema,
  ConversionEventSchema,
  ErrorEventSchema,
]);

/**
 * Filter schema for querying analytics data
 */
export const AnalyticsFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  categories: z.array(z.nativeEnum(EventCategory)).optional(),
  actions: z.array(z.string()).optional(),
  userId: z.string().optional(),
  path: z.string().optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
  page: z.number().min(1).optional().default(1),
  sortBy: z.string().optional().default('timestamp'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * This interface represents both stored events and streamed events,
 * providing a single source of truth for analytics event structure.
 */
export interface AnalyticsEvent {
  id?: string;
  timestamp: Date | string;
  userId?: string;
  sessionId?: string;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  path?: string;
  referrer?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  os?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics Stream Event Interface
 * Used for Server-Sent Events (SSE) communication
 */
export interface AnalyticsStreamEvent {
  type: string;
  data: Omit<AnalyticsEvent, 'id' | 'timestamp'> & {
    metadata?: Record<string, unknown>;
  };
  timestamp: number | string;
}

/**
 * Standardized stream event types
 */
export enum AnalyticsStreamEventType {
  NEW_EVENT = 'new_event',
  PAGE_VIEW = 'page_view',
  USER_INTERACTION = 'user_interaction',
  BOOKING_CREATED = 'booking_created',
  PAYMENT_PROCESSED = 'payment_processed',
  CONTACT_SUBMITTED = 'contact_submitted',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  ERROR_OCCURRED = 'error_occurred',
  STATS_UPDATE = 'stats_update',
  HEARTBEAT = 'heartbeat',
}

/**
 * Event counts state for live analytics dashboard
 */
export interface EventCountsState {
  total: number;
  pageViews: number;
  conversions: number;
  errors: number;
  byCategory: Record<string, number>;
}