/**
 * Advanced SEO Meta Tags Generator for Ink 37 Tattoos
 * 
 * Provides comprehensive meta tag generation with Core Web Vitals optimization,
 * enhanced social media integration, and local SEO optimization.
 */

import type { Metadata } from 'next';
import { seoConfig } from './seo-config';

export interface AdvancedSEOOptions {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'video.other';
  canonical?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: object;
}

/**
 * Generate comprehensive metadata with advanced SEO optimization
 */
export function generateAdvancedMetadata(options: AdvancedSEOOptions): Metadata {
  const {
    title,
    description = seoConfig.defaultDescription,
    keywords = [],
    ogImage,
    ogType = 'website',
    canonical,
    noIndex = false,
    publishedTime,
    modifiedTime,
    author = seoConfig.artistName,
    section,
    tags = [],
    locale = 'en_US',
    alternateLocales = [],
    twitterCard = 'summary_large_image',
  } = options;

  // Combine and optimize keywords
  const allKeywords = [
    ...seoConfig.baseKeywords,
    ...keywords,
    ...tags,
  ].filter((keyword, index, array) => array.indexOf(keyword) === index);

  // Determine the best image for social sharing
  const socialImage = ogImage ?? seoConfig.ogImage;
  const imageUrl = socialImage.startsWith('http') 
    ? socialImage 
    : `${seoConfig.siteUrl}${socialImage}`;

  // Generate comprehensive title
  const fullTitle = title.includes(seoConfig.businessName) 
    ? title 
    : `${title} | ${seoConfig.businessName}`;

  // Core metadata
  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    
    // Authors and creators
    authors: [{ name: author, url: seoConfig.contact.website }],
    creator: author,
    publisher: seoConfig.businessName,
    
    // Technical SEO
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: canonical ? `${seoConfig.siteUrl}${canonical}` : undefined,
      languages: alternateLocales.reduce((acc, loc) => {
        acc[loc] = `${seoConfig.siteUrl}/${loc}`;
        return acc;
      }, {} as Record<string, string>),
    },
    
    // Robots directives
    robots: noIndex 
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    
    // Enhanced Open Graph
    openGraph: {
      type: ogType,
      locale,
      title: fullTitle,
      description,
      url: canonical ? `${seoConfig.siteUrl}${canonical}` : seoConfig.siteUrl,
      siteName: seoConfig.businessName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${seoConfig.businessName}`,
          type: 'image/jpeg',
        },
        // Additional image sizes for better optimization
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${title} - ${seoConfig.businessName}`,
          type: 'image/jpeg',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { 
        authors: [author],
      }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    
    // Enhanced Twitter Card
    twitter: {
      card: twitterCard,
      site: seoConfig.social.tiktok, // Using TikTok handle as Twitter equivalent
      creator: seoConfig.social.tiktok,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    
    // Additional meta tags for enhanced SEO
    other: {
      // Geo-location tags for local SEO
      'geo.region': seoConfig.advancedSeoTags.geoTags['geo.region'],
      'geo.placename': seoConfig.advancedSeoTags.geoTags['geo.placename'],
      'geo.position': seoConfig.advancedSeoTags.geoTags['geo.position'],
      'ICBM': seoConfig.advancedSeoTags.geoTags['ICBM'],
      
      // Mobile optimization
      'mobile-web-app-capable': seoConfig.advancedSeoTags.mobileOptimization['mobile-web-app-capable'],
      'apple-mobile-web-app-capable': seoConfig.advancedSeoTags.mobileOptimization['apple-mobile-web-app-capable'],
      'apple-mobile-web-app-status-bar-style': seoConfig.advancedSeoTags.mobileOptimization['apple-mobile-web-app-status-bar-style'],
      'apple-mobile-web-app-title': seoConfig.advancedSeoTags.mobileOptimization['apple-mobile-web-app-title'],
      'application-name': seoConfig.advancedSeoTags.mobileOptimization['application-name'],
      'msapplication-TileColor': seoConfig.advancedSeoTags.mobileOptimization['msapplication-TileColor'],
      'theme-color': seoConfig.advancedSeoTags.mobileOptimization['theme-color'],
      
      // Security headers
      'referrer': seoConfig.advancedSeoTags.security['referrer'],
      
      // Enhanced search engine directives
      'robots': seoConfig.advancedSeoTags.robotsMeta['robots'],
      'googlebot': seoConfig.advancedSeoTags.robotsMeta['googlebot'],
      'bingbot': seoConfig.advancedSeoTags.robotsMeta['bingbot'],
      
      // Business information for local SEO
      'business:contact_data:locality': seoConfig.location.city,
      'business:contact_data:region': seoConfig.location.state,
      'business:contact_data:country_name': 'United States',
      'business:contact_data:postal_code': seoConfig.location.zipCode,
      
      // Article-specific meta tags (when applicable)
      ...(ogType === 'article' && {
        'article:author': author,
        'article:publisher': seoConfig.businessName,
        ...(section && { 'article:section': section }),
        ...(tags.length > 0 && { 'article:tag': tags.join(',') }),
        ...(publishedTime && { 'article:published_time': publishedTime }),
        ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      }),
      
      // Rich snippets optimization
      'google-site-verification': process.env['GOOGLE_SITE_VERIFICATION'] ?? '',
      'msvalidate.01': process.env['BING_SITE_VERIFICATION'] ?? '',
    },
  };

  return metadata;
}

/**
 * Generate structured data script tag
 */
export function generateStructuredDataScript(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

/**
 * Generate preconnect and DNS prefetch links for Core Web Vitals
 */
export function generatePerformanceLinks(): Array<{ rel: string; href: string; crossOrigin?: string }> {
  const links: { rel: string; href: string; crossOrigin?: string }[] = [];
  
  // Preconnect to external domains
  seoConfig.advancedSeoTags.performance.preconnect.forEach(domain => {
    links.push({
      rel: 'preconnect',
      href: domain,
      crossOrigin: domain.includes('fonts') ? 'anonymous' : undefined,
    });
  });
  
  // DNS prefetch for analytics
  seoConfig.advancedSeoTags.performance['dns-prefetch'].forEach(domain => {
    links.push({
      rel: 'dns-prefetch',
      href: domain,
    });
  });
  
  return links;
}

/**
 * Generate critical resource hints for performance
 */
export function generateResourceHints() {
  return {
    preconnect: seoConfig.advancedSeoTags.performance.preconnect,
    dnsPrefetch: seoConfig.advancedSeoTags.performance['dns-prefetch'],
  };
}

/**
 * Generate local business structured data with enhanced schema
 */
export function generateEnhancedLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TattooShop', 'LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${seoConfig.siteUrl}#business`,
    name: seoConfig.businessName,
    alternateName: [
      'Ink 37',
      'Ink37 Tattoos',
      'Fernando Govea Tattoo Artist',
    ],
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}${seoConfig.logo}`,
    image: [
      `${seoConfig.siteUrl}/images/japanese.jpg`,
      `${seoConfig.siteUrl}/images/traditional.jpg`,
      `${seoConfig.siteUrl}/images/realism.jpg`,
    ],
    telephone: seoConfig.contact.phone || undefined,
    email: seoConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: seoConfig.location.city,
      addressRegion: seoConfig.location.state,
      postalCode: seoConfig.location.zipCode,
      addressCountry: 'US',
      streetAddress: seoConfig.location.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.5639,
      longitude: -97.2983,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Crowley',
        containedInPlace: {
          '@type': 'State',
          name: 'Texas',
        },
      },
      {
        '@type': 'City',
        name: 'Fort Worth',
        containedInPlace: {
          '@type': 'State',
          name: 'Texas',
        },
      },
      {
        '@type': 'City',
        name: 'Arlington',
        containedInPlace: {
          '@type': 'State',
          name: 'Texas',
        },
      },
      {
        '@type': 'City',
        name: 'Burleson',
        containedInPlace: {
          '@type': 'State',
          name: 'Texas',
        },
      },
    ],
    sameAs: [
      seoConfig.social.instagram,
      seoConfig.social.facebook,
    ],
    openingHours: [
      'Mo-Sa 10:00-18:00',
    ],
    priceRange: '$$',
    paymentAccepted: [
      'Cash',
      'Credit Card',
      'Debit Card',
      'Venmo',
      'Zelle',
    ],
    currenciesAccepted: 'USD',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tattoo Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Tattoo Design',
            description: 'Personalized tattoo artwork created specifically for each client',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cover-up Tattoos',
            description: 'Professional cover-up work for existing tattoos',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Traditional Tattoos',
            description: 'Classic American traditional style tattoos',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Japanese Tattoos',
            description: 'Traditional Japanese style tattoo artwork',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Realism Tattoos',
            description: 'Photorealistic tattoo artwork',
          },
        },
      ],
    },
    founder: {
      '@type': 'Person',
      name: seoConfig.artistName,
      jobTitle: 'Tattoo Artist',
      worksFor: {
        '@id': `${seoConfig.siteUrl}#business`,
      },
    },
  };
}
