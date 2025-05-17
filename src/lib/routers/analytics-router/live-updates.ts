/**
 * Analytics Router Live Updates Configuration
 * 
 * This module defines the event types and interfaces used for
 * real-time analytics data streaming via Server-Sent Events (SSE).
 */

/**
 * Event types for the analytics stream
 */
export enum AnalyticsStreamEvents {
  NEW_EVENT = 'new_event',
  STATS_UPDATE = 'stats_update',
  CONVERSION = 'conversion',
  ERROR_OCCURRED = 'error_occurred',
  TOP_DESIGNS_CHANGE = 'top_designs_change',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  HEARTBEAT = 'heartbeat',
  CONNECTED = 'connected',
}

/**
 * Interface for analytics data points
 */
export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
  label: string;
}

/**
 * Interface for realtime stats updates
 */
export interface RealtimeStatsUpdate {
  activeUsers: number;
  pageViewsToday: number;
  conversionRate: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  dataPoints: AnalyticsDataPoint[];
}

/**
 * Interface for conversion events
 */
export interface ConversionEvent {
  userId?: string;
  sessionId: string;
  type: 'booking' | 'contact' | 'payment';
  value?: number;
  path: string;
  timestamp: string;
}

/**
 * Interface for error events
 */
export interface ErrorEvent {
  userId?: string;
  sessionId: string;
  errorType: string;
  errorMessage: string;
  path: string;
  browser: string;
  timestamp: string;
}

/**
 * Interface for top designs change events
 */
export interface TopDesignsChangeEvent {
  designs: Array<{
    id: string;
    title: string;
    views: number;
    rank: number;
    previousRank: number | null;
  }>;
  timeframe: 'day' | 'week' | 'month';
}

/**
 * Configure server-sent events for analytics routes
 */
export function configureAnalyticsSSE(req: Request, res: Response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
  };

  return { headers };
}

/**
 * Format data for SSE
 */
export function formatSSEData(event: string, data: any) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Sends an SSE heartbeat to keep connections alive
 */
export function sendHeartbeat(writer: WritableStreamDefaultWriter) {
  const heartbeat = formatSSEData(AnalyticsStreamEvents.HEARTBEAT, { time: new Date().toISOString() });
  writer.write(new TextEncoder().encode(heartbeat));
}

/**
 * Create an analytics stream for real-time updates
 */
export async function createAnalyticsStream(res: Response): Promise<ReadableStream> {
  // Create a new ReadableStream with a controller to manage data flow
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const encoder = new TextEncoder();
      const connectEvent = formatSSEData(AnalyticsStreamEvents.CONNECTED, {
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        message: 'Connected to analytics stream'
      });
      controller.enqueue(encoder.encode(connectEvent));
      
      // Set up interval for periodic stats updates (every 5 seconds)
      const intervalId = setInterval(() => {
        // Generate mock stats data
        const mockStats: RealtimeStatsUpdate = {
          activeUsers: Math.floor(Math.random() * 100),
          pageViewsToday: Math.floor(Math.random() * 1000),
          conversionRate: Math.random() * 10,
          topPages: [
            { path: '/', views: Math.floor(Math.random() * 500) },
            { path: '/gallery', views: Math.floor(Math.random() * 300) },
            { path: '/booking', views: Math.floor(Math.random() * 200) },
          ],
          dataPoints: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            value: Math.floor(Math.random() * 50),
            label: `Hour ${i}`
          }))
        };
        
        // Send stats update
        const statsUpdate = formatSSEData(AnalyticsStreamEvents.STATS_UPDATE, mockStats);
        controller.enqueue(encoder.encode(statsUpdate));
        
        // Also send a heartbeat to keep connection alive
        const heartbeat = formatSSEData(AnalyticsStreamEvents.HEARTBEAT, { 
          time: new Date().toISOString() 
        });
        controller.enqueue(encoder.encode(heartbeat));
      }, 5000);
      
      // Clean up when the stream is closed
      return () => {
        clearInterval(intervalId);
      };
    }
  });
  
  return stream;
}

/**
 * Default export for imports
 */
export default {
  AnalyticsStreamEvents,
  configureAnalyticsSSE,
  formatSSEData,
  sendHeartbeat,
  createAnalyticsStream,
};