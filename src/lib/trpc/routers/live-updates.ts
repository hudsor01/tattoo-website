/**
 * Real-time analytics updates
 *
 * This file provides functionality for streaming analytics events
 * and updates to connected clients via Server-Sent Events (SSE).
 */

import { EventEmitter } from 'events';
import { AnalyticsEventType } from './types';

// Create a global event emitter for analytics events
const analyticsEventEmitter = new EventEmitter();

// Set a high max listener count to avoid warnings
analyticsEventEmitter.setMaxListeners(100);

// Event types
export enum AnalyticsStreamEvents {
  NEW_EVENT = 'new_event',
  STATS_UPDATE = 'stats_update',
  CONVERSION = 'conversion',
  ERROR_OCCURRED = 'error_occurred',
  TOP_DESIGNS_CHANGE = 'top_designs_change',
}

/**
 * Emit an analytics event to all subscribers
 */
export function emitAnalyticsEvent(eventType: AnalyticsStreamEvents, data: unknown) {
  analyticsEventEmitter.emit(eventType, data);
}

/**
 * Track a new analytics event and emit it to subscribers
 */
export function trackAndEmitEvent(event: AnalyticsEventType) {
  // Emit the new event
  emitAnalyticsEvent(AnalyticsStreamEvents.NEW_EVENT, event);

  // For conversions, also emit a specific conversion event
  if (event.category === 'conversion') {
    emitAnalyticsEvent(AnalyticsStreamEvents.CONVERSION, event);
  }

  // For errors, emit an error event
  if (event.category === 'error') {
    emitAnalyticsEvent(AnalyticsStreamEvents.ERROR_OCCURRED, event);
  }
}

/**
 * Subscribe to analytics events
 */
export function subscribeToAnalyticsEvents(
  eventType: AnalyticsStreamEvents,
  callback: (data: unknown) => void,
) {
  analyticsEventEmitter.on(eventType, callback);

  // Return unsubscribe function
  return () => {
    analyticsEventEmitter.off(eventType, callback);
  };
}

/**
 * Format an event for SSE
 */
export function formatSSEEvent(eventType: string, data: unknown) {
  return `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Create an SSE connection for streaming analytics updates
 */
export async function createAnalyticsStream(res: Response) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      // Send initial message
      controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'));

      // Set up event handlers for the stream
      const eventHandlers = Object.values(AnalyticsStreamEvents).map(eventType => {
        const handler = (data: unknown) => {
          const formattedEvent = formatSSEEvent(eventType, data);
          controller.enqueue(encoder.encode(formattedEvent));
        };

        analyticsEventEmitter.on(eventType, handler);

        // Return cleanup function and event type for later removal
        return { handler, eventType };
      });

      // Set up heartbeat interval
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${Date.now()}\n\n`));
      }, 30000); // Send heartbeat every 30 seconds

      // Add listener to detect client disconnection
      res.signal.addEventListener('abort', () => {
        // Clean up event listeners
        eventHandlers.forEach(({ handler, eventType }) => {
          analyticsEventEmitter.off(eventType, handler);
        });

        // Clear heartbeat interval
        clearInterval(heartbeatInterval);

        // Close the stream
        controller.close();
      });
    },
  });

  return readable;
}

/**
 * Update stats for subscribers
 */
export async function updateStats(startDate: Date, endDate: Date) {
  // Implement stats recalculation logic here
  // This would typically query the database to calculate latest statistics

  // For performance reasons, in a real implementation you might:
  // 1. Use a caching layer
  // 2. Use a worker to calculate stats periodically
  // 3. Batch multiple update requests

  // For now, we'll emit a simple timestamp update
  emitAnalyticsEvent(AnalyticsStreamEvents.STATS_UPDATE, {
    timestamp: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  });
}

/**
 * Update top designs for subscribers
 */
export async function updateTopDesigns() {
  // This would typically recalculate the top designs
  // For a real implementation, this would query the database

  emitAnalyticsEvent(AnalyticsStreamEvents.TOP_DESIGNS_CHANGE, {
    timestamp: new Date().toISOString(),
  });
}
