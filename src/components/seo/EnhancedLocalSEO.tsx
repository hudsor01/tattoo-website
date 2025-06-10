/**
 * Enhanced Local SEO Component for Ink 37 Tattoos
 * 
 * Provides comprehensive local SEO optimization for maximum visibility in 
 * Dallas/Fort Worth area searches:
 * - Location-specific structured data
 * - Google My Business optimization
 * - Local citation schema
 * - Service area targeting
 * - Review schema integration
 */

'use client';

import React from 'react';
import Script from 'next/script';
import { seoConfig } from '@/lib/seo/seo-config';

interface LocalSEOProps {
  page?: 'homepage' | 'services' | 'gallery' | 'contact' | 'booking';
  location?: string;
  service?: string;
  customSchema?: object;
}

/**
 * Enhanced Local SEO component with comprehensive schema markup
 */
export default function EnhancedLocalSEO({
  page = 'homepage',
  location,
  service,
  customSchema,
}: LocalSEOProps) {
  
  // Generate location-specific schema
  const locationSchema = generateLocationSchema(location);
  
  // Generate service-specific schema
  const serviceSchema = generateServiceSchema(service);
  
  // Generate page-specific business schema
  const businessSchema = generateEnhancedBusinessSchema(page);
  
  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(page, location, service);
  
  // Generate FAQ schema for relevant pages
  const faqSchema = page === 'services' || page === 'booking' ? generateTattooFAQSchema() : null;
  
  // Combine all schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      businessSchema,
      locationSchema,
      serviceSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
      ...(customSchema ? [customSchema] : []),
    ].filter(Boolean),
  };

  return (
    <>
      {/* Enhanced Local Business Schema */}
      <Script
        id="enhanced-local-seo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchema, null, 2),
        }}
      />
      
      {/* Google My Business optimization */}
      <Script
        id="google-my-business-optimization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateGoogleMyBusinessSchema(), null, 2),
        }}
      />
      
      {/* Local citation schema */}
      <Script
        id="local-citation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalCitationSchema(), null, 2),
        }}
      />
      
      {/* Service area schema */}
      <Script
        id="service-area-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateServiceAreaSchema(), null, 2),
        }}
      />
    </>
  );
}

/**
 * Generate location-specific schema markup
 */
function generateLocationSchema(location?: string) {
  if (!location) return null;
  
  const locationData = getLocationData(location);
  
  return {
    '@type': 'Place',
    '@id': `${seoConfig.siteUrl}/tattoo-artist-${location}#place`,
    name: `${seoConfig.businessName} - ${locationData.displayName}`,
    description: `Professional tattoo services in ${locationData.displayName}, ${seoConfig.location.state}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locationData.displayName,
      addressRegion: seoConfig.location.state,
      addressCountry: 'US',
    },
    geo: locationData.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: locationData.coordinates.lat,
      longitude: locationData.coordinates.lng,
    } : undefined,
    containedInPlace: {
      '@type': 'State',
      name: 'Texas',
      containedInPlace: {
        '@type': 'Country',
        name: 'United States',
      },
    },
  };
}

/**
 * Generate service-specific schema markup
 */
function generateServiceSchema(service?: string) {
  if (!service) return null;
  
  const serviceData = getServiceData(service);
  
  return {
    '@type': 'Service',
    '@id': `${seoConfig.siteUrl}/services/${service}#service`,
    name: serviceData.name,
    description: serviceData.description,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${seoConfig.siteUrl}#business`,
      name: seoConfig.businessName,
    },
    serviceType: 'Tattoo Services',
    category: 'Body Art',
    offers: {
      '@type': 'Offer',
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.priceRange || 'Contact for pricing',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'LocalBusiness',
        '@id': `${seoConfig.siteUrl}#business`,
      },
    },
    areaServed: generateServiceAreas(),
  };
}

/**
 * Generate enhanced business schema with page-specific optimizations
 */
