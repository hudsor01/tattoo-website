import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';

// GET /api/gallery - Get all designs for gallery
export async function GET(request: NextRequest) {
  // Cache for 5 minutes, revalidate every hour
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const cursor = searchParams.get('cursor');
    const designType = searchParams.get('designType');

    // Build where clause
    const where: Prisma.TattooDesignWhereInput = {};

    if (designType) {
      where.designType = designType;
    }

    // Get designs with pagination
    const queryOptions: Prisma.TattooDesignFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    const designs = await prisma.tattooDesign.findMany(queryOptions);

    // Check if there are more items
    let nextCursor: string | null = null;
    if (designs.length > limit) {
      const nextItem = designs.pop();
      nextCursor = nextItem?.id ?? null;
    }

    // Get total count for pagination info
    const totalCount = await prisma.tattooDesign.count({ where });

    const result = NextResponse.json({
      designs,
      nextCursor,
      totalCount,
    });
    
    // Set cache headers for static data
    result.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return result;
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery designs' },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Create new design (protected)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, fileUrl, designType, size } = body;

    if (!name || !fileUrl) {
      return NextResponse.json(
        { error: 'Name and fileUrl are required' },
        { status: 400 }
      );
    }

    const design = await prisma.tattooDesign.create({
      data: {
        name,
        description: description ?? null,
        fileUrl,
        thumbnailUrl: fileUrl,
        designType: designType ?? null,
        size: size ?? null,
        isApproved: false,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    });

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    console.error('Create design error:', error);
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    );
  }
}