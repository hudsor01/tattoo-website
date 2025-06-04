import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { User } from "@prisma/client";
import { logger } from "@/lib/logger";

// Protected routes that require authentication
const protectedRoutes = [
  "/admin",
];

// Admin-only routes
const adminRoutes = [
  "/admin",
];

// Static asset patterns that should be served directly
const staticAssetPatterns = [
  // Images
  /^\/images\/.+\.(jpg|jpeg|png|gif|webp|svg|ico)$/i,
  /^\/icons\/.+\.(jpg|jpeg|png|gif|webp|svg|ico)$/i,
  /^\/videos\/.+\.(mp4|webm|ogg|mov)$/i,
  
  // PWA and favicon files
  /^\/favicon\.(ico|png)$/i,
  /^\/apple-touch-icon\.png$/i,
  /^\/manifest\.json$/i,
  /^\/sw\.js$/i,
  /^\/offline\.html$/i,
  /^\/browserconfig\.xml$/i,
  
  // Google verification and other meta files
  /^\/google.*\.html$/i,
  /^\/robots\.txt$/i,
  /^\/sitemap\.xml$/i,
];

// CSS and font files that should be served
const cssAndFontPatterns = [
  /^\/fonts\/.+\.(woff|woff2|ttf|otf|eot)$/i,
  /^\/css\/.+\.css$/i,
  /^\/styles\/.+\.css$/i,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all static assets and essential files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    staticAssetPatterns.some(pattern => pattern.test(pathname)) ||
    cssAndFontPatterns.some(pattern => pattern.test(pathname))
  ) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // If no session for protected route, allow the component to handle auth
    if (!session) {
      return NextResponse.next();
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (isAdminRoute) {
      const user = session.user as User;
      if (user.role !== 'admin') {
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    return NextResponse.next();
    
  } catch (error) {
    void logger.error('Middleware auth error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all request paths except for specific exclusions
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|images|icons|videos|fonts|css|styles|manifest.json|sw.js|offline.html|robots.txt|sitemap.xml|google.*\\.html|apple-touch-icon.png|browserconfig.xml).*)",
  ],
};
