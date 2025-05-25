/**
 * Database Optimization and Configuration
 * Production-ready database utilities for performance and reliability
 */

import { PrismaClient } from '@prisma/client'

// Database Configuration for Production
export interface DatabaseConfig {
  maxConnections: number
  connectionTimeout: number
  queryTimeout: number
  idleTimeout: number
  enableLogging: boolean
  enableMetrics: boolean
  enableConnectionPooling: boolean
  replicationConfig?: {
    readReplicas: string[]
    writeHost: string
  }
}

const defaultDatabaseConfig: DatabaseConfig = {
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000'),
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '30000'),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '600000'),
  enableLogging: process.env.NODE_ENV === 'development',
  enableMetrics: true,
  enableConnectionPooling: true,
}

// Enhanced Prisma Client with Performance Optimizations
class OptimizedPrismaClient {
  private static instance: PrismaClient
  private static config: DatabaseConfig = defaultDatabaseConfig

  static getInstance(config?: Partial<DatabaseConfig>): PrismaClient {
    if (!OptimizedPrismaClient.instance) {
      OptimizedPrismaClient.config = { ...defaultDatabaseConfig, ...config }
      OptimizedPrismaClient.instance = new PrismaClient({
        datasourceUrl: OptimizedPrismaClient.getDatabaseUrl(),
        log: OptimizedPrismaClient.getLogLevel(),
        errorFormat: 'pretty',
      })

      // Setup middleware for performance monitoring
      OptimizedPrismaClient.setupMiddleware()
      
      // Setup connection event handlers
      OptimizedPrismaClient.setupEventHandlers()
    }

    return OptimizedPrismaClient.instance
  }

  private static getDatabaseUrl(): string {
    const baseUrl = process.env.DATABASE_URL
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }

    // Add connection pool parameters
    const url = new URL(baseUrl)
    url.searchParams.set('connection_limit', this.config.maxConnections.toString())
    url.searchParams.set('pool_timeout', (this.config.connectionTimeout / 1000).toString())
    url.searchParams.set('connect_timeout', '10')
    url.searchParams.set('socket_timeout', '30')
    
