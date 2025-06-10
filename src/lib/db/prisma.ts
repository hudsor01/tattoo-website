/**
 * Enhanced Prisma client singleton with performance monitoring
 * 
 * This file ensures that there's only a single Prisma Client instance in the app,
 * with enhanced connection pooling, query monitoring, and performance optimization.
 */
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

// Create a global variable to store the client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma configuration with connection pooling and monitoring
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      { emit: 'stdout', level: 'info' },
    ],
    datasources: {
      db: {
        url: process.env['DATABASE_URL'],
      },
    },
  });

  // Query performance monitoring
  client.$on('query', (e) => {
    // Log slow queries
    if (e.duration > (process.env.NODE_ENV === 'production' ? 2000 : 500)) {
      void logger.warn(`Slow query detected: ${e.duration}ms`, {
        query: e.query.substring(0, 200), // Truncate for security
        duration: e.duration,
        params: process.env.NODE_ENV === 'development' ? e.params : '[REDACTED]',
      });
    }
  });

  // Error monitoring
  client.$on('error', (e) => {
    void logger.error('Database error:', e);
  });

  client.$on('warn', (e) => {
    void logger.warn('Database warning:', e);
  });

  return client;
};

// Initialize the Prisma client - reuse if available in dev mode
const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Connection management
if (prismaClient.$connect) {
  prismaClient.$connect()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        void logger.info('Successfully connected to database with enhanced monitoring');
      }
    })
    .catch((err) => {
      void logger.error('Failed to connect to database:', err);
      process.exit(1); // Exit on database connection failure
    });
}

// Graceful shutdown handling
const gracefulShutdown = async () => {
  void logger.info('Gracefully shutting down database connection...');
  try {
    await prismaClient.$disconnect();
    void logger.info('Database connection closed successfully');
  } catch (err) {
    void logger.error('Error disconnecting from database:', err);
  }
};

if (typeof process !== 'undefined') {
  // Wrap async handler to satisfy no-misused-promises by explicitly voiding the promise
  process.on('beforeExit', () => {
    void gracefulShutdown();
  });
  process.on('SIGINT', () => {
    void gracefulShutdown();
  });
  process.on('SIGTERM', () => {
    void gracefulShutdown();
  });
}

// Export the Prisma client
export const prisma = prismaClient;

// Default export for compatibility
export default prismaClient;

// Make sure we keep the same client in dev mode
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

// ============================================================================
// DATABASE HEALTH & MONITORING UTILITIES
// ============================================================================

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const latency = Date.now() - start;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (latency > 2000) status = 'unhealthy';
    else if (latency > 1000) status = 'degraded';
    
    return {
      status,
      latency,
    };
  } catch (error) {
    void logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Simple database connection test for API routes
 * Returns Promise<HealthCheckResult> for consistency with health API
 */
export async function checkDatabaseConnection(): Promise<{
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'pass',
      responseTime,
      details: {
        connectionPool: 'active',
        provider: 'postgresql',
      },
    };
  } catch (error) {
    return {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Common cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute - frequently changing data
  MEDIUM: 300,      // 5 minutes - moderate updates
  LONG: 1800,       // 30 minutes - stable data
  VERY_LONG: 3600,  // 1 hour - rarely changing data
} as const;
