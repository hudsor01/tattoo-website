/**
 * Server-Sent Events (SSE) endpoint for streaming analytics updates
 */

import { NextResponse } from 'next/server';
import { createAnalyticsStream } from '@/lib/routers/analytics-router/live-updates';
import { serverClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = serverClient();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role - required for analytics access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Create response with appropriate headers for SSE
    const response = new Response(await createAnalyticsStream(new Response()), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error creating analytics stream:', error);
    return NextResponse.json(
      { error: 'Failed to create analytics stream' },
      { status: 500 }
    );
  }
}