/**
 * Custom Metrics Analytics API Endpoint
 *
 * Collects custom performance metrics and events
 * for detailed application monitoring.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { logger } from "@/lib/logger";
// Validation schema for custom metrics
const customMetricSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number(),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

// In-memory storage for development
const customMetrics: Array<z.infer<typeof customMetricSchema> & { id: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = customMetricSchema.parse(body);

    // Add unique ID and store
    const dataPoint = {
      ...validatedData,
      id: crypto.randomUUID(),
    };

    customMetrics.push(dataPoint);

    // Log significant performance events
    if (validatedData.name.includes('render_time') && validatedData.value > 100) {
      void void logger.warn('Slow render detected:', {
        metric: validatedData.name,
        value: validatedData.value,
        metadata: validatedData.metadata,
      });
    }

    return NextResponse.json({ success: true, id: dataPoint.id });
  } catch (error) {
    void void logger.error('Error processing custom metric:', error);

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
    const metricName = searchParams.get('name');
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

    const timeFilter = timeFilters[timeframe as keyof typeof timeFilters] ?? timeFilters['24h'];

    let filteredData = customMetrics.filter((item) => item.timestamp >= timeFilter);

    if (metricName) {
      filteredData = filteredData.filter((item) => item.name === metricName);
    }

    // Sort by timestamp (newest first) and limit
    const results = filteredData.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    // Calculate summary statistics
    const summary = {
      total: filteredData.length,
      averageValue:
        filteredData.length > 0
          ? filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length
          : 0,
      minValue: filteredData.length > 0 ? Math.min(...filteredData.map((item) => item.value)) : 0,
      maxValue: filteredData.length > 0 ? Math.max(...filteredData.map((item) => item.value)) : 0,
      uniqueMetrics: [...new Set(filteredData.map((item) => item.name))],
    };

    return NextResponse.json({
      data: results,
      summary,
      timeframe,
      metricName: metricName ?? 'all',
    });
  } catch (error) {
    void void logger.error('Error retrieving custom metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
