import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { validateFileWithErrorHandling, generateSecureFilename, getFileValidationOptions } from '@/lib/utils/file-validation';

// Route runtime configuration (Node.js runtime for Next.js 15.2.0+)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication using direct API access (Next.js 15.2.0+ feature)
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) ?? 'gallery';
    const folder = (formData.get('folder') as string) ?? 'tattoos';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine file type based on bucket
    const fileCategory = bucket === 'gallery' ? 'image' : 
                        bucket === 'documents' ? 'document' : 'any';
    
    // Validate file using our utility
    validateFileWithErrorHandling(file, getFileValidationOptions(fileCategory));

    // Generate secure filename with proper validation
    const fileName = generateSecureFilename(file.name, folder);

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      path: blob.pathname,
    });
  } catch (error) {
    void logger.error('Upload failed:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication using direct API access (Next.js 15.2.0+ feature)
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    void logger.error('Delete failed:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}