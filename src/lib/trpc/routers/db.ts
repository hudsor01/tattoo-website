/**
 * Analytics database interactions
 *
 * This file handles the database operations for analytics data.
 * It provides functions to store and query analytics events.
 */

import { prisma } from '@/lib/db/db-client';
import { AnalyticsEventType, AnalyticsFilterType, EventCategory } from './types';

/**
 * Store an analytics event in the database
 */
export async function storeAnalyticsEvent(event: AnalyticsEventType) {
  try {
    // Ensure the analytics table exists in the database
    // This is handled by Prisma migrations, but defined here for clarity

    // Create the event record
    const storedEvent = await prisma.analyticsEvent.create({
      data: {
        timestamp: event.timestamp,
        userId: event.userId,
        sessionId: event.sessionId,
        category: event.category,
        action: event.action,
        label: event.label || null,
        value: event.value || null,
        path: event.path || null,
        referrer: event.referrer || null,
        deviceType: event.deviceType || null,
        browser: event.browser || null,
        os: event.os || null,

        // Handle specialized fields based on event category
        metadata: {
          // Store category-specific fields as JSON metadata
          ...getCategorySpecificMetadata(event),
        },
      },
    });

    return storedEvent;
  } catch (error) {
    console.error('Error storing analytics event:', error);
    throw error;
  }
}

/**
 * Query analytics events from the database
 */
