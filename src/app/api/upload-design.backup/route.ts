import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Received upload data:', body);

    const design = await prisma.tattooDesign.create({
      data: {
        id: randomUUID(),
        name: body.name,
        description: body.description || null,
        fileUrl: body.fileUrl,
        thumbnailUrl: body.fileUrl,
        designType: body.designType || null,
        size: body.size || null,
        isApproved: Boolean(body.isApproved),
        artistId: 'fernando-govea',
        updatedAt: new Date(),
      }
    });

    console.log('✅ Design created:', design.id);
    return NextResponse.json({ success: true, design });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}