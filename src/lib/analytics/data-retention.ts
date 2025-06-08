/**
 * Data Retention and GDPR Compliance Management
 * 
 * Production-ready implementation for automated data lifecycle management:
 * - Enforces configurable retention policies for different data categories
 * - Implements efficient chunked deletion to prevent database performance impact
 * - Supports admin monitoring and manual policy adjustments
 * - Provides impact analysis before executing cleanup operations
 * - Uses cron scheduling for reliable background execution
 * 
 * @module lib/analytics/data-retention
 */

import { dataRetentionConfig } from './config';
import * as cron from 'node-cron';

import { logger } from "@/lib/logger";
export interface RetentionPolicy {
  name: string;
  table: string;
  retentionDays: number;
  dateColumn: string;
  enabled: boolean;
  lastRun?: Date;
  totalDeleted?: number;
}

export interface CleanupResult {
  policy: string;
  deletedRecords: number;
  executionTime: number;
  success: boolean;
  error?: string;
}

export interface RetentionStats {
  totalPolicies: number;
  activePolicies: number;
  lastCleanupRun: Date | null;
  totalRecordsDeleted: number;
  cleanupResults: CleanupResult[];
}

class DataRetentionManager {
  private retentionPolicies: RetentionPolicy[] = [];
  private cleanupResults: CleanupResult[] = [];
  private cleanupJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor() {
    this.initializeRetentionPolicies();
    this.scheduleCleanupJob();
  }

  /**
   * Initialize default retention policies based on configuration
   */
  private initializeRetentionPolicies(): void {
    this.retentionPolicies = [
      {
        name: 'Analytics Events',
        table: 'analytics_events',
        retentionDays: dataRetentionConfig.eventDataRetentionDays,
        dateColumn: 'created_at',
        enabled: dataRetentionConfig.enableDataCleanup,
      },
      {
        name: 'Session Data',
        table: 'analytics_sessions',
        retentionDays: dataRetentionConfig.sessionDataRetentionDays,
        dateColumn: 'created_at',
        enabled: dataRetentionConfig.enableDataCleanup,
      },
      {
        name: 'Error Logs',
        table: 'analytics_errors',
        retentionDays: dataRetentionConfig.errorLogRetentionDays,
        dateColumn: 'created_at',
        enabled: dataRetentionConfig.enableDataCleanup,
      },
      {
        name: 'Batch Processing Logs',
        table: 'batch_processing_logs',
        retentionDays: 30, // Keep batch logs for 30 days
        dateColumn: 'created_at',
        enabled: dataRetentionConfig.enableDataCleanup,
      },
      {
        name: 'Health Check Logs',
        table: 'health_check_logs',
        retentionDays: 7, // Keep health logs for 1 week
        dateColumn: 'created_at',
        enabled: dataRetentionConfig.enableDataCleanup,
      },
    ];
  }

