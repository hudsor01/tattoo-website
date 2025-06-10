import type { MetadataRoute } from 'next';
import { ENV } from '@/lib/utils/env';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com';

  // Fetch dynamic gallery items for sitemap with recent updates
  let galleryItems: Array<{ id: string; name: string; createdAt: Date; updatedAt?: Date; designType?: string | null }> = [];
  
  try {
    // Get approved gallery items with more details
    galleryItems = await prisma.tattooDesign.findMany({
      where: { isApproved: true },
      select: { 
        id: true, 
        name: true, 
        createdAt: true, 
        updatedAt: true,
        designType: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 200 // Increased limit for better coverage
    });
  } catch (error) {
    console.warn('Failed to fetch gallery items for sitemap:', error);
  }

  // Main pages with optimized priority and frequency based on business importance
  const mainPages = [
    {
      url: baseUrl as string,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0, // Homepage - highest priority
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.95, // Booking - critical for conversions
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: galleryItems.length > 0 ? galleryItems[0]?.createdAt ?? new Date() : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9, // Gallery - shows work, updated frequently
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9, // Services - important for SEO
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8, // About - important but stable
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Contact - important for local SEO
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7, // FAQ - helpful but lower priority
    },
  ];

  // Enhanced gallery style pages for comprehensive SEO coverage
  const galleryStyles = [
    // Core style categories with high search volume
    { slug: 'traditional', priority: 0.85 },
    { slug: 'japanese', priority: 0.85 },
    { slug: 'realism', priority: 0.85 },
    { slug: 'fine-line', priority: 0.8 },
    { slug: 'black-and-grey', priority: 0.8 },
    { slug: 'color-tattoos', priority: 0.8 },
    { slug: 'geometric', priority: 0.75 },
    { slug: 'cover-ups', priority: 0.8 },
    
    // Size-based categories
    { slug: 'small-tattoos', priority: 0.75 },
    { slug: 'large-tattoos', priority: 0.75 },
    { slug: 'sleeve-tattoos', priority: 0.8 },
    
    // Body placement categories for local SEO
    { slug: 'arm-tattoos', priority: 0.7 },
    { slug: 'back-tattoos', priority: 0.7 },
    { slug: 'chest-tattoos', priority: 0.7 },
    { slug: 'leg-tattoos', priority: 0.7 },
  ].map((style) => ({
    url: `${baseUrl}/gallery/${style.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: style.priority,
  }));

  // Enhanced service-specific pages for local SEO with better targeting
  const servicePages = [
    { slug: 'custom-tattoo-design', priority: 0.85 },
    { slug: 'cover-up-tattoos', priority: 0.8 },
    { slug: 'tattoo-consultation', priority: 0.8 },
    { slug: 'traditional-tattoos', priority: 0.75 },
    { slug: 'fine-line-tattoos', priority: 0.75 },
    { slug: 'japanese-tattoos', priority: 0.75 },
    { slug: 'realism-tattoos', priority: 0.75 },
    { slug: 'black-and-grey-tattoos', priority: 0.7 },
    { slug: 'color-tattoos', priority: 0.7 },
    { slug: 'tattoo-touch-ups', priority: 0.65 },
  ].map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: service.priority,
  }));

  // Enhanced location pages for comprehensive DFW area coverage
  const locationPages = [
    // Primary service areas (higher priority)
    { city: 'crowley', priority: 0.85, region: 'Primary Location' },
    { city: 'fort-worth', priority: 0.8, region: 'Major Metro' },
    { city: 'burleson', priority: 0.8, region: 'Close Proximity' },
    { city: 'mansfield', priority: 0.75, region: 'Service Area' },
    
    // Secondary service areas  
    { city: 'arlington', priority: 0.7, region: 'DFW Metro' },
    { city: 'grand-prairie', priority: 0.7, region: 'DFW Metro' },
    { city: 'forest-hill', priority: 0.7, region: 'Service Area' },
    { city: 'kennedale', priority: 0.65, region: 'Service Area' },
    { city: 'everman', priority: 0.65, region: 'Service Area' },
    
    // Broader DFW coverage for SEO
    { city: 'dallas', priority: 0.75, region: 'Major Metro' },
    { city: 'irving', priority: 0.65, region: 'DFW Metro' },
    { city: 'cedar-hill', priority: 0.65, region: 'Service Area' },
    { city: 'duncanville', priority: 0.65, region: 'Service Area' },
  ].map((location) => ({
    url: `${baseUrl}/tattoo-artist-${location.city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: location.priority,
  }));

  // Blog/content pages for SEO (when implemented)
  const contentPages = [
    { slug: 'tattoo-aftercare-guide', priority: 0.7 },
    { slug: 'tattoo-pricing-guide', priority: 0.75 },
    { slug: 'first-tattoo-guide', priority: 0.7 },
    { slug: 'tattoo-design-process', priority: 0.65 },
    { slug: 'cover-up-tattoo-guide', priority: 0.7 },
  ].map((content) => ({
    url: `${baseUrl}/guides/${content.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: content.priority,
  }));

  // Dynamic gallery pages with optimized metadata
  const galleryPages = galleryItems.map((item) => {
    const lastMod = item.updatedAt ?? item.createdAt;
    const priority = item.designType === 'traditional' || item.designType === 'japanese' || item.designType === 'realism' 
      ? 0.65 // Higher priority for popular styles
      : 0.6;  // Standard priority for other designs
    
    return {
      url: `${baseUrl}/gallery/${item.id}`,
      lastModified: lastMod,
      changeFrequency: 'monthly' as const,
      priority,
    };
  });

  // Exclude admin pages from public sitemap for better crawl budget
  // Admin pages should not be publicly indexed

  return [
    ...mainPages,
    ...galleryStyles,
    ...servicePages,
    ...locationPages,
    ...contentPages,
    ...galleryPages,
  ];
}