function generateEnhancedBusinessSchema(page: string) {
  const baseSchema = {
    '@type': ['TattooShop', 'LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${seoConfig.siteUrl}#business`,
    name: seoConfig.businessName,
    alternateName: ['Ink 37', 'Ink37 Tattoos'],
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
      streetAddress: seoConfig.location.address,
      addressLocality: seoConfig.location.city,
      addressRegion: seoConfig.location.state,
      postalCode: seoConfig.location.zipCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.5639,
      longitude: -97.2983,
    },
    openingHours: [
      'Mo-Sa 10:00-18:00',
    ],
    priceRange: '$$',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Venmo', 'Zelle'],
    currenciesAccepted: 'USD',
    areaServed: generateServiceAreas(),
    sameAs: [
      seoConfig.social.instagram,
      seoConfig.social.facebook,
    ],
    founder: {
      '@type': 'Person',
      name: seoConfig.artistName,
      jobTitle: 'Professional Tattoo Artist',
      knowsAbout: [
        'Traditional Tattoos',
        'Japanese Tattoos',
        'Realism Tattoos',
        'Cover-up Tattoos',
        'Custom Tattoo Design',
      ],
    },
  };

  // Add page-specific enhancements
  switch (page) {
    case 'services':
      return {
        ...baseSchema,
        hasOfferCatalog: generateOfferCatalog(),
      };
    case 'gallery':
      return {
        ...baseSchema,
        hasOfferCatalog: generateOfferCatalog(),
        mainEntityOfPage: {
          '@type': 'CollectionPage',
          name: 'Professional Tattoo Gallery',
          url: `${seoConfig.siteUrl}/gallery`,
        },
      };
    case 'contact':
      return {
        ...baseSchema,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: seoConfig.contact.phone || '',
          email: seoConfig.contact.email,
          contactType: 'Customer Service',
          areaServed: 'US-TX',
          availableLanguage: 'English',
        },
      };
    case 'booking':
      return {
        ...baseSchema,
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${seoConfig.siteUrl}/booking`,
            actionPlatform: [
              'https://schema.org/DesktopWebPlatform',
              'https://schema.org/MobileWebPlatform',
            ],
          },
          result: {
            '@type': 'Reservation',
            name: 'Tattoo Consultation Booking',
          },
        },
      };
    default:
      return baseSchema;
  }
}

/**
 * Generate breadcrumb schema for navigation
 */
function generateBreadcrumbSchema(page: string, location?: string, service?: string) {
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: seoConfig.siteUrl,
    },
  ];

  // Add page-specific breadcrumbs
  switch (page) {
    case 'services':
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${seoConfig.siteUrl}/services`,
      });
      if (service) {
        breadcrumbs.push({
          '@type': 'ListItem',
          position: 3,
          name: getServiceData(service).name,
          item: `${seoConfig.siteUrl}/services/${service}`,
        });
      }
      break;
    case 'gallery':
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Gallery',
        item: `${seoConfig.siteUrl}/gallery`,
      });
      break;
    case 'contact':
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: `${seoConfig.siteUrl}/contact`,
      });
      break;
    case 'booking':
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Book Consultation',
        item: `${seoConfig.siteUrl}/booking`,
      });
      break;
  }

  if (location) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: breadcrumbs.length + 1,
      name: `Tattoo Artist ${getLocationData(location).displayName}`,
      item: `${seoConfig.siteUrl}/tattoo-artist-${location}`,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${seoConfig.siteUrl}#breadcrumb`,
    itemListElement: breadcrumbs,
  };
}

/**
 * Generate FAQ schema for tattoo-related questions
 */
function generateTattooFAQSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${seoConfig.siteUrl}/faq#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much do tattoos cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tattoo pricing varies based on size, complexity, and placement. We offer consultations to provide accurate pricing for your custom design.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a tattoo take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tattoo session length depends on the size and complexity of the design. Small tattoos may take 1-2 hours, while larger pieces may require multiple sessions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you do cover-up tattoos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we specialize in cover-up tattoos and can transform existing tattoos into beautiful new artwork.',
        },
      },
      {
        '@type': 'Question',
        name: 'What areas do you serve?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We serve the entire Dallas/Fort Worth metroplex including Crowley, Arlington, Burleson, Mansfield, Fort Worth, and surrounding areas.',
        },
      },
    ],
  };
}

/**
 * Generate Google My Business optimization schema
 */
function generateGoogleMyBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${seoConfig.siteUrl}#gmb`,
    name: seoConfig.businessName,
    image: `${seoConfig.siteUrl}${seoConfig.logo}`,
    telephone: seoConfig.contact.phone || '',
    email: seoConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: seoConfig.location.address,
      addressLocality: seoConfig.location.city,
      addressRegion: seoConfig.location.state,
      postalCode: seoConfig.location.zipCode,
      addressCountry: 'US',
    },
    url: seoConfig.siteUrl,
    openingHours: ['Mo-Sa 10:00-18:00'],
    priceRange: '$$',
    servesCuisine: 'Tattoo Art', // Non-standard but helps with categorization
  };
}

/**
 * Generate local citation schema
 */
function generateLocalCitationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${seoConfig.siteUrl}#citation`,
    name: seoConfig.businessName,
    alternateName: ['Ink 37', 'Ink37 Tattoos'],
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}${seoConfig.logo}`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: seoConfig.contact.phone || '',
      email: seoConfig.contact.email,
      contactType: 'Customer Service',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: seoConfig.location.address,
      addressLocality: seoConfig.location.city,
      addressRegion: seoConfig.location.state,
      postalCode: seoConfig.location.zipCode,
      addressCountry: 'US',
    },
    areaServed: generateServiceAreas(),
  };
}

/**
 * Generate service area schema
 */
function generateServiceAreaSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${seoConfig.siteUrl}#service-area`,
    name: 'Professional Tattoo Services',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${seoConfig.siteUrl}#business`,
    },
    areaServed: generateServiceAreas(),
    serviceType: 'Tattoo Services',
    category: 'Body Art',
  };
}

/**
 * Helper function to generate service areas
 */
function generateServiceAreas() {
  const cities = [
    'Crowley', 'Fort Worth', 'Arlington', 'Burleson', 'Mansfield',
    'Grand Prairie', 'Forest Hill', 'Kennedale', 'Everman',
    'Dallas', 'Irving', 'Cedar Hill', 'Duncanville', 'DeSoto',
  ];

  return cities.map(city => ({
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'State',
      name: 'Texas',
      containedInPlace: {
        '@type': 'Country',
        name: 'United States',
      },
    },
  }));
}

/**
 * Helper function to get location data
 */
function getLocationData(location: string) {
  const locationMap: Record<string, any> = {
    'crowley': { displayName: 'Crowley', coordinates: { lat: 32.5639, lng: -97.2983 } },
    'fort-worth': { displayName: 'Fort Worth', coordinates: { lat: 32.7555, lng: -97.3308 } },
    'arlington': { displayName: 'Arlington', coordinates: { lat: 32.7357, lng: -97.1081 } },
    'burleson': { displayName: 'Burleson', coordinates: { lat: 32.5421, lng: -97.3208 } },
    'mansfield': { displayName: 'Mansfield', coordinates: { lat: 32.5632, lng: -97.1417 } },
    'grand-prairie': { displayName: 'Grand Prairie', coordinates: { lat: 32.7460, lng: -96.9978 } },
  };

  return locationMap[location] || { displayName: location.replace('-', ' '), coordinates: null };
}

/**
 * Helper function to get service data
 */
function getServiceData(service: string) {
  const serviceMap: Record<string, any> = {
    'custom-tattoo-design': {
      name: 'Custom Tattoo Design',
      description: 'Personalized tattoo artwork created specifically for each client',
      priceRange: 'Contact for pricing',
    },
    'cover-up-tattoos': {
      name: 'Cover-up Tattoos',
      description: 'Professional cover-up work for existing tattoos',
      priceRange: 'Contact for pricing',
    },
    'traditional-tattoos': {
      name: 'Traditional Tattoos',
      description: 'Classic American traditional style tattoos',
      priceRange: 'Contact for pricing',
    },
    'japanese-tattoos': {
      name: 'Japanese Tattoos',
      description: 'Traditional Japanese style tattoo artwork',
      priceRange: 'Contact for pricing',
    },
    'realism-tattoos': {
      name: 'Realism Tattoos',
      description: 'Photorealistic tattoo artwork',
      priceRange: 'Contact for pricing',
    },
  };

  return serviceMap[service] || { name: service.replace('-', ' '), description: '', priceRange: 'Contact for pricing' };
}

/**
 * Helper function to generate offer catalog
 */
function generateOfferCatalog() {
  return {
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
  };
}
