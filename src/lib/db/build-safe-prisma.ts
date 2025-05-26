/**
 * Build-safe Prisma utilities for static generation
 * Handles database connection timeouts and fallbacks during build time
 */

import { prisma } from './prisma';

export interface BuildSafeQueryOptions<T = unknown> {
  timeout?: number;
  fallback?: T;
  buildTimeFallback?: T;
}

/**
 * Execute a Prisma query with build-time safety
 * Automatically handles timeouts and provides fallbacks when database is unavailable
 */
export async function buildSafeQuery<T>(
  queryFn: () => Promise<T>,
  options: BuildSafeQueryOptions<T> = {}
): Promise<T> {
  const { timeout = 3000, fallback = null, buildTimeFallback = null } = options;

  // Check if we're in build mode without database access
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

  if (isBuildTime && buildTimeFallback !== null) {
    console.warn('Database unavailable during build, using build-time fallback');
    return buildTimeFallback;
  }

  try {
    // Race the query against a timeout
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), timeout)
      ),
    ]);

    return result;
  } catch (error) {
    console.warn(
      'Database query failed, using fallback:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    if (fallback !== null) {
      return fallback;
    }

    // Re-throw if no fallback provided
    throw error;
  }
}

/**
 * Get tattoo designs with build-time safety
 */
export async function getBuildSafeTattooDesigns(
  options: {
    where?: Record<string, unknown>;
    select?: Record<string, unknown>;
    take?: number;
    orderBy?: Record<string, unknown>;
    fallback?: unknown[];
  } = {}
) {
  const {
    where = { isApproved: true },
    select = { id: true },
    take = 100,
    orderBy = { createdAt: 'desc' },
    fallback = [],
  } = options;

  return buildSafeQuery(
    () =>
      prisma.tattooDesign.findMany({
        where,
        select,
        take,
        orderBy,
      }),
    {
      timeout: 5000,
      fallback,
      buildTimeFallback: fallback,
    }
  );
}

/**
 * Get single tattoo design with build-time safety
 */
export async function getBuildSafeTattooDesign(
  id: string,
  options: {
    select?: Record<string, unknown>;
    include?: Record<string, unknown>;
    fallback?: unknown;
  } = {}
) {
  const { select, include, fallback = null } = options;

  return buildSafeQuery(
    () =>
      prisma.tattooDesign.findUnique({
        where: { id },
        ...(select && { select }),
        ...(include && { include }),
      }),
    {
      timeout: 3000,
      fallback,
      buildTimeFallback: fallback,
    }
  );
}

/**
 * Check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await buildSafeQuery(() => prisma.$queryRaw`SELECT 1`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get fallback metadata for gallery pages
 */
export function getFallbackGalleryMetadata(id: string) {
  return {
    title: `Tattoo Design ${id} | Ink 37 Gallery`,
    description:
      'Professional tattoo design and custom artwork by Ink 37 artists. View detailed tattoo portfolios and get inspired for your next piece.',
    openGraph: {
      title: 'Professional Tattoo Design | Ink 37',
      description: 'Explore custom tattoo designs and professional artwork at Ink 37.',
      type: 'article' as const,
      siteName: 'Ink 37 Tattoo Gallery',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Professional Tattoo Design | Ink 37',
      description: 'Explore custom tattoo designs and professional artwork at Ink 37.',
    },
    keywords: [
      'tattoo',
      'tattoo design',
      'custom tattoo',
      'tattoo art',
      'ink 37',
      'professional tattoo',
      'tattoo gallery',
    ],
  };
}
