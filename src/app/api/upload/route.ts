import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';
import { ENV } from '@/lib/utils/env';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { ApiErrors } from '@/lib/api-errors';
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
      throw ApiErrors.badRequest('No file provided');
    }

    // Determine file type based on bucket
    const fileCategory = bucket === 'gallery' ? 'image' : 
                        bucket === 'documents' ? 'document' : 'any';
    
    // Validate file using our utility
    validateFileWithErrorHandling(file, getFileValidationOptions(fileCategory));

    // Create Supabase client - using anon key since we removed RLS
    const supabaseUrl = typeof ENV.NEXT_PUBLIC_SUPABASE_URL === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_URL : '';
    const supabaseKey = typeof ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';
    
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate secure filename with proper validation
    const fileName = generateSecureFilename(file.name, folder);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      void logger.error('Upload error:', error);
      throw ApiErrors.internalServerError('Failed to upload file', error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    void logger.error('Upload failed:', error);
    
    // Use our ApiErrors utilities to handle different error types
    if (error instanceof Error) {
      // Check if it's already an ApiError
      if ('code' in error && 'status' in error) {
        return NextResponse.json(
          { error: error.message, code: (error as { code: string }).code },
          { status: (error as { status: number }).status }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { error: error.message, code: 'UPLOAD_FAILED' },
        { status: 500 }
      );
    }
    
    // Unknown error
    return NextResponse.json(
      { error: 'Upload failed', code: 'UNKNOWN_ERROR' },
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
    const { path, bucket = 'gallery' } = await request.json();

    if (!path) {
      throw ApiErrors.badRequest('No path provided');
    }

    // Create Supabase client - using anon key since we removed RLS
    const supabaseUrl = typeof ENV.NEXT_PUBLIC_SUPABASE_URL === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_URL : '';
    const supabaseKey = typeof ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' ? ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';
    
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete from Supabase storage
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      void logger.error('Delete error:', error);
      throw ApiErrors.internalServerError('Failed to delete file', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    void logger.error('Delete failed:', error);
    
    // Use our ApiErrors utilities to handle different error types
    if (error instanceof Error) {
      // Check if it's already an ApiError
      if ('code' in error && 'status' in error) {
        return NextResponse.json(
          { error: error.message, code: (error as { code: string }).code },
          { status: (error as { status: number }).status }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { error: error.message, code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }
    
    // Unknown error
    return NextResponse.json(
      { error: 'Delete failed', code: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}