export async function queryAnalyticsEvents(filter: AnalyticsFilterType) {
  try {
    const {
      startDate,
      endDate,
      categories,
      actions,
      userId,
      path,
      deviceType,
      limit,
      page,
      sortBy,
      sortDir,
    } = filter;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build the where clause based on the filter
    const where: unknown = {};

    if (startDate) {
      where.timestamp = { ...(where.timestamp || {}), gte: startDate };
    }

    if (endDate) {
      where.timestamp = { ...(where.timestamp || {}), lte: endDate };
    }

    if (categories?.length) {
      where.category = { in: categories };
    }

    if (actions?.length) {
      where.action = { in: actions };
    }

    if (userId) {
      where.userId = userId;
    }

    if (path) {
      where.path = path;
    }

    if (deviceType) {
      where.deviceType = deviceType;
    }

    // Query the events with pagination
    const [events, totalCount] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: {
          [sortBy]: sortDir,
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
 * Get analytics summary for a given time period
 */
export async function getAnalyticsSummary(startDate: Date, endDate: Date) {
  try {
    // Get events in the specified time period
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate summary statistics
    const totalEvents = events.length;

    // Events by category
    const eventsByCategory = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});

    // Events by action
    const eventsByAction = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {});

    // Top pages
    const pageViews = events.filter(
      event => event.category === EventCategory.PAGE_VIEW && event.path,
    );

    const pageViewCounts: Record<string, number> = {};
    pageViews.forEach(event => {
      if (event.path) {
        pageViewCounts[event.path] = (pageViewCounts[event.path] || 0) + 1;
      }
    });

    const topPages = Object.entries(pageViewCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown = events.reduce<Record<string, number>>((acc, event) => {
      if (event.deviceType) {
        acc[event.deviceType] = (acc[event.deviceType] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate conversion rate (users who completed a conversion action)
    const conversionEvents = events.filter(event => event.category === EventCategory.CONVERSION);

    const uniqueUsers = new Set(events.filter(event => event.userId).map(event => event.userId));

    const uniqueConverters = new Set(
      conversionEvents.filter(event => event.userId).map(event => event.userId),
    );

    const conversionRate =
      uniqueUsers.size > 0 ? (uniqueConverters.size / uniqueUsers.size) * 100 : 0;

    // Calculate session metrics
    const sessions = new Map<string, any[]>();
    events
      .filter(event => event.sessionId)
      .forEach(event => {
        if (event.sessionId) {
          if (!sessions.has(event.sessionId)) {
            sessions.set(event.sessionId, []);
          }
          sessions.get(event.sessionId)?.push(event);
        }
      });

    // Average session duration in seconds
    let totalDuration = 0;
    sessions.forEach(sessionEvents => {
      if (sessionEvents.length > 1) {
        const sortedEvents = [...sessionEvents].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );

        const firstEvent = sortedEvents[0];
        const lastEvent = sortedEvents[sortedEvents.length - 1];

        const duration = (lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()) / 1000;

        totalDuration += duration;
      }
    });

    const averageSessionDuration = sessions.size > 0 ? totalDuration / sessions.size : 0;

    // Bounce rate (percentage of sessions with only one page view)
    const bounceSessions = [...sessions.entries()].filter(([_, sessionEvents]) => {
      const pageViews = sessionEvents.filter(event => event.category === EventCategory.PAGE_VIEW);
      return pageViews.length === 1;
    });

    const bounceRate = sessions.size > 0 ? (bounceSessions.length / sessions.size) * 100 : 0;

    return {
      totalEvents,
      eventsByCategory,
      eventsByAction,
      topPages,
      deviceBreakdown,
      conversionRate,
      averageSessionDuration,
      bounceRate,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

/**
 * Get the top performing designs based on views and interactions
 */
export async function getTopDesigns(limit: number = 10) {
  try {
    // Get all gallery view events
    const galleryEvents = await prisma.analyticsEvent.findMany({
      where: {
        category: EventCategory.GALLERY,
        action: 'view',
      },
    });

    // Count views by design ID
    const designViews: Record<string, number> = {};
    galleryEvents.forEach(event => {
      const designId = event.metadata?.designId;
      if (designId) {
        designViews[designId] = (designViews[designId] || 0) + 1;
      }
    });

    // Get interaction events for the designs
    const interactionEvents = await prisma.analyticsEvent.findMany({
      where: {
        category: EventCategory.GALLERY,
        action: { not: 'view' },
      },
    });

    // Count interactions by design ID
    const designInteractions: Record<string, number> = {};
    interactionEvents.forEach(event => {
      const designId = event.metadata?.designId;
      if (designId) {
        designInteractions[designId] = (designInteractions[designId] || 0) + 1;
      }
    });

    // Combine views and interactions for a final score
    // Score = views + (interactions * 2) to give more weight to interactions
    const designScores: Record<string, { views: number; interactions: number; score: number }> = {};

    // Add all designs with views
    Object.entries(designViews).forEach(([designId, views]) => {
      const interactions = designInteractions[designId] || 0;
      const score = views + interactions * 2;

      designScores[designId] = { views, interactions, score };
    });

    // Make sure to include designs with interactions but no views
    Object.entries(designInteractions).forEach(([designId, interactions]) => {
      if (!designScores[designId]) {
        const views = 0;
        const score = interactions * 2;

        designScores[designId] = { views, interactions, score };
      }
    });

    // Sort designs by score and get the top ones
    const topDesigns = Object.entries(designScores)
      .map(([designId, stats]) => ({
        designId,
        views: stats.views,
        interactions: stats.interactions,
        score: stats.score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fetch the actual design details for the top designs
    const designIds = topDesigns.map(design => design.designId);

    const designDetails = await prisma.galleryItem.findMany({
      where: {
        id: { in: designIds },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        tags: true,
        artist: true,
      },
    });

    // Merge the details with the statistics
    const result = topDesigns.map(stats => {
      const details = designDetails.find(design => design.id === stats.designId);
      return {
        ...stats,
        details: details || null,
      };
    });

    return result;
  } catch (error) {
    console.error('Error getting top designs:', error);
    throw error;
  }
}

/**
 * Get tracking data for the booking funnel
 */
export async function getBookingFunnelAnalytics(startDate: Date, endDate: Date) {
  try {
    // Get all booking events in the specified time period
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

    // Count events for each step of the funnel
    const stepCounts: Record<string, number> = {};
    const bookingActions = [
      'start',
      'select_service',
      'select_date',
      'enter_details',
      'payment',
      'complete',
      'abandon',
    ];

    bookingActions.forEach(action => {
      stepCounts[action] = bookingEvents.filter(event => event.action === action).length;
    });

    // Calculate conversion rates between steps
    const conversionRates: Record<string, number> = {};
    for (let i = 0; i < bookingActions.length - 1; i++) {
      const currentStep = bookingActions[i];
      const nextStep = bookingActions[i + 1];

      const currentCount = stepCounts[currentStep];
      const nextCount = stepCounts[nextStep];

      conversionRates[`${currentStep}_to_${nextStep}`] =
        currentCount > 0 ? (nextCount / currentCount) * 100 : 0;
    }

    // Calculate overall funnel completion rate
    const startCount = stepCounts['start'];
    const completeCount = stepCounts['complete'];

    const overallCompletionRate = startCount > 0 ? (completeCount / startCount) * 100 : 0;

    // Calculate average time spent at each step
    const stepTimings: Record<string, number> = {};
    const sessionsWithTimings = new Map<string, Record<string, Date>>();

    // Group events by session and collect timestamps for each step
    bookingEvents.forEach(event => {
      if (event.sessionId) {
        if (!sessionsWithTimings.has(event.sessionId)) {
          sessionsWithTimings.set(event.sessionId, {});
        }

        const sessionData = sessionsWithTimings.get(event.sessionId)!;
        sessionData[event.action] = event.timestamp;
      }
    });

    // Calculate average time difference between steps
    const totalTimeSpent: Record<string, number> = {};
    const stepTimeCount: Record<string, number> = {};

    sessionsWithTimings.forEach(session => {
      for (let i = 0; i < bookingActions.length - 1; i++) {
        const currentStep = bookingActions[i];
        const nextStep = bookingActions[i + 1];

        if (session[currentStep] && session[nextStep]) {
          const timeSpent = (session[nextStep].getTime() - session[currentStep].getTime()) / 1000; // in seconds

          const key = `${currentStep}_to_${nextStep}`;
          totalTimeSpent[key] = (totalTimeSpent[key] || 0) + timeSpent;
          stepTimeCount[key] = (stepTimeCount[key] || 0) + 1;
        }
      }
    });

    // Calculate averages
    Object.keys(totalTimeSpent).forEach(key => {
      stepTimings[key] = stepTimeCount[key] > 0 ? totalTimeSpent[key] / stepTimeCount[key] : 0;
    });

    return {
      stepCounts,
      conversionRates,
      overallCompletionRate,
      stepTimings,
      totalBookings: completeCount,
      abandonmentRate: startCount > 0 ? (stepCounts['abandon'] / startCount) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting booking funnel analytics:', error);
    throw error;
  }
}

/**
 * Extract category-specific metadata based on event type
 */
function getCategorySpecificMetadata(event: AnalyticsEventType): Record<string, unknown> {
  switch (event.category) {
    case EventCategory.PAGE_VIEW:
      return {
        pageTitle: 'pageTitle' in event ? event.pageTitle : null,
        pageType: 'pageType' in event ? event.pageType : null,
        loadTime: 'loadTime' in event ? event.loadTime : null,
      };

    case EventCategory.INTERACTION:
      return {
        elementId: 'elementId' in event ? event.elementId : null,
        elementType: 'elementType' in event ? event.elementType : null,
        position: 'position' in event ? event.position : null,
      };

    case EventCategory.BOOKING:
      return {
        bookingId: 'bookingId' in event ? event.bookingId : null,
        serviceId: 'serviceId' in event ? event.serviceId : null,
        serviceName: 'serviceName' in event ? event.serviceName : null,
        appointmentDate: 'appointmentDate' in event ? event.appointmentDate : null,
        step: 'step' in event ? event.step : null,
        totalSteps: 'totalSteps' in event ? event.totalSteps : null,
        timeSpent: 'timeSpent' in event ? event.timeSpent : null,
      };

    case EventCategory.GALLERY:
      return {
        designId: 'designId' in event ? event.designId : null,
        designType: 'designType' in event ? event.designType : null,
        artist: 'artist' in event ? event.artist : null,
        tags: 'tags' in event ? event.tags : null,
        position: 'position' in event ? event.position : null,
        viewTime: 'viewTime' in event ? event.viewTime : null,
      };

    case EventCategory.CONVERSION:
      return {
        conversionId: 'conversionId' in event ? event.conversionId : null,
        conversionValue: 'conversionValue' in event ? event.conversionValue : null,
        conversionSource: 'conversionSource' in event ? event.conversionSource : null,
        conversionMedium: 'conversionMedium' in event ? event.conversionMedium : null,
        couponCode: 'couponCode' in event ? event.couponCode : null,
      };

    case EventCategory.ERROR:
      return {
        errorCode: 'errorCode' in event ? event.errorCode : null,
        errorMessage: 'errorMessage' in event ? event.errorMessage : null,
        errorStack: 'errorStack' in event ? event.errorStack : null,
        componentName: 'componentName' in event ? event.componentName : null,
        severity: 'severity' in event ? event.severity : null,
      };

    default:
      return {};
  }
}
