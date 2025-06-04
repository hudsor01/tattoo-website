import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/gallery - Get all approved designs for public gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');
    const designType = searchParams.get('designType');

    // Build where clause
    const where: any = {
      isApproved: true,
    };

    if (designType) {
      where.designType = designType;
    }

    // Get designs with pagination
    const queryOptions: any = {
      where,
      take: limit + 1, // Get one extra to check if there are more
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
      nextCursor = nextItem!.id;
    }

    // Get total count for pagination info
    const totalCount = await prisma.tattooDesign.count({ where });

    return NextResponse.json({
      designs,
      nextCursor,
      totalCount,
    });
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
        description: description || null,
        fileUrl,
        thumbnailUrl: fileUrl, // Use same URL for thumbnail initially
        designType: designType || null,
        size: size || null,
        isApproved: false, // Require admin approval
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