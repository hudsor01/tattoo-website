/**
 * Analytics database interactions
 *
 * This file handles the database operations for analytics data.
 * It provides functions to store and query analytics events.
 */

import { prisma } from '@/lib/db/db-client';
import { type AnalyticsEventType, type AnalyticsFilterType, EventCategory } from '@/types/analytics-types';
import { Prisma } from '@prisma/client';

/**
 * Core event functions
 */

/**
 * Store an analytics event in the database
 */
export async function storeAnalyticsEvent(event: AnalyticsEventType) {
  try {
    const metadata = extractEventMetadata(event);

    const storedEvent = await prisma.analyticsEvent.create({
      data: {
        timestamp: event.timestamp ?? new Date(),
        userId: event.userId ?? null,
        sessionId: event.sessionId ?? null,
        category: event.category,
        action: event.action,
        label: event.label ?? null,
        value: event.value ?? null,
        path: event.path ?? null,
        referrer: event.referrer ?? null,
        deviceType: event.deviceType ?? null,
        browser: event.browser ?? null,
        os: event.os ?? null
      },
    });

    return storedEvent;
  } catch (error) {
    console.error('Error storing analytics event:', error);
    throw error;
  }
}

/**
 * Query analytics events with filtering and pagination
 */
export async function queryAnalyticsEvents(filter: AnalyticsFilterType) {
  try {
    const {
      limit = 10,
      page,
      sortBy = 'timestamp',
      sortDir = 'desc',
    } = filter;

    const skip = ((page ?? 1) - 1) * limit;
    const where = buildQueryWhereClause(filter);

    const [events, totalCount] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: sortBy ? {
          [sortBy as string]: sortDir,
        } : {
          timestamp: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.analyticsEvent.count({ where }),
    ]);

    return {
      events,
      pagination: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error('Error querying analytics events:', error);
    throw error;
  }
}

/**
 * Analytics summaries and reports
 */

/**
 * Get analytics summary for a specific time period
 */
