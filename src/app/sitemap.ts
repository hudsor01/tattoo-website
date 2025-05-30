import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://ink37tattoos.com';

  // Main pages with higher priority
  const mainPages = [
    {
      url: baseUrl,
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

  // Blog/Article pages - COMMENTED OUT until blog section exists
  // const blogPages = [
  //   'tattoo-aftercare-guide',
  //   'first-tattoo-tips',
  //   'tattoo-pain-chart',
  //   'how-to-choose-tattoo-design',
  //   'tattoo-style-guide',
  // ].map(article => ({
  //   url: `${baseUrl}/blog/${article}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }));

  // Admin portal pages (lower priority, but included for completeness)
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
      url: `${baseUrl}/admin/bookings`,
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

  // Client portal (lower priority)
  const clientPages = [
    {
      url: `${baseUrl}/client-portal`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  return [
    ...mainPages,
    ...galleryStyles,
    ...servicePages,
    ...locationPages, // Cities near Crowley, Texas
    // ...blogPages,      // Re-enable when blog exists
    ...adminPages,
    ...clientPages,
  ];
}
