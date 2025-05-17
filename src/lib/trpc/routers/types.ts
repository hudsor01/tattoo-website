/**
 * Analytics Types
 * 
 * This file defines the types and schemas for analytics tracking
 */

import { z, safeArray } from '../utils/safe-zod';

/**
 * Event categories for analytics tracking
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
}

/**
 * Common properties for all events
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

export type BaseEventType = z.infer<typeof BaseEventSchema>;

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

export type PageViewEventType = z.infer<typeof PageViewEventSchema>;

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

export type InteractionEventType = z.infer<typeof InteractionEventSchema>;

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

export type BookingEventType = z.infer<typeof BookingEventSchema>;

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
  tags: safeArray(z.string()).optional(),
  position: z.number().optional(), // Position in list
  viewTime: z.number().optional(), // Time spent viewing in ms
});

export type GalleryEventType = z.infer<typeof GalleryEventSchema>;

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

export type ConversionEventType = z.infer<typeof ConversionEventSchema>;

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

export type ErrorEventType = z.infer<typeof ErrorEventSchema>;

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

export type AnalyticsEventType = z.infer<typeof AnalyticsEventSchema>;

/**
 * Filter schema for querying analytics data
 */
export const AnalyticsFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  categories: safeArray(z.nativeEnum(EventCategory)).optional(),
  actions: safeArray(z.string()).optional(),
  userId: z.string().optional(),
  path: z.string().optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
  page: z.number().min(1).optional().default(1),
  sortBy: z.string().optional().default('timestamp'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type AnalyticsFilterType = z.infer<typeof AnalyticsFilterSchema>;

/**
 * Analytics summary model
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
 * Time period options for analytics reporting
 */
export enum AnalyticsTimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}
