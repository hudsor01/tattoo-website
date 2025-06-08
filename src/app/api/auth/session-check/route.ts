import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session using Better Auth with proper headers
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // Always return 200, even for unauthenticated users
    return NextResponse.json({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isAdmin: session?.user?.role === 'admin'
    });
  } catch (error) {
    console.error('Session check error:', error);
    // For auth errors, still return 200 but with no session
    return NextResponse.json({
      session: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Session check failed'
    });
  }
}