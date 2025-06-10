import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get user agent
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
  
  // Detect crawlers
  const isCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord/i.test(userAgent);
  
  // Add crawler-friendly headers
  if (isCrawler) {
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    response.headers.set('X-Crawler-Optimized', 'true');
    
    // Add specific cache headers for crawlers
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  }
  
  // Security headers for all requests
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Add canonical URL header for all pages
  const url = new URL(request.url);
  const canonical = `https://ink37tattoos.com${url.pathname}`;
  response.headers.set('Link', `<${canonical}>; rel="canonical"`);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};