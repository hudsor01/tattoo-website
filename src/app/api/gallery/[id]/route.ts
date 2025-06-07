import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/gallery/[id] - Get specific design by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const design = await prisma.tattooDesign.findUnique({
      where: { id: params.id },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(design);
  } catch (error) {
    console.error('Get design error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/[id] - Update design (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, fileUrl, designType, size, isApproved } = body;

    const updateData: Partial<{
      name: string;
      description: string | null;
      fileUrl: string;
      thumbnailUrl: string;
      designType: string | null;
      size: string | null;
      isApproved: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl;
      updateData.thumbnailUrl = fileUrl;
    }
    if (designType !== undefined) updateData.designType = designType;
    if (size !== undefined) updateData.size = size;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    const design = await prisma.tattooDesign.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(design);
  } catch (error) {
    console.error('Update design error:', error);
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Delete design (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.tattooDesign.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete design error:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}