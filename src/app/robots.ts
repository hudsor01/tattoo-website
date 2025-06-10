import type { MetadataRoute } from 'next';
import { ENV } from '@/lib/utils/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com';

  return {
    rules: [
      // Main rules for all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private and admin areas
          '/api/',
          '/admin/',
          '/account/',
          '/dashboard/',
          
          // Technical directories
          '/_next/',
          '/static/',
          '/server/',
          '/tmp/',
          '/private/',
          
          // File types that don't need indexing
          '*.json',
          '*.xml',
          '*.txt',
          '*.log',
          
          // Error and system pages
          '/_error',
          '/404',
          '/500',
          '/error/',
          
          // Environment and config files
          '/.env*',
          '/.git*',
          '/config/',
          
          // Booking process pages (keep them out of search results)
          '/booking/cancel/*',
          '/booking/reschedule/*',
          '/booking/confirmation/*',
          '/payment/*',
          
          // Search and filter parameters to prevent duplicate content
          '/gallery?*',
          '/services?*',
          '*?search=*',
          '*?filter=*',
          '*?sort=*',
          '*?page=*',
          
          // Temporary and maintenance pages
          '/maintenance/',
          '/temp/',
          '/backup/',
        ],
      },
      
      // Specific rules for Google's main crawler
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/',
          '/account/',
          '/dashboard/',
          '/_next/',
          '/booking/cancel/*',
          '/booking/reschedule/*',
          '/payment/*',
          '*?search=*',
          '*?filter=*',
          '*?sort=*',
          '*?page=*',
        ],
        crawlDelay: 0,
      },
      
      // Rules for Google Images (important for tattoo gallery)
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
        crawlDelay: 1,
      },
      
      // Rules for Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/', 
          '/admin/',
          '/account/',
          '/dashboard/',
          '/booking/cancel/*',
          '/payment/*',
        ],
        crawlDelay: 1,
      },
      
      // Rules for other search engines
      {
        userAgent: ['DuckDuckBot', 'YandexBot'],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/dashboard/',
          '/_next/',
          '/booking/cancel/*',
          '/payment/*',
        ],
        crawlDelay: 2,
      },
      
      // Social media crawlers for Open Graph
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot'],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/dashboard/',
        ],
        crawlDelay: 0,
      },
      
      // Block problematic or resource-heavy crawlers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot', 
          'MJ12bot',
          'DotBot',
          'archive.org_bot',
        ],
        disallow: '/',
      },
    ],
    
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl as string,
  };
}