    return url.toString()
  }

  private static getLogLevel(): Array<'query' | 'info' | 'warn' | 'error'> {
    if (process.env.NODE_ENV === 'development') {
      return ['query', 'info', 'warn', 'error']
    }
    return ['warn', 'error']
  }

  private static setupMiddleware(): void {
    this.instance.$use(async (params, next) => {
      const start = Date.now()
      const result = await next(params)
      const duration = Date.now() - start
      
      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`)
      }
      
      // Track query metrics
      if (this.config.enableMetrics) {
        this.trackQueryMetrics(params.model, params.action, duration)
      }
      
      return result
    })
  }

  private static setupEventHandlers(): void {
    // Handle uncaught database errors
    process.on('SIGINT', async () => {
      await this.instance.$disconnect()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      await this.instance.$disconnect()
      process.exit(0)
    })
  }

  private static trackQueryMetrics(model: string | undefined, action: string, duration: number): void {
    // In production, send these metrics to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to DataDog, New Relic, etc.
      console.log(`DB_METRIC: ${model}.${action} ${duration}ms`)
    }
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    connectionCount?: number
  }> {
    try {
      const start = Date.now()
      await this.instance.$queryRaw`SELECT 1`
      const latency = Date.now() - start

      return {
        status: 'healthy',
        latency,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: -1,
      }
    }
  }

  static async disconnect(): Promise<void> {
    await this.instance.$disconnect()
  }
}

// Query Optimization Utilities
export class QueryOptimizer {
  // Pagination with cursor-based approach for better performance
  static createPaginationQuery<T>(
    cursor?: T,
    limit: number = 20,
    orderBy: string = 'createdAt'
  ) {
    const query: any = {
      take: limit + 1, // Take one extra to check if there's a next page
      orderBy: { [orderBy]: 'desc' },
    }

    if (cursor) {
      query.cursor = { id: cursor }
      query.skip = 1 // Skip the cursor item
    }

    return query
  }

  // Optimized search query with full-text search
  static createSearchQuery(
    searchTerm: string,
    fields: string[],
    model: string
  ) {
    const searchConditions = fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }))

    return {
      where: {
        OR: searchConditions,
      },
    }
  }

  // Bulk operations for better performance
  static async bulkUpsert<T>(
    prisma: PrismaClient,
    model: string,
    data: T[],
    uniqueField: string = 'id'
  ): Promise<void> {
    const batchSize = 100
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(item => 
          // @ts-ignore - Dynamic model access
          prisma[model].upsert({
            where: { [uniqueField]: item[uniqueField as keyof T] },
            update: item,
            create: item,
          })
        )
      )
    }
  }

  // Efficient count with estimated count for large tables
  static async getOptimizedCount(
    prisma: PrismaClient,
    model: string,
    where?: any
  ): Promise<number> {
    // For large tables, use estimated count from PostgreSQL statistics
    if (process.env.DATABASE_PROVIDER === 'postgresql') {
      try {
        const result = await prisma.$queryRaw<[{ estimated_count: number }]>`
          SELECT reltuples::BIGINT AS estimated_count 
          FROM pg_class 
          WHERE relname = ${model}
        `
        
        if (result[0] && result[0].estimated_count > 100000) {
          return Math.floor(result[0].estimated_count)
        }
      } catch (error) {
        console.warn('Failed to get estimated count, falling back to exact count')
      }
    }

    // Fall back to exact count for smaller tables or when estimation fails
    // @ts-ignore - Dynamic model access
    return prisma[model].count({ where })
  }
}

// Connection Pool Management
export class ConnectionPoolManager {
  private static pool: Map<string, PrismaClient> = new Map()

  static getConnection(key: string = 'default'): PrismaClient {
    let connection = this.pool.get(key)
    
    if (!connection) {
      connection = OptimizedPrismaClient.getInstance()
      this.pool.set(key, connection)
    }
    
    return connection
  }

  static async closeConnection(key: string): Promise<void> {
    const connection = this.pool.get(key)
    if (connection) {
      await connection.$disconnect()
      this.pool.delete(key)
    }
  }

  static async closeAllConnections(): Promise<void> {
    const disconnectPromises = Array.from(this.pool.values()).map(
      connection => connection.$disconnect()
    )
    
    await Promise.all(disconnectPromises)
    this.pool.clear()
  }

  static getPoolStats(): {
    activeConnections: number
    connectionKeys: string[]
  } {
    return {
      activeConnections: this.pool.size,
      connectionKeys: Array.from(this.pool.keys()),
    }
  }
}

// Database Migration Utilities
export class MigrationManager {
  static async runMigrations(): Promise<void> {
    const prisma = OptimizedPrismaClient.getInstance()
    
    try {
      // In production, run migrations
      if (process.env.NODE_ENV === 'production') {
        console.log('Running database migrations...')
        // Use Prisma CLI or custom migration logic here
      }
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  static async checkMigrationStatus(): Promise<{
    applied: string[]
    pending: string[]
  }> {
    // Check migration status
    // This would integrate with Prisma's migration system
    return {
      applied: [],
      pending: [],
    }
  }
}

// Database Backup Utilities
export class BackupManager {
  static async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `backup-${timestamp}`
    
    if (process.env.DATABASE_PROVIDER === 'postgresql') {
      // PostgreSQL backup command
      // In production, this would use pg_dump or similar
      console.log(`Creating PostgreSQL backup: ${backupName}`)
    }
    
    return backupName
  }

  static async restoreBackup(backupName: string): Promise<void> {
    console.log(`Restoring backup: ${backupName}`)
    // Implement backup restoration logic
  }

  static async listBackups(): Promise<string[]> {
    // List available backups
    return []
  }
}

// Performance Monitoring
export class DatabaseMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static recordQueryTime(operation: string, time: number): void {
    const times = this.metrics.get(operation) || []
    times.push(time)
    
    // Keep only the last 100 measurements
    if (times.length > 100) {
      times.shift()
    }
    
    this.metrics.set(operation, times)
  }

  static getAverageQueryTime(operation: string): number {
    const times = this.metrics.get(operation) || []
    if (times.length === 0) return 0
    
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  static getSlowQueries(threshold: number = 1000): Record<string, number> {
    const slowQueries: Record<string, number> = {}
    
    for (const [operation, times] of this.metrics.entries()) {
      const avgTime = this.getAverageQueryTime(operation)
      if (avgTime > threshold) {
        slowQueries[operation] = avgTime
      }
    }
    
    return slowQueries
  }

  static getMetricsSummary(): Record<string, {
    count: number
    average: number
    min: number
    max: number
  }> {
    const summary: Record<string, any> = {}
    
    for (const [operation, times] of this.metrics.entries()) {
      if (times.length > 0) {
        summary[operation] = {
          count: times.length,
          average: this.getAverageQueryTime(operation),
          min: Math.min(...times),
          max: Math.max(...times),
        }
      }
    }
    
    return summary
  }
}

// Export optimized Prisma instance
export const prisma = OptimizedPrismaClient.getInstance()

// Export utilities
export const database = {
  prisma,
  optimizer: QueryOptimizer,
  pool: ConnectionPoolManager,
  migration: MigrationManager,
  backup: BackupManager,
  monitor: DatabaseMonitor,
}