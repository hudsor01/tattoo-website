/**
 * Analytics Health Check System
 * Monit    this.isRunning = true;
    this.scheduleHealthCheck();
    // Health monitoring started the health and performance of the analytics system
 */

import { getBatchProcessor } from './batch-processor';
import { CalAnalyticsService } from './cal-analytics';
import { monitoringConfig } from './config';

import { logger } from "@/lib/logger";
export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  checks: HealthCheck[];
  summary: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export class AnalyticsHealthMonitor {
  private lastHealthCheck: HealthStatus | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    if (monitoringConfig.enableHealthChecks) {
      this.start();
    }
  }

  /**
   * Start the health monitoring system
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleHealthCheck();
    void logger.warn('Analytics health monitoring started');
  }

  /**
   * Stop the health monitoring system
   */
  stop(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.isRunning = false;
    void logger.warn('Analytics health monitoring stopped');
  }

  /**
   * Schedule the next health check
   */
  private scheduleHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck().catch((error) => {
        void logger.error('Error during health check:', error);
      });
    }, monitoringConfig.healthCheckInterval);
  }

  /**
   * Perform a comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];

    // Check batch processor health
    checks.push(await this.checkBatchProcessor());

    // Check analytics service connectivity
    checks.push(await this.checkAnalyticsService());

    // Check system resources
    checks.push(await this.checkSystemResources());

    // Check database connectivity (if applicable)
    checks.push(await this.checkDatabaseConnectivity());

    // Calculate summary
    const summary = {
      healthy: checks.filter(c => c.status === 'healthy').length,
      warning: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length,
    };

    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (summary.critical > 0) {
      overallStatus = 'critical';
    } else if (summary.warning > 0) {
      overallStatus = 'warning';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date(),
      checks,
      summary,
    };

    this.lastHealthCheck = healthStatus;

    // Log health status changes
    if (overallStatus !== 'healthy') {
      void logger.warn('Analytics health check detected issues:', {
        status: overallStatus,
        issues: checks.filter(c => c.status !== 'healthy'),
      });
    }

    return healthStatus;
  }

  /**
   * Check batch processor health
   */
  private async checkBatchProcessor(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const batchProcessor = getBatchProcessor();
      const stats = batchProcessor.getStats();
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'Batch processor is healthy';
      
      // Check queue size
      if (stats.queueSize > 100) {
        status = 'warning';
        message = `Queue size is high: ${stats.queueSize}`;
      }
      
      if (stats.queueSize > 500) {
        status = 'critical';
        message = `Queue size is critically high: ${stats.queueSize}`;
      }
      
      return {
        name: 'batch_processor',
        status,
        message,
        duration: Date.now() - startTime,
        metadata: stats,
      };
    } catch (error) {
      return {
        name: 'batch_processor',
        status: 'critical',
        message: `Batch processor check failed: ${error}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check analytics service connectivity
   */
  private async checkAnalyticsService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Try to get realtime metrics as a connectivity test
      await CalAnalyticsService.getRealtimeMetrics();
      
      return {
        name: 'analytics_service',
        status: 'healthy',
        message: 'Analytics service is responsive',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'analytics_service',
        status: 'critical',
        message: `Analytics service check failed: ${error}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check system resources (memory, etc.)
   */
  private async checkSystemResources(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`;
      
      // Check memory usage
      if (heapUsedMB > 512) {
        status = 'warning';
        message = `High memory usage: ${heapUsedMB}MB`;
      }
      
      if (heapUsedMB > 1024) {
        status = 'critical';
        message = `Critical memory usage: ${heapUsedMB}MB`;
      }
      
      return {
        name: 'system_resources',
        status,
        message,
        duration: Date.now() - startTime,
        metadata: {
          heapUsedMB,
          heapTotalMB,
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        },
      };
    } catch (error) {
      return {
        name: 'system_resources',
        status: 'critical',
        message: `System resources check failed: ${error}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseConnectivity(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would normally test database connectivity
      // For now, we'll just return healthy since we don't have direct DB access
      return {
        name: 'database_connectivity',
        status: 'healthy',
        message: 'Database connectivity assumed healthy',
        duration: Date.now() - startTime,
        metadata: {
          note: 'Database connectivity check not implemented yet',
        },
      };
    } catch (error) {
      return {
        name: 'database_connectivity',
        status: 'critical',
        message: `Database connectivity check failed: ${error}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get the last health check result
   */
  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }

  /**
   * Force a health check now
   */
  async checkNow(): Promise<HealthStatus> {
    return await this.performHealthCheck();
  }
}

// Singleton instance
let healthMonitor: AnalyticsHealthMonitor | null = null;

/**
 * Get the singleton health monitor instance
 */
export function getHealthMonitor(): AnalyticsHealthMonitor {
  healthMonitor ??= new AnalyticsHealthMonitor();
  return healthMonitor;
}

/**
 * Reset the health monitor (mainly for testing)
 */
export function resetHealthMonitor(): void {
  if (healthMonitor) {
    healthMonitor.stop();
    healthMonitor = null;
  }
}
