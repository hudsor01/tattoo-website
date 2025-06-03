/**
 * Analytics Batch Processor
 * Batches analytics events for improved performance and reduced database load
 */

import { logger } from "@/lib/logger";
// Local types for analytics processing
interface ProcessedAnalyticsEvent {
sessionId: string;
eventType: string;
context: {
ipAddress?: string;
userId?: string;
userAgent?: string;
};
serviceId?: string;
bookingId?: string;
calEventTypeId?: number;
properties?: Record<string, any>;
duration?: number;
}

interface AnalyticsBatch {
id: string;
events: ProcessedAnalyticsEvent[];
createdAt: Date;
retryCount: number;
}

interface AnalyticsConfig {
enableBatching: boolean;
batchSize: number;
flushInterval: number;
maxRetries: number;
retryDelay: number;
}

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
enableBatching: true,
batchSize: 10,
flushInterval: 5000,
maxRetries: 3,
retryDelay: 1000,
};
import { safeAnalyticsOperation } from './retry-wrapper';
import { CalAnalyticsService } from './cal-analytics';

export class AnalyticsBatchProcessor {
  private queue: ProcessedAnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private batchCounter = 0;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config };
    
    if (this.config.enableBatching) {
      this.startFlushTimer();
    }
  }

  /**
   * Add an event to the batch queue
   */
  async addEvent(event: ProcessedAnalyticsEvent): Promise<void> {
    if (!this.config.enableBatching) {
      // Process immediately if batching is disabled
      await this.processSingleEvent(event);
      return;
    }

    this.queue.push(event);
    
    // Flush if batch size is reached
    if (this.queue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Process a single event immediately (when batching is disabled)
   */
  private async processSingleEvent(event: ProcessedAnalyticsEvent): Promise<void> {
    await safeAnalyticsOperation(
      async () => {
        // Convert to the format expected by CalAnalyticsService
        const eventData = {
          sessionId: event.sessionId,
          eventType: event.eventType,
          ipAddress: event.context.ipAddress,
          ...(event.context.userId && { userId: event.context.userId }),
          ...(event.context.userAgent && { userAgent: event.context.userAgent }),
          ...(event.serviceId && { serviceId: event.serviceId }),
          ...(event.bookingId && { bookingId: event.bookingId }),
          ...(event.calEventTypeId && { calEventTypeId: event.calEventTypeId }),
          ...(event.properties && { properties: event.properties }),
          ...(event.duration && { duration: event.duration }),
        };
        
        await CalAnalyticsService.trackEvent(eventData);
      },
      'process-single-event',
      {
        maxRetries: this.config.maxRetries,
        baseDelay: this.config.retryDelay,
      }
    );
  }

  /**
   * Flush the current batch
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0 || this.isProcessing) {
      return;
    }

    const batch = this.createBatch();
    this.queue = []; // Clear the queue immediately
    
    await this.processBatch(batch);
  }

  /**
   * Create a batch from current queue
   */
  private createBatch(): AnalyticsBatch {
    this.batchCounter++;
    
    return {
      id: `batch-${Date.now()}-${this.batchCounter}`,
      events: [...this.queue], // Create a copy
      createdAt: new Date(),
      retryCount: 0,
    };
  }

  /**
   * Process a batch of events
   */
  private async processBatch(batch: AnalyticsBatch): Promise<void> {
    this.isProcessing = true;
    
    try {
      await safeAnalyticsOperation(
        async () => {
          // Process all events in the batch
          const promises = batch.events.map(event => {
            const eventData = {
              sessionId: event.sessionId,
              eventType: event.eventType,
              ipAddress: event.context.ipAddress,
              ...(event.context.userId && { userId: event.context.userId }),
              ...(event.context.userAgent && { userAgent: event.context.userAgent }),
              ...(event.serviceId && { serviceId: event.serviceId }),
              ...(event.bookingId && { bookingId: event.bookingId }),
              ...(event.calEventTypeId && { calEventTypeId: event.calEventTypeId }),
              ...(event.properties && { properties: event.properties }),
              ...(event.duration && { duration: event.duration }),
            };
            
            return CalAnalyticsService.trackEvent(eventData);
          });
          
          await Promise.all(promises);
          // Batch processed successfully
        },
        `process-batch-${batch.id}`,
        {
          maxRetries: this.config.maxRetries,
          baseDelay: this.config.retryDelay,
        }
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush().catch(error => {
          void logger.error('Error during automatic flush:', error);
        });
      }
    }, this.config.flushInterval);
  }

  /**
   * Stop the automatic flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Get current queue statistics
   */
  getStats(): {
    queueSize: number;
    isProcessing: boolean;
    batchSize: number;
    flushInterval: number;
  } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      batchSize: this.config.batchSize,
      flushInterval: this.config.flushInterval,
    };
  }

  /**
   * Graceful shutdown - flush remaining events
   */
  async shutdown(): Promise<void> {
    this.stopFlushTimer();
    
    if (this.queue.length > 0) {
      // Flush remaining events during shutdown
      await this.flush();
    }
    
    // Wait for any ongoing processing to complete
    while (this.isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Singleton instance for the application
let batchProcessor: AnalyticsBatchProcessor | null = null;

/**
 * Get the singleton batch processor instance
 */
export function getBatchProcessor(config?: Partial<AnalyticsConfig>): AnalyticsBatchProcessor {
  batchProcessor ??= new AnalyticsBatchProcessor(config);
  return batchProcessor;
}

/**
 * Reset the singleton (mainly for testing)
 */
export function resetBatchProcessor(): void {
  if (batchProcessor) {
    void batchProcessor.shutdown();
    batchProcessor = null;
  }
}
