/**
 * validation-analytics.ts
 * 
 * Validation utilities for analytics events using Zod
 */

import { z } from 'zod';
import { useCallback } from 'react';
import { EventCategory } from '@/types/analytics-types';

/**
 * Base schema for all analytics events
 */
export const baseEventSchema = z.object({
  // Core metadata
  timestamp: z.union([z.date(), z.string().transform(s => new Date(s))]).optional().default(() => new Date()),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Event categorization
  category: z.nativeEnum(EventCategory),
  action: z.string().min(1, "Action is required"),
  label: z.string().optional(),
  value: z.number().optional(),
  
  // Context information
  path: z.string().optional(),
  referrer: z.string().optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  
  // Extended data
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Page view specific event schema
 */
export const pageViewEventSchema = baseEventSchema.extend({
  category: z.literal(EventCategory.PAGE_VIEW),
  action: z.literal('view'),
  pageTitle: z.string().min(1, "Page title is required"),
  pageType: z.string().optional(),
  loadTime: z.number().positive().optional(),
});

/**
 * Interaction event schema
 */
export const interactionEventSchema = baseEventSchema.extend({
  category: z.literal(EventCategory.INTERACTION),
  elementId: z.string().optional(),
  elementType: z.string().optional(),
  position: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
  }).optional(),
});

/**
 * Booking event schema
 */
export const bookingEventSchema = baseEventSchema.extend({
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
  appointmentDate: z.union([z.date(), z.string().transform(s => new Date(s))]).optional(),
  step: z.number().int().positive().optional(),
  totalSteps: z.number().int().positive().optional(),
  timeSpent: z.number().positive().optional(),
});

/**
 * Gallery event schema
 */
export const galleryEventSchema = baseEventSchema.extend({
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
  position: z.number().optional(),
  viewTime: z.number().positive().optional(),
});

/**
 * Conversion event schema
 */
export const conversionEventSchema = baseEventSchema.extend({
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
export const errorEventSchema = baseEventSchema.extend({
  category: z.literal(EventCategory.ERROR),
  action: z.literal('error'),
  errorCode: z.string().optional(),
  errorMessage: z.string().min(1, "Error message is required"),
  errorStack: z.string().optional(),
  componentName: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * Combined schema for all event types
 */
export const analyticsEventSchema = z.discriminatedUnion('category', [
  pageViewEventSchema,
  interactionEventSchema,
  bookingEventSchema,
  galleryEventSchema,
  conversionEventSchema,
  errorEventSchema,
]);

/**
 * Hook for using the base event schema (for validation)
 */
export function useBaseEventSchema() {
  return {
    baseEventSchema,
    validateBaseEvent: useCallback((event: unknown) => baseEventSchema.parse(event), []),
  };
}

/**
 * Hook for using the full analytics event schema (for validation)
 */
export function useAnalyticsEventSchema() {
  return {
    analyticsEventSchema,
    validateEvent: useCallback((event: unknown) => analyticsEventSchema.parse(event), []),
  };
}

/**
 * Validate an analytics event against the appropriate schema
 * 
 * @param event The event to validate
 * @returns The parsed event or throws an error
 */
export function validateAnalyticsEvent(event: unknown) {
  return analyticsEventSchema.parse(event);
}