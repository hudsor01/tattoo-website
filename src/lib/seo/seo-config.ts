/**
 * SEO Configuration for Ink 37 Tattoos
 * 
 * Centralized SEO configuration for consistent metadata across the application.
 * Optimized for local tattoo business SEO and Google discoverability.
 */

import type { Metadata } from 'next';
import { ENV } from '@/lib/utils/env';

// Base SEO configuration
export const seoConfig = {
  // Business Information
  businessName: 'Ink 37 Tattoos',
  artistName: 'Fernando Govea',
  tagline: 'Custom Tattoo Artistry',
  
  // Location Information
  location: {
    city: 'Crowley',
    state: 'Texas',
    region: 'Dallas-Fort Worth Metroplex',
    zipCode: '76036',
    address: 'Dallas/Fort Worth, TX',
  },
  
  // Contact Information
  contact: {
    email: 'hello@ink37tattoos.com',
    phone: '',
    website: 'https://ink37tattoos.com',
  },
  
  // Social Media (no Twitter per client request)
  social: {
    instagram: 'https://instagram.com/ink37tattoos',
    facebook: 'https://facebook.com/ink37tattoos',
    tiktok: '@ink37tattoos',
  },
  
  // Base URLs and images
  siteUrl: typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com',
  baseUrl: typeof ENV.NEXT_PUBLIC_APP_URL === 'string' ? ENV.NEXT_PUBLIC_APP_URL : 'https://ink37tattoos.com',
  defaultOgImage: '/images/og-image.jpg',
  ogImage: '/images/og-image.jpg',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  
  // Default metadata
  defaultTitle: 'Ink 37 | Professional Tattoo Artist in Dallas/Fort Worth, TX | Custom Tattoos DFW',
  defaultDescription: 'Professional tattoo artist in Dallas/Fort Worth area serving Crowley, Arlington, Burleson & DFW metroplex. Custom designs, cover-ups, fine line work, traditional tattoos. Book your consultation today!',
  
  // Keywords array for layout
  defaultKeywords: [
    'tattoo artist Crowley TX',
    'custom tattoos Fort Worth',
    'tattoo shop DFW',
    'professional tattoo artist',
    'cover up tattoos',
    'fine line tattoos',
    'traditional tattoos',
    'tattoo consultation',
    'Ink 37',
    'Crowley tattoo',
    'Arlington tattoo',
    'Burleson tattoo',
    'Mansfield tattoo',
  ] as string[],
  
  // Keywords for local SEO
  baseKeywords: [
    // Business Keywords
    'tattoo artist',
    'custom tattoos',
    'custom tattoo design',
    'ink 37 tattoos',
    'fernando govea',
    
    // Location Keywords (Primary)
    'crowley texas tattoo',
    'crowley tx tattoo artist',
    'tattoo artist crowley',
    
    // Location Keywords (Metro Area)
    'dallas tattoo artist',
    'fort worth tattoo',
    'dfw tattoo artist',
    'dallas fort worth tattoo',
    'texas tattoo artist',
    
    // Service Keywords
    'custom tattoo design',
    'traditional tattoos',
    'fine line tattoos',
    'realistic tattoos',
    'cover up tattoos',
    'tattoo consultation',
    
    // Local Area Keywords
    'burleson tattoo',
    'mansfield tattoo',
    'arlington tattoo',
    'forest hill tattoo',
    'grand prairie tattoo',
  ],
} as const;

/**
 * Generate page-specific metadata with SEO best practices
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  canonical,
  noIndex = false,
  ogType = 'website',
}: {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}): Metadata {
  const fullTitle = title.includes(seoConfig.businessName) 
    ? title 
    : `${title} | ${seoConfig.businessName}`;
  
  const pageDescription = description ?? seoConfig.defaultDescription;
  const allKeywords = [...seoConfig.baseKeywords, ...keywords];
  const imageUrl = ogImage ?? seoConfig.ogImage;
  
  return {
    title: fullTitle,
    description: pageDescription,
    keywords: allKeywords.join(', '),
    
    // Authors and creators
    authors: [{ name: seoConfig.artistName, url: seoConfig.contact.website }],
    creator: seoConfig.artistName,
    publisher: seoConfig.businessName,
    
    // Technical SEO
    metadataBase: new URL(typeof seoConfig.baseUrl === 'string' ? seoConfig.baseUrl : 'https://ink37tattoos.com'),
    alternates: {
      canonical: canonical ?? undefined,
    },
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    
    // OpenGraph
    openGraph: {
      title: fullTitle,
      description: pageDescription,
      url: canonical ? `${typeof seoConfig.baseUrl === 'string' ? seoConfig.baseUrl : 'https://ink37tattoos.com'}${canonical}` : (typeof seoConfig.baseUrl === 'string' ? seoConfig.baseUrl : 'https://ink37tattoos.com'),
      siteName: seoConfig.businessName,
      type: ogType,
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${seoConfig.businessName} - ${title}`,
        },
      ],
    },
    
    // OpenGraph only (no Twitter per client request)
    
    // Additional metadata
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

/**
 * Service-specific SEO metadata
 */
