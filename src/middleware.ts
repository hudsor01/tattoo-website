import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/**
 * Routes that don't require authentication
 */
const publicRoutes = ['/', '/about', '/gallery', '/services', '/contact', '/booking', '/faq'];

/**
 * Routes for authentication
 */
const authRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/client-portal/login',
  '/client-portal/register',
  '/client-portal/forgot-password',
  '/admin/auth/login',
];

/**
 * Client portal routes
 */
const clientPortalRoutes = [
  '/client-portal',
  '/client-portal/appointments',
  '/client-portal/designs',
];

/**
 * Admin routes
 */
const adminRoutes = ['/admin', '/admin/dashboard', '/admin/customers', '/admin/analytics'];

/**
 * Check if a path matches any route in an array
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => path === route || path.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Temporarily bypass Supabase auth until environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
    return NextResponse.next();
  }

  // Update Supabase auth session
  const response = await updateSession(request);

  // Allow public routes and auth routes
  const isPublicRoute = matchesRoute(pathname, publicRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);

  if (isPublicRoute || isAuthRoute) {
    return response;
  }

  // For API routes, let them handle their own auth
  if (pathname.startsWith('/api')) {
    return response;
  }

  // Check if the user is authenticated using secure getUser method
  // This properly validates the token on every request
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {}, // We don't need to set cookies here in middleware
        remove() {}, // We don't need to remove cookies here in middleware
      },
    },
  );

  // Always use getUser() for server-side authentication checks
  // getUser() validates the token with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated and trying to access a protected route, redirect to login
  if (!user) {
    // Determine which login page to redirect to
    let loginUrl = '/login';

    if (matchesRoute(pathname, clientPortalRoutes)) {
      loginUrl = '/client-portal/login';
    } else if (matchesRoute(pathname, adminRoutes)) {
      loginUrl = '/admin/auth/login';
    }

    const redirectUrl = new URL(loginUrl, request.nextUrl.origin);
    redirectUrl.searchParams.set('returnTo', pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // For admin routes, check if the user has the admin role
  if (matchesRoute(pathname, adminRoutes)) {
    const isAdmin = user.user_metadata?.['role'] === 'admin';

    if (!isAdmin) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
    }
  }

  return response;
}

// Run middleware on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all paths except static files and certain asset types
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/auth/:path*',
  ],
};
