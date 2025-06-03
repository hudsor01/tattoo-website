/**
 * Web Vitals Analytics API Endpoint
 *
 * Collects and processes Web Vitals performance metrics
 * for monitoring and analysis.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { logger } from "@/lib/logger";
// Validation schema for Web Vitals data
const webVitalsSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'INP', 'LCP', 'TTFB']),
  value: z.number().positive(),
  id: z.string(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  navigationType: z.string().optional(),
  timestamp: z.number(),
  url: z.string().url(),
  userAgent: z.string(),
  connection: z
    .object({
      effectiveType: z.string().optional(),
      downlink: z.number().optional(),
      rtt: z.number().optional(),
    })
    .nullable()
    .optional(),
});

// In-memory storage for development (use database in production)
const performanceData: Array<z.infer<typeof webVitalsSchema> & { id: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = webVitalsSchema.parse(body);

    // Add unique ID and store
    const dataPoint = {
      ...validatedData,
      id: crypto.randomUUID(),
    };

    performanceData.push(dataPoint);

    // Log poor performance metrics
    if (validatedData.rating === 'poor') {
      void void logger.warn('Poor Web Vital detected:', {
        metric: validatedData.name,
        value: validatedData.value,
        url: validatedData.url,
        userAgent: validatedData.userAgent,
      });
    }

    // In production, you might want to:
    // 1. Store in database (Supabase, PostgreSQL, etc.)
    // 2. Send to monitoring service (DataDog, New Relic, etc.)
    // 3. Trigger alerts for poor performance

    // Example database storage:
    // await prisma.performanceMetric.create({
    //   data: {
    //     name: validatedData.name,
    //     value: validatedData.value,
    //     rating: validatedData.rating,
    //     url: validatedData.url,
    //     userAgent: validatedData.userAgent,
    //     timestamp: new Date(validatedData.timestamp),
    //   },
    // });

    return NextResponse.json({ success: true, id: dataPoint.id });
  } catch (error) {
    void void logger.error('Error processing Web Vitals data:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const limit = parseInt(searchParams.get('limit') ?? '100');
    const timeframe = searchParams.get('timeframe') ?? '24h';

    // Calculate time filter
    const now = Date.now();
    const timeFilters = {
      '1h': now - 60 * 60 * 1000,
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    };

    const timeFilter = timeFilters[timeframe as keyof typeof timeFilters] || timeFilters['24h'];

    let filteredData = performanceData.filter((item) => item.timestamp >= timeFilter);

    if (metric) {
      filteredData = filteredData.filter((item) => item.name === metric);
    }

    // Sort by timestamp (newest first) and limit
    const results = filteredData.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    // Calculate summary statistics
    const summary = {
      total: filteredData.length,
      good: filteredData.filter((item) => item.rating === 'good').length,
      needsImprovement: filteredData.filter((item) => item.rating === 'needs-improvement').length,
      poor: filteredData.filter((item) => item.rating === 'poor').length,
      averageValue:
        filteredData.length > 0
          ? filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length
          : 0,
    };

    return NextResponse.json({
      data: results,
      summary,
      timeframe,
      metric: metric ?? 'all',
    });
  } catch (error) {
    void void logger.error('Error retrieving Web Vitals data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
