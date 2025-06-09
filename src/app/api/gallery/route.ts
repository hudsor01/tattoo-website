import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

// GET /api/gallery - Get all designs for gallery (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const cursor = searchParams.get('cursor');
    const designType = searchParams.get('designType');

    // Build where clause - only show approved designs for public gallery
    const where: Prisma.TattooDesignWhereInput = {
      isApproved: true, // Only show approved designs to public
    };

    if (designType) {
      where.designType = designType;
    }

    // Get designs with pagination
    const queryOptions: Prisma.TattooDesignFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        fileUrl: true,
        thumbnailUrl: true,
        designType: true,
        size: true,
        artistName: true,
        createdAt: true,
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    // Execute findMany and count queries in parallel
    const [designsData, totalCount] = await Promise.all([
      prisma.tattooDesign.findMany(queryOptions),
      prisma.tattooDesign.count({ where }),
    ]);

    // Check if there are more items
    let nextCursor: string | null = null;
    const designs = [...designsData]; // Create a mutable copy
    if (designs.length > limit) {
      const nextItem = designs.pop(); // Mutates the copy
      nextCursor = nextItem?.id ?? null;
    }

    const result = NextResponse.json({
      designs,
      nextCursor,
      totalCount,
    });
    
    // ISR with Next.js 15: revalidate every 10 minutes, serve stale up to 1 hour
    result.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    result.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    result.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return result;
  } catch (error) {
    void logger.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery designs' },
      { status: 500 }
    );
  }
}

// No POST endpoint - gallery management will be handled in admin dashboard
