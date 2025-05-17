/**
 * analytics-types.ts
 *
 * Type definitions for analytics-related features including event tracking,
 * data collection, and reporting.
 */

import { z } from 'zod';

/**
 * Event category enumeration
 */
export enum EventCategory {
  PAGE = 'page',
  INTERACTION = 'interaction',
  BOOKING = 'booking',
  GALLERY = 'gallery',
  CONVERSION = 'conversion',
  ERROR = 'error'
}

/**
 * Base analytics event type
 */
export interface BaseEventType {
  category: EventCategory;
  timestamp?: Date;
  sessionId?: string;
  userId?: string;
  clientId?: string;
  url?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Page view event
 */
export interface PageViewEventType extends BaseEventType {
  category: EventCategory.PAGE;
  path: string;
  title?: string;
  pageParams?: Record<string, string>;
  timeOnPage?: number;
}

/**
 * User interaction event
 */
export interface InteractionEventType extends BaseEventType {
  category: EventCategory.INTERACTION;
  action: 'click' | 'scroll' | 'hover' | 'submit' | 'form_field' | 'other';
  elementId?: string;
  elementType?: string;
  value?: string | number;
}

/**
 * Booking-related event
 */
export interface BookingEventType extends BaseEventType {
  category: EventCategory.BOOKING;
  action: 'started' | 'step_completed' | 'completed' | 'abandoned' | 'edited';
  step?: string;
  bookingId?: string | number;
  artistId?: string;
  sessionLength?: number;
}

/**
 * Gallery-related event
 */
export interface GalleryEventType extends BaseEventType {
  category: EventCategory.GALLERY;
  action: 'view' | 'filter' | 'sort' | 'download' | 'share';
  imageId?: string;
  filterId?: string;
  artistId?: string;
  viewTime?: number;
}

/**
 * Conversion event
 */
export interface ConversionEventType extends BaseEventType {
  category: EventCategory.CONVERSION;
  action: 'lead_form' | 'contact_form' | 'booking_completed' | 'payment' | 'sign_up';
  conversionId?: string;
  value?: number;
  currency?: string;
}

/**
 * Error event
 */
export interface ErrorEventType extends BaseEventType {
  category: EventCategory.ERROR;
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
  component?: string;
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
  startDate?: Date | string;
  endDate?: Date | string;
  category?: EventCategory | EventCategory[];
  action?: string | string[];
  userId?: string;
  clientId?: string;
  path?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnSite: number;
  bookingConversionRate: number;
  contactFormSubmissions: number;
  topReferrers: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  timeSpentDistribution: Record<string, number>;
  periodComparison?: {
    previousPeriod: {
      totalViews: number;
      uniqueVisitors: number;
      conversionRate: number;
    };
    percentageChange: {
      totalViews: number;
      uniqueVisitors: number;
      conversionRate: number;
    };
  };
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