import type { MetadataRoute } from 'next';
import { ENV } from '@/lib/utils/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/account/',
          '/_next/',
          '/static/',
          '/server/',
          '*.json',
          '/_error',
          '/404',
          '/500',
          '/.env*',
          '/tmp/',
          '/private/',
        ],
      },
      // Specific rules for major crawlers
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl as string,
  };
}
