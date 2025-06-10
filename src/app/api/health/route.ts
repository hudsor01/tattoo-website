import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkDatabaseConnection, prisma } from '@/lib/db/prisma';
type HealthCheckResult = {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
};

type HealthCheck = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  buildTime: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
    external?: HealthCheckResult;
  };
  metadata?: {
    nodeVersion: string;
    platform: string;
    processId: number;
  };
};

// Use consolidated database connection check from prisma.ts
const checkDatabase = checkDatabaseConnection;

function checkMemory(): HealthCheckResult {
  try {
    const usage = process.memoryUsage();
    const totalHeap = usage.heapTotal;
    const usedHeap = usage.heapUsed;
    const heapUsagePercentage = (usedHeap / totalHeap) * 100;

    return {
      status: heapUsagePercentage > 90 ? 'warn' : 'pass',
      details: {
        heapUsed: Math.round(usedHeap / 1024 / 1024), // MB
        heapTotal: Math.round(totalHeap / 1024 / 1024), // MB
        heapUsagePercentage: Math.round(heapUsagePercentage),
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
      },
    };
  } catch {
    return {
      status: 'fail',
      error: 'Failed to check memory usage',
    };
  }
}

async function checkExternalServices(): Promise<HealthCheckResult> {
  try {
    // Check database connection via Prisma
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'pass',
      details: {
        database: 'connected via Prisma',
      },
    };
  } catch {
    return {
      status: 'warn',
      error: 'Failed to check external services',
    };
  }
}

export async function GET() {
  const startTime = Date.now();

  // Always return 200 for basic health check to prevent crawling issues
  try {
    // Run all health checks in parallel with timeout protection
    const checkPromises = [
      Promise.race([
        checkDatabase(),
        new Promise<HealthCheckResult>((resolve) => 
          setTimeout(() => resolve({ status: 'warn', error: 'Database check timeout' }), 5000)
        )
      ]),
      Promise.resolve(checkMemory()),
      Promise.race([
        checkExternalServices(),
        new Promise<HealthCheckResult>((resolve) => 
          setTimeout(() => resolve({ status: 'warn', error: 'External check timeout' }), 3000)
        )
      ]),
    ];

    const [databaseCheck, memoryCheck, externalCheck] = await Promise.all(checkPromises);

    // Determine overall status - be more forgiving for crawlers
    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      external: externalCheck,
    };

    // For search engine crawlers, always return healthy unless critical failure
    const headersList = await headers();
    const userAgent = headersList.get('user-agent')?.toLowerCase() ?? '';
    const isCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);
    
    const hasFailure = Object.values(checks).some((check) => check?.status === 'fail');
    const hasWarning = Object.values(checks).some((check) => check?.status === 'warn');

    // For crawlers, only mark as unhealthy if memory fails (critical app failure)
    const overallStatus = isCrawler 
      ? (memoryCheck?.status === 'fail' ? 'unhealthy' : 'healthy')
      : (hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy');

    const response: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      buildTime: process.env['BUILD_TIME'] ?? 'unknown',
      uptime: process.uptime(),
      checks: {
        database: databaseCheck ?? { status: 'fail', error: 'Check failed' },
        memory: memoryCheck ?? { status: 'fail', error: 'Check failed' },
        external: externalCheck,
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        processId: process.pid,
      },
    };

    // Always return 200 for crawlers, 503 only for genuine app failures
    const statusCode = (isCrawler || overallStatus !== 'unhealthy') ? 200 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
        'X-Crawler-Friendly': isCrawler ? 'true' : 'false',
      },
    });
  } catch (error) {
    // Even in error cases, return 200 for crawlers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent')?.toLowerCase() ?? '';
    const isCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);

    const errorResponse: Partial<HealthCheck> = {
      status: isCrawler ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      checks: {
        database: { status: 'warn', error: 'Health check failed' },
        memory: { status: 'pass' }, // Assume memory is OK if we can respond
      },
    };

    return NextResponse.json(errorResponse, {
      status: isCrawler ? 200 : 503,
      headers: {
        'Cache-Control': 'public, max-age=30', // Shorter cache for errors
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
        'X-Crawler-Friendly': isCrawler ? 'true' : 'false',
        'X-Error': error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function HEAD() {
  // Lightweight health check for load balancers
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;

    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Health-Check-Duration': `${duration}ms`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
