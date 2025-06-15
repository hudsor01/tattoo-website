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
          '/api/',
          '/admin/',
          '/_next/',
          '/booking/cancel/*',
          '/booking/cancelled/',
          '/booking/confirmation',
          '/booking/reschedule',
        ],
      },
      
      // Allow specific API endpoints that should be crawlable
      {
        userAgent: '*',
        allow: ['/api/gallery/files', '/api/health'],
      },
      
      // Block problematic crawlers completely
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