export async function getAnalyticsSummary(startDate: Date, endDate: Date) {
  try {
    const events = await fetchEventsByDateRange(startDate, endDate);
    const totalEvents = events.length;

    // Count events by category and action
    const eventsByCategory = countEventsByProperty(events, 'category');
    const eventsByAction = countEventsByProperty(events, 'action');

    // Get page view statistics
    const pageViewStats = getPageViewStatistics(events);

    // Count device types
    const deviceBreakdown = countEventsByProperty(
      events.filter(e => e.deviceType),
      'deviceType',
    );

    // Calculate conversion metrics
    const conversionMetrics = calculateConversionMetrics(events);

    // Calculate session metrics
    const sessionMetrics = calculateSessionMetrics(events);

    return {
      totalEvents,
      eventsByCategory,
      eventsByAction,
      topPages: pageViewStats.topPages,
      deviceBreakdown,
      ...conversionMetrics,
      ...sessionMetrics,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

/**
 * Get top performing designs based on views and interactions
 */
export async function getTopDesigns(limit: number = 10) {
  try {
    // Get events
    const [viewEvents, interactionEvents] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: {
          category: EventCategory.GALLERY,
          action: 'view',
        },
      }),
      prisma.analyticsEvent.findMany({
        where: {
          category: EventCategory.GALLERY,
          action: { not: 'view' },
        },
      }),
    ]);

    // Process design metrics
    const designMetrics = calculateDesignMetrics(viewEvents, interactionEvents);

    // Get top designs sorted by score
    const topDesigns = Object.entries(designMetrics)
      .map(([designId, stats]) => ({
        designId,
        views: stats.views,
        interactions: stats.interactions,
        score: stats.score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (topDesigns.length === 0) return [];

    // Fetch design details
    const designIds = topDesigns.map(design => design.designId).filter(id => id !== null && id !== undefined);
    const designDetails = await fetchDesignDetails(designIds);

    // Combine stats with details
    return topDesigns.map(stats => ({
      ...stats,
      details: designDetails.find(d => d.id === stats.designId) || null,
    }));
  } catch (error) {
    console.error('Error getting top designs:', error);
    throw error;
  }
}

/**
 * Get booking funnel analytics
 */
export async function getBookingFunnelAnalytics(startDate: Date, endDate: Date) {
  try {
    const bookingEvents = await prisma.analyticsEvent.findMany({
      where: {
        category: EventCategory.BOOKING,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const bookingActions = [
      'start',
      'select_service',
      'select_date',
      'enter_details',
      'payment',
      'complete',
      'abandon',
    ];

    // Calculate step metrics
    const stepCounts = calculateStepCounts(bookingEvents, bookingActions);
    const { conversionRates, stepTimings } = calculateFunnelMetrics(
      bookingEvents,
      bookingActions,
      stepCounts,
    );

    // Calculate overall metrics
    const startCount = stepCounts['start'] || 0;
    const completeCount = stepCounts['complete'] || 0;
    const abandonCount = stepCounts['abandon'] || 0;

    const overallCompletionRate = startCount > 0 ? (completeCount / startCount) * 100 : 0;

    const abandonmentRate = startCount > 0 ? (abandonCount / startCount) * 100 : 0;

    return {
      stepCounts,
      conversionRates,
      overallCompletionRate,
      stepTimings,
      totalBookings: completeCount,
      abandonmentRate,
    };
  } catch (error) {
    console.error('Error getting booking funnel analytics:', error);
    throw error;
  }
}

/**
 * Helper functions
 */

/**
 * Extract category-specific metadata based on event type
 */
function extractEventMetadata(event: AnalyticsEventType): Record<string, unknown> {
  const metadata = getCategorySpecificMetadata(event);
  // Safely serialize metadata to avoid circular references
  return JSON.parse(JSON.stringify(metadata));
}

/**
 * Extract category-specific fields from the event
 */
function getCategorySpecificMetadata(event: AnalyticsEventType): Record<string, unknown> {
  const getFieldValue = (field: string): unknown =>
    field in event ? event[field as keyof typeof event] : null;

  switch (event.category) {
    case EventCategory.PAGE_VIEW:
      return {
        pageTitle: getFieldValue('pageTitle'),
        pageType: getFieldValue('pageType'),
        loadTime: getFieldValue('loadTime'),
      };

    case EventCategory.INTERACTION:
      return {
        elementId: getFieldValue('elementId'),
        elementType: getFieldValue('elementType'),
        position: getFieldValue('position'),
      };

    case EventCategory.BOOKING:
      return {
        bookingId: getFieldValue('bookingId'),
        serviceId: getFieldValue('serviceId'),
        serviceName: getFieldValue('serviceName'),
        appointmentDate: getFieldValue('appointmentDate'),
        step: getFieldValue('step'),
        totalSteps: getFieldValue('totalSteps'),
        timeSpent: getFieldValue('timeSpent'),
      };

    case EventCategory.GALLERY:
      return {
        designId: getFieldValue('designId'),
        designType: getFieldValue('designType'),
        artist: getFieldValue('artist'),
        tags: getFieldValue('tags'),
        position: getFieldValue('position'),
        viewTime: getFieldValue('viewTime'),
      };

    case EventCategory.CONVERSION:
      return {
        conversionId: getFieldValue('conversionId'),
        conversionValue: getFieldValue('conversionValue'),
        conversionSource: getFieldValue('conversionSource'),
        conversionMedium: getFieldValue('conversionMedium'),
        couponCode: getFieldValue('couponCode'),
      };

    case EventCategory.ERROR:
      return {
        errorCode: getFieldValue('errorCode'),
        errorMessage: getFieldValue('errorMessage'),
        errorStack: getFieldValue('errorStack'),
        componentName: getFieldValue('componentName'),
        severity: getFieldValue('severity'),
      };

    default:
      return {};
  }
}

/**
 * Build a properly typed where clause for Prisma queries
 */
function buildQueryWhereClause(filter: AnalyticsFilterType): Prisma.AnalyticsEventWhereInput {
  const {
    startDate,
    endDate,
    categories,
    actions,
    userId,
    path,
    deviceType,
  } = filter;

  const where: Prisma.AnalyticsEventWhereInput = {};

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  if (categories?.length) where.category = { in: categories };
  if (actions?.length) where.action = { in: actions };
  if (userId) where.userId = userId;
  if (path) where.path = path;
  if (deviceType) where.deviceType = deviceType;

  return where;
}

/**
 * Count events by a specified property
 */
function countEventsByProperty<T extends Record<string, unknown>, K extends keyof T>(
  events: T[],
  property: K,
): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, event) => {
    const value = String(event[property]);
    if (value) acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Fetch events for a given date range
 */
async function fetchEventsByDateRange(startDate: Date, endDate: Date) {
  return prisma.analyticsEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
}

/**
 * Get page view statistics
 */
function getPageViewStatistics(events: Prisma.AnalyticsEventGetPayload<object>[] | Record<string, unknown>[]) {
  const pageViews = events.filter(
    event => event['category'] === EventCategory.PAGE_VIEW && event['path'],
  );

  const pageViewCounts = pageViews.reduce<Record<string, number>>((acc, event) => {
    if (event['path']) acc[event['path']] = (acc[event['path']] || 0) + 1;
    return acc;
  }, {});

  const topPages = Object.entries(pageViewCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { topPages };
}

/**
 * Calculate conversion metrics
 */
function calculateConversionMetrics(events: any[]) {
  const conversionEvents = events.filter(event => event.category === EventCategory.CONVERSION);
  const uniqueUsers = new Set(
    events.filter(event => event.userId).map(event => event.userId),
  );
  const uniqueConverters = new Set(
    conversionEvents.filter(event => event.userId).map(event => event.userId),
  );
  const conversionRate =
    uniqueUsers.size > 0 ? (uniqueConverters.size / uniqueUsers.size) * 100 : 0;
  return { conversionRate };
}

/**
 * Calculate session metrics
 */
function calculateSessionMetrics(events: any[]) {
  // Group events by session
  const sessions = new Map<string, any>();
  events
    .filter(event => event.sessionId)
    .forEach(event => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, []);
      }
      sessions.get(event.sessionId)?.push(event);
    });
  // Calculate average session duration
  let totalDuration = 0;
  sessions.forEach(sessionEvents => {
    if (sessionEvents.length > 1) {
      const sortedEvents = [...sessionEvents].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );
      const duration =
        (sortedEvents[sortedEvents.length - 1].timestamp.getTime() -
          sortedEvents[0].timestamp.getTime()) /
        1000;
      totalDuration += duration;
    }
  });
  const averageSessionDuration = sessions.size > 0 ? totalDuration / sessions.size : 0;
  // Calculate bounce rate
  const bounceSessions = [...sessions.entries()].filter(([, sessionEvents]) => {
    const pageViews = sessionEvents.filter(event => event.category === EventCategory.PAGE_VIEW);
    return pageViews.length === 1;
  });
  const bounceRate = sessions.size > 0 ? (bounceSessions.length / sessions.size) * 100 : 0;
  return {
    averageSessionDuration,
    bounceRate,
  };
}

/**
 * Calculate metrics for designs
 */
function calculateDesignMetrics(viewEvents: any[], interactionEvents: any[]) {
  // Count views
  const designViews: Record<string, number> = {};
  viewEvents.forEach(event => {
    const designId = event.metadata?.designId;
    if (designId) designViews[designId] = (designViews[designId] || 0) + 1;
  });
  // Count interactions
  const designInteractions: Record<string, number> = {};
  interactionEvents.forEach(event => {
    const designId = event.metadata?.designId;
    if (designId) designInteractions[designId] = (designInteractions[designId] || 0) + 1;
  });
  // Calculate scores
  const designMetrics: Record<string, {
    views: number;
    interactions: number;
    score: number;
  }> = {};
  // Process designs with views
  Object.entries(designViews).forEach(([designId, views]) => {
    const interactions = designInteractions[designId] || 0;
    designMetrics[designId] = { views, interactions, score: views + interactions * 2 };
  });
  // Add designs with interactions but no views
  Object.entries(designInteractions).forEach(([designId, interactions]) => {
    if (!designMetrics[designId]) {
      designMetrics[designId] = { views: 0, interactions, score: interactions * 2 };
    }
  });
  return designMetrics;
}

/**
 * Fetch design details by IDs
 */
async function fetchDesignDetails(designIds: string[]) {
  return prisma.galleryItem.findMany({
    where: { id: { in: designIds } },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      tags: true,
      artist: true,
    },
  });
}

/**
 * Calculate step counts for booking funnel
 */
function calculateStepCounts(bookingEvents: any[], bookingActions: string[]) {
  const stepCounts: Record<string, number> = {};
  bookingActions.forEach(action => {
    stepCounts[action] = bookingEvents.filter(
      event => event.action === action,
    ).length;
  });
  return stepCounts;
}

/**
 * Calculate funnel metrics
 */
function calculateFunnelMetrics(
  bookingEvents: any[],
  bookingActions: string[],
  stepCounts: Record<string, number>,
) {
  // Calculate conversion rates between steps
  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < bookingActions.length - 1; i++) {
    const currentStep = bookingActions[i];
    const nextStep = bookingActions[i + 1];
    const currentCount = stepCounts[currentStep] || 0;
    const nextCount = stepCounts[nextStep] || 0;
    conversionRates[`${currentStep}_to_${nextStep}`] =
      currentCount > 0 ? (nextCount / currentCount) * 100 : 0;
  }
  // Group events by session
  const sessionsWithTimings = new Map<string, Record<string, Date>>();
  bookingEvents.forEach(event => {
    if (event.sessionId) {
      if (!sessionsWithTimings.has(event.sessionId)) {
        sessionsWithTimings.set(event.sessionId, {});
      }
      sessionsWithTimings.get(event.sessionId)![event.action] = event.timestamp;
    }
  });
  // Calculate step timings
  const stepTimings = calculateStepTimings(sessionsWithTimings, bookingActions);
  return {
    conversionRates,
    stepTimings,
  };
}

/**
 * Calculate timing between funnel steps
 */
function calculateStepTimings(
  sessionsWithTimings: Map<string, Record<string, Date>>,
  bookingActions: string[],
) {
  const totalTimeSpent: Record<string, number> = {};
  const stepTimeCount: Record<string, number> = {};
  const stepTimings: Record<string, number> = {};
  sessionsWithTimings.forEach(session => {
    for (let i = 0; i < bookingActions.length - 1; i++) {
      const currentStep = bookingActions[i];
      const nextStep = bookingActions[i + 1];
      if (session[currentStep] && session[nextStep]) {
        const timeSpent = (session[nextStep].getTime() - session[currentStep].getTime()) / 1000;
        const key = `${currentStep}_to_${nextStep}`;
        totalTimeSpent[key] = (totalTimeSpent[key] || 0) + timeSpent;
        stepTimeCount[key] = (stepTimeCount[key] || 0) + 1;
      }
    }
  });
  // Calculate averages
  Object.keys(totalTimeSpent).forEach(key => {
    const timeCount = stepTimeCount[key] || 0;
    stepTimings[key] = timeCount > 0 ? totalTimeSpent[key] / timeCount : 0;
  });
  return stepTimings;
}