export const servicePageSEO = {
  'custom-designs': {
    title: 'Custom Tattoo Designs',
    description: 'Unique custom tattoo designs created collaboratively with you. Fernando Govea specializes in turning your vision into personalized tattoo art in Crowley, Texas.',
    keywords: ['custom tattoo design', 'personalized tattoos', 'bespoke tattoo art'],
  },
  'traditional': {
    title: 'Traditional Tattoos',
    description: 'Classic traditional tattoo style with bold lines and vibrant colors. Experience authentic American traditional tattoos in the Dallas-Fort Worth area.',
    keywords: ['traditional tattoos', 'american traditional', 'classic tattoo style'],
  },
  'fine-line': {
    title: 'Fine Line Tattoos',
    description: 'Delicate fine line tattoo work with precision and attention to detail. Minimalist and intricate designs in Crowley, Texas.',
    keywords: ['fine line tattoos', 'minimalist tattoos', 'delicate tattoo work'],
  },
  'realism': {
    title: 'Realistic Tattoos',
    description: 'Photorealistic tattoo portraits and detailed realistic artwork. Expert shading and detail work in the Dallas-Fort Worth metroplex.',
    keywords: ['realistic tattoos', 'portrait tattoos', 'photorealistic ink'],
  },
  'cover-ups': {
    title: 'Cover-Up Tattoos',
    description: 'Expert cover-up tattoo services to transform existing tattoos. Creative solutions for tattoo rework and concealment in Texas.',
    keywords: ['cover up tattoos', 'tattoo rework', 'tattoo transformation'],
  },
} as const;

/**
 * Location-specific SEO metadata for local pages
 */
export const locationPageSEO = {
  'crowley': {
    title: 'Tattoo Artist in Crowley, Texas',
    description: 'Premier tattoo artist in Crowley, TX. Fernando Govea provides custom tattoo services with a personal touch in a comfortable environment.',
    keywords: ['crowley texas tattoo', 'crowley tx tattoo artist', 'tattoo artist crowley'],
  },
  'dallas': {
    title: 'Dallas Tattoo Artist - Custom Ink',
    description: 'Professional tattoo services serving Dallas, Texas. Custom designs and expert tattoo artistry in the Dallas metropolitan area.',
    keywords: ['dallas tattoo artist', 'dallas custom tattoos', 'tattoo dallas tx'],
  },
  'fort-worth': {
    title: 'Fort Worth Tattoo Services',
    description: 'Quality tattoo services for Fort Worth and surrounding areas. Custom tattoo designs and professional ink work.',
    keywords: ['fort worth tattoo', 'fort worth tattoo artist', 'tattoo fort worth tx'],
  },
  'burleson': {
    title: 'Burleson Area Tattoo Artist',
    description: 'Serving Burleson and Johnson County with custom tattoo services. Professional tattoo artistry near Burleson, Texas.',
    keywords: ['burleson tattoo', 'johnson county tattoo', 'tattoo near burleson'],
  },
} as const;

/**
 * Generate structured data for local business SEO
 */
export function generateBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TattooShop',
    name: seoConfig.businessName,
    description: seoConfig.defaultDescription,
    url: seoConfig.baseUrl,
    telephone: seoConfig.contact.phone,
    email: seoConfig.contact.email,
    
    // Location
    address: {
      '@type': 'PostalAddress',
      streetAddress: seoConfig.location.address,
      addressLocality: seoConfig.location.city,
      addressRegion: seoConfig.location.state,
      postalCode: seoConfig.location.zipCode,
      addressCountry: 'US',
    },
    
    // Service area
    areaServed: [
      {
        '@type': 'City',
        name: 'Crowley, Texas',
      },
      {
        '@type': 'City', 
        name: 'Dallas, Texas',
      },
      {
        '@type': 'City',
        name: 'Fort Worth, Texas',
      },
      {
        '@type': 'City',
        name: 'Burleson, Texas',
      },
    ],
    
    // Services
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tattoo Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Tattoo Design',
            description: 'Personalized tattoo designs created collaboratively',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Traditional Tattoos',
            description: 'Classic American traditional tattoo style',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Fine Line Tattoos',
            description: 'Delicate and precise fine line tattoo work',
          },
        },
      ],
    },
    
    // Artist information
    employee: {
      '@type': 'Person',
      name: seoConfig.artistName,
      jobTitle: 'Tattoo Artist',
      url: seoConfig.baseUrl,
    },
    
    // Social media
    sameAs: [
      seoConfig.social.instagram,
      seoConfig.social.facebook,
    ],
    
    // Operating hours (update as needed)
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
  };
}