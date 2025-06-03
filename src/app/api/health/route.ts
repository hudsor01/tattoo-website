import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ENV } from '@/lib/utils/env';
// Health check types for API response
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

async function checkDatabase(): Promise<HealthCheckResult> {
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
    // Check Supabase connection
    const supabaseUrl = typeof ENV.NEXT_PUBLIC_SUPABASE_URL === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_URL : '';
    const supabaseKey = typeof ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';
    
    const supabaseCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: supabaseKey,
      },
    });

    return {
      status: supabaseCheck.ok ? 'pass' : 'warn',
      details: {
        supabase: supabaseCheck.ok ? 'connected' : 'disconnected',
        statusCode: supabaseCheck.status,
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

  try {
    // Run all health checks in parallel
    const [databaseCheck, memoryCheck, externalCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      checkExternalServices(),
    ]);

    // Determine overall status
    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      external: externalCheck,
    };

    const hasFailure = Object.values(checks).some((check) => check?.status === 'fail');
    const hasWarning = Object.values(checks).some((check) => check?.status === 'warn');

    const overallStatus = hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';

    const response: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      buildTime: process.env['BUILD_TIME'] ?? 'unknown',
      uptime: process.uptime(),
      checks,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        processId: process.pid,
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
      },
    });
  } catch {
    const errorResponse: Partial<HealthCheck> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      checks: {
        database: { status: 'fail', error: 'Health check failed' },
        memory: { status: 'fail', error: 'Health check failed' },
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': `${Date.now() - startTime}ms`,
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
