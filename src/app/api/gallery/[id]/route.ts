import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

// GET /api/gallery/[id] - Get specific design by ID (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const design = await prisma.tattooDesign.findUnique({
      where: { 
        id,
        isApproved: true, // Only show approved designs to public
      },
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
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(design);
    // Cache individual designs for longer since they change infrequently
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return response;
  } catch (error) {
    void logger.error('Get design error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    );
  }
}

// No PUT/DELETE endpoints - design management will be handled in admin dashboard
