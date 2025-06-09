import type { MetadataRoute } from 'next';
import { ENV } from '@/lib/utils/env';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com';

  // Fetch dynamic gallery items for sitemap
  let galleryItems: Array<{ id: string; name: string; createdAt: Date }> = [];
  try {
    galleryItems = await prisma.tattooDesign.findMany({
      where: { isApproved: true },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to prevent sitemap bloat
    });
  } catch (error) {
    console.warn('Failed to fetch gallery items for sitemap:', error);
  }

  // Main pages with higher priority
  const mainPages = [
    {
      url: baseUrl as string,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Gallery style pages for SEO
  const galleryStyles = [
    'traditional',
    'fine-line',
    'black-grey',
    'color',
    'japanese',
    'geometric',
    'realistic',
    'cover-ups',
    'small-tattoos',
    'sleeves',
  ].map((style) => ({
    url: `${baseUrl}/gallery/${style}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Service-specific pages for local SEO
  const servicePages = [
    'custom-tattoos',
    'cover-up-tattoos',
    'tattoo-restoration',
    'fine-line-tattoos',
    'traditional-tattoos',
    'consultation',
  ].map((service) => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Location pages for local SEO - Cities near Crowley, Texas
  const locationPages = [
    'fort-worth',
    'burleson',
    'arlington',
    'mansfield',
    'forest-hill',
    'grand-prairie',
    'crowley',
  ].map((city) => ({
    url: `${baseUrl}/tattoo-artist-${city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Admin portal pages
  const adminPages = [
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/appointments`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/customers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/payments`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic gallery pages
  const galleryPages = galleryItems.map((item) => ({
    url: `${baseUrl}/gallery/${item.id}`,
    lastModified: item.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...mainPages,
    ...galleryStyles,
    ...servicePages,
    ...locationPages,
    ...galleryPages,
    ...adminPages
  ];
}