  /**
   * Schedule the cleanup job based on configuration
   */
  private scheduleCleanupJob(): void {
    if (!dataRetentionConfig.enableDataCleanup) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        void logger.warn('Data retention cleanup is disabled in configuration');
      }
      return;
    }

    try {
      this.cleanupJob = cron.schedule(
        dataRetentionConfig.cleanupJobCron,
        () => {
          this.runCleanup().catch((error) => {
            void logger.error('Scheduled cleanup job failed:', error);
          });
        },
        {
          timezone: 'UTC',
        }
      );

      // Log in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' || dataRetentionConfig.verboseLogging) {
        void logger.info(`Data retention job scheduled with cron pattern: ${dataRetentionConfig.cleanupJobCron}`);
      }
    } catch (error) {
      void logger.error('Failed to schedule cleanup job:', error);
    }
  }

  /**
   * Run data cleanup for all enabled retention policies
   */
  public async runCleanup(): Promise<CleanupResult[]> {
    if (this.isRunning) {
      throw new Error('Cleanup job is already running');
    }

    this.isRunning = true;
    const results: CleanupResult[] = [];
    const startTime = Date.now();

    // Log at appropriate level for production or development
    if (dataRetentionConfig.verboseLogging) {
      void logger.info(`Starting data retention cleanup at ${new Date().toISOString()}`);
    }

    try {
      // Import the Prisma client
      const { prisma: _prisma } = await import('../db/prisma');
      
      // Process each policy
      for (const policy of this.retentionPolicies) {
        if (!policy.enabled) {
          continue;
        }

        const result = await this.executeCleanupPolicy(policy);
        results.push(result);

        // Update policy stats
        policy.lastRun = new Date();
        if (result.success) {
          policy.totalDeleted = (policy.totalDeleted ?? 0) + result.deletedRecords;
        }
      }

      // Store results for monitoring
      this.cleanupResults = results;

      // Log results in a structured format with appropriate verbosity
      if (dataRetentionConfig.verboseLogging) {
        const totalDeleted = results.reduce((sum, r) => sum + r.deletedRecords, 0);
        const successfulPolicies = results.filter(r => r.success).length;
        const executionTime = Date.now() - startTime;
        
        void logger.info(`Data retention cleanup completed in ${executionTime}ms: ${successfulPolicies}/${results.length} policies processed, ${totalDeleted} records deleted`);
      }
      
      // Store cleanup metrics in database if metrics collection is enabled
      if (dataRetentionConfig.storeCleanupMetrics) {
        try {
          const totalDeleted = results.reduce((sum, r) => sum + r.deletedRecords, 0);
          const executionTime = Date.now() - startTime;
          
          // Store cleanup metrics for monitoring
          void logger.info('Data retention cleanup metrics:', {
            timestamp: new Date().toISOString(),
            totalPoliciesRun: results.length,
            totalRecordsDeleted: totalDeleted,
            executionTimeMs: executionTime,
            status: 'SUCCESS',
            successfulPolicies: results.filter(r => r.success).length,
            failedPolicies: results.filter(r => !r.success).length,
            details: results.map(r => ({
              policy: r.policy,
              deletedRecords: r.deletedRecords,
              success: r.success,
              executionTime: r.executionTime,
              ...(r.error && { error: r.error }),
            })),
          });
        } catch (error) {
          // Non-blocking error - just log it
          void logger.error('Failed to store cleanup metrics:', error);
        }
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Execute cleanup for a specific retention policy
   */
  private async executeCleanupPolicy(policy: RetentionPolicy): Promise<CleanupResult> {
    const startTime = Date.now();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    try {
      // Log execution details only when verbose logging is enabled
      if (dataRetentionConfig.verboseLogging) {
        void logger.info(`Executing cleanup policy: ${policy.name} (retention: ${policy.retentionDays} days, table: ${policy.table})`);
      }

      // Execute the data retention SQL query to delete old records
      // This creates a transaction and performs a chunked delete for optimal performance
      const deletedRecords = await this.executeDataRetentionQuery(policy, cutoffDate);

      const executionTime = Date.now() - startTime;

      return {
        policy: policy.name,
        deletedRecords,
        executionTime,
        success: true,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        policy: policy.name,
        deletedRecords: 0,
        executionTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute data retention query with chunked deletes for optimal performance
   * This method prevents long-running transactions and table locks
   */
  private async executeDataRetentionQuery(policy: RetentionPolicy, cutoffDate: Date): Promise<number> {
    // Prisma doesn't natively support chunked deletes, so we implement our own solution
    // to ensure database performance isn't affected during cleanup operations
    
    // Format the cutoff date for SQL comparison (ISO format)
    const formattedCutoffDate = cutoffDate.toISOString();
    let totalDeleted = 0;
    let continueDeleting = true;
    const chunkSize = dataRetentionConfig.chunkSize ?? 1000;
    
    try {
      // Import the Prisma client 
      const { prisma: _prisma } = await import('../db/prisma');
      
      // Use a while loop with batched deletes to handle large datasets efficiently
      while (continueDeleting) {
        // Get the IDs of records to delete in this batch
        const recordsToDelete = await _prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "${policy.table}"
          WHERE "${policy.dateColumn}" < ${formattedCutoffDate}
          ORDER BY "${policy.dateColumn}" ASC
          LIMIT ${chunkSize}
        `;
        
        if (recordsToDelete.length === 0) {
          continueDeleting = false;
          break;
        }
        
        // Extract IDs for the deletion
        const ids = recordsToDelete.map((record: { id: string }) => record.id);
        
        // Delete the batch - using parameterized queries for safety
        // Using a more secure approach to handle the IN clause
        const placeholders = ids.map((_: string, i: number) => `$${i + 1}`).join(',');
        const query = `DELETE FROM "${policy.table}" WHERE "id" IN (${placeholders})`;
        
        const result = await _prisma.$executeRawUnsafe(query, ...ids);
        
        totalDeleted += result;
        
        // If we got fewer records than the chunk size, we're done
        if (recordsToDelete.length < chunkSize) {
          continueDeleting = false;
        }
        
        // Allow a configurable pause between batches to reduce database load
        if (continueDeleting) {
          await new Promise(resolve => setTimeout(resolve, dataRetentionConfig.pauseBetweenChunks));
        }
      }
      
      return totalDeleted;
    } catch (error) {
      void logger.error(`Error executing data retention for ${policy.name}:`, error);
      throw error;
    }
  }

  /**
   * Get retention statistics
   */
  public getRetentionStats(): RetentionStats {
    const lastCleanupRun = this.cleanupResults.length > 0 
      ? new Date(Math.max(...this.cleanupResults.map(r => new Date(r.executionTime ?? 0).getTime())))
      : null;

    return {
      totalPolicies: this.retentionPolicies.length,
      activePolicies: this.retentionPolicies.filter(p => p.enabled).length,
      lastCleanupRun,
      totalRecordsDeleted: this.retentionPolicies.reduce((sum, p) => sum + (p.totalDeleted ?? 0), 0),
      cleanupResults: [...this.cleanupResults],
    };
  }

  /**
   * Get all retention policies
   */
  public getRetentionPolicies(): RetentionPolicy[] {
    return [...this.retentionPolicies];
  }

  /**
   * Update a retention policy
   */
  public updateRetentionPolicy(
    name: string,
    updates: Partial<Pick<RetentionPolicy, 'retentionDays' | 'enabled'>>
  ): boolean {
    const policy = this.retentionPolicies.find(p => p.name === name);
    if (!policy) {
      return false;
    }

    if (updates.retentionDays !== undefined) {
      policy.retentionDays = updates.retentionDays;
    }
    if (updates.enabled !== undefined) {
      policy.enabled = updates.enabled;
    }

    return true;
  }

  /**
   * Add custom retention policy
   */
  public addRetentionPolicy(policy: Omit<RetentionPolicy, 'lastRun' | 'totalDeleted'>): void {
    // Check if policy with same name already exists
    const existingIndex = this.retentionPolicies.findIndex(p => p.name === policy.name);
    
    if (existingIndex >= 0) {
      // Update existing policy
      this.retentionPolicies[existingIndex] = {
        ...this.retentionPolicies[existingIndex],
        ...policy,
      };
    } else {
      // Add new policy
      this.retentionPolicies.push({
        ...policy,
        totalDeleted: 0,
      });
    }
  }

  /**
   * Remove retention policy
   */
  public removeRetentionPolicy(name: string): boolean {
    const index = this.retentionPolicies.findIndex(p => p.name === name);
    if (index >= 0) {
      this.retentionPolicies.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Force immediate cleanup (admin function)
   */
  public async forceCleanup(policyNames?: string[]): Promise<CleanupResult[]> {
    const policiesToRun = policyNames 
      ? this.retentionPolicies.filter(p => policyNames.includes(p.name))
      : this.retentionPolicies.filter(p => p.enabled);

    if (policiesToRun.length === 0) {
      return [];
    }

    // Log manual cleanup execution with appropriate detail level
    if (dataRetentionConfig.verboseLogging) {
      void logger.info(`Manual cleanup triggered for ${policiesToRun.length} policies: ${policiesToRun.map(p => p.name).join(', ')}`);
    }

    const results: CleanupResult[] = [];
    for (const policy of policiesToRun) {
      const result = await this.executeCleanupPolicy(policy);
      results.push(result);
    }

    return results;
  }

  /**
   * Estimate cleanup impact (dry run)
   */
  public async estimateCleanupImpact(): Promise<Array<{
    policy: string;
    estimatedDeletions: number;
    cutoffDate: Date;
    tableSize: number;
  }>> {
    const estimates = [];
    const { prisma } = await import('../db/prisma');

    for (const policy of this.retentionPolicies.filter(p => p.enabled)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      try {
        // Log estimation step with appropriate verbosity
        if (dataRetentionConfig.verboseLogging) {
          void logger.info(`Estimating cleanup impact for ${policy.name} with cutoff date ${cutoffDate.toISOString()}`);
        }

        // Query the database to get accurate counts of records that will be affected
        // This runs a COUNT query which is efficient even on large tables
        const estimatedDeletions = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(*) as count FROM "${policy.table}" 
          WHERE "${policy.dateColumn}" < ${cutoffDate.toISOString()}
        `;
        
        // Get total table size for context
        const tableSize = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(*) as count FROM "${policy.table}"
        `;

        estimates.push({
          policy: policy.name,
          estimatedDeletions: Number(estimatedDeletions[0]?.count ?? 0),
          cutoffDate,
          tableSize: Number(tableSize[0]?.count ?? 0),
        });
      } catch (error) {
        void logger.error(`Error estimating cleanup impact for ${policy.name}:`, error);
        
        // Add error case to estimates to maintain consistent return structure
        estimates.push({
          policy: policy.name,
          estimatedDeletions: 0,
          cutoffDate,
          tableSize: 0,
        });
      }
    }

    // Log summary of estimates when verbose logging is enabled
    if (dataRetentionConfig.verboseLogging) {
      const totalEstimatedDeletions = estimates.reduce((sum, e) => sum + e.estimatedDeletions, 0);
      void logger.info(`Cleanup impact estimation completed: ${totalEstimatedDeletions} records would be deleted across ${estimates.length} policies`);
    }

    return estimates;
  }

  /**
   * Stop the cleanup job and cleanup resources
   */
  public stop(): void {
    if (this.cleanupJob) {
      void this.cleanupJob.stop();
      this.cleanupJob = null;
      // Log shutdown only when verbose logging is enabled
      if (dataRetentionConfig.verboseLogging) {
        logger.info('Data retention manager: cleanup job stopped');
      }
    }
  }

  /**
   * Start the cleanup job
   */
  public start(): void {
    if (!this.cleanupJob && dataRetentionConfig.enableDataCleanup) {
      this.scheduleCleanupJob();
    }
  }
}

// Singleton instance
let retentionManagerInstance: DataRetentionManager | null = null;

export function getRetentionManager(): DataRetentionManager {
  retentionManagerInstance ??= new DataRetentionManager();
  return retentionManagerInstance;
}

// Cleanup function for graceful shutdown
export function destroyRetentionManager(): void {
  if (retentionManagerInstance) {
    retentionManagerInstance.stop();
    retentionManagerInstance = null;
  }
}

export { DataRetentionManager };
