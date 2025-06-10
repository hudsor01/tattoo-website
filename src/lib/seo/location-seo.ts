/**
 * Location-Specific SEO Page Generator for Ink 37 Tattoos
 * 
 * Generates dynamic location-specific content and metadata for maximum local SEO impact.
 * Creates landing pages for different DFW cities to capture location-based searches.
 */

import { generateAdvancedMetadata } from './advanced-meta-tags';
import { seoConfig } from './seo-config';

export interface LocationData {
  slug: string;
  displayName: string;
  county: string;
  population: string;
  zipCodes: string[];
  landmarks: string[];
  searchVolume: 'high' | 'medium' | 'low';
  coordinates: {
    lat: number;
    lng: number;
  };
  drivingTime: string;
  description: string;
  neighborhoods?: string[];
}

// Comprehensive DFW location data for local SEO
export const DFW_LOCATIONS: Record<string, LocationData> = {
  'crowley': {
    slug: 'crowley',
    displayName: 'Crowley',
    county: 'Tarrant County',
    population: '21,000',
    zipCodes: ['76036'],
    landmarks: ['Crowley City Park', 'Eagle Mountain Lake', 'Crowley High School'],
    searchVolume: 'medium',
    coordinates: { lat: 32.5639, lng: -97.2983 },
    drivingTime: '0 minutes',
    description: 'Located in the heart of Crowley, our tattoo studio provides professional custom tattoo services to the local community.',
    neighborhoods: ['Downtown Crowley', 'Eagle Mountain', 'Western Hills'],
  },
  'fort-worth': {
    slug: 'fort-worth',
    displayName: 'Fort Worth',
    county: 'Tarrant County', 
    population: '918,000',
    zipCodes: ['76102', '76104', '76107', '76109', '76110', '76116', '76118'],
    landmarks: ['Fort Worth Stockyards', 'Downtown Fort Worth', 'Cultural District', 'TCU'],
    searchVolume: 'high',
    coordinates: { lat: 32.7555, lng: -97.3308 },
    drivingTime: '15 minutes',
    description: 'Serving Fort Worth with premium tattoo artistry, just a short drive from our Crowley studio.',
    neighborhoods: ['Downtown', 'Cultural District', 'Near Southside', 'Westside', 'Northside'],
  },
  'arlington': {
    slug: 'arlington',
    displayName: 'Arlington',
    county: 'Tarrant County',
    population: '394,000',
    zipCodes: ['76010', '76011', '76012', '76013', '76014', '76015', '76016', '76017', '76018', '76019'],
    landmarks: ['AT&T Stadium', 'Globe Life Field', 'Six Flags Over Texas', 'UT Arlington'],
    searchVolume: 'high',
    coordinates: { lat: 32.7357, lng: -97.1081 },
    drivingTime: '20 minutes',
    description: 'Professional tattoo services for Arlington residents, conveniently located between Dallas and Fort Worth.',
    neighborhoods: ['Downtown Arlington', 'Entertainment District', 'Dalworthington Gardens'],
  },
  'burleson': {
    slug: 'burleson',
    displayName: 'Burleson',
    county: 'Tarrant County',
    population: '51,000',
    zipCodes: ['76028', '76058'],
    landmarks: ['Old Town Burleson', 'Burleson Centennial High School', 'Hidden Creek Golf Course'],
    searchVolume: 'medium',
    coordinates: { lat: 32.5421, lng: -97.3208 },
    drivingTime: '10 minutes',
    description: 'Serving Burleson with exceptional tattoo artistry in a welcoming, professional environment.',
    neighborhoods: ['Old Town', 'Hidden Creek', 'Settlers Ridge'],
  },
  'mansfield': {
    slug: 'mansfield',
    displayName: 'Mansfield',
    county: 'Tarrant County',
    population: '73,000',
    zipCodes: ['76063'],
    landmarks: ['Mansfield Historical Museum', 'Katherine Rose Memorial Park', 'Mansfield National Golf Club'],
    searchVolume: 'medium',
    coordinates: { lat: 32.5632, lng: -97.1417 },
    drivingTime: '15 minutes',
    description: 'Custom tattoo designs and professional artwork for the Mansfield community.',
    neighborhoods: ['Historic Downtown', 'Walnut Creek', 'Heritage'],
  },
  'grand-prairie': {
    slug: 'grand-prairie',
    displayName: 'Grand Prairie',
    county: 'Dallas County',
    population: '196,000',
    zipCodes: ['75050', '75051', '75052', '75053', '75054'],
    landmarks: ['Lone Star Park', 'Prairie Lights', 'Grand Prairie Premium Outlets'],
    searchVolume: 'high',
    coordinates: { lat: 32.7460, lng: -96.9978 },
    drivingTime: '25 minutes',
    description: 'Expert tattoo services for Grand Prairie, offering custom designs and exceptional artistry.',
    neighborhoods: ['Dalworth Park', 'Pleasant Ridge', 'Southwest Grand Prairie'],
  },
  'forest-hill': {
    slug: 'forest-hill',
    displayName: 'Forest Hill',
    county: 'Tarrant County',
    population: '13,000',
    zipCodes: ['76140'],
    landmarks: ['Forest Hill Civic Center', 'Forest Hill High School'],
    searchVolume: 'low',
    coordinates: { lat: 32.6714, lng: -97.2697 },
    drivingTime: '12 minutes',
    description: 'Professional tattoo services for Forest Hill residents with personalized attention and custom artwork.',
  },
  'kennedale': {
    slug: 'kennedale',
    displayName: 'Kennedale',
    county: 'Tarrant County',
    population: '8,500',
    zipCodes: ['76060'],
    landmarks: ['Kennedale Main Street', 'Sonora Park'],
    searchVolume: 'low',
    coordinates: { lat: 32.6468, lng: -97.2267 },
    drivingTime: '18 minutes',
    description: 'Serving Kennedale with professional tattoo artistry and custom design services.',
  },
  'everman': {
    slug: 'everman',
    displayName: 'Everman',
    county: 'Tarrant County',
    population: '6,500',
    zipCodes: ['76140'],
    landmarks: ['Everman Park', 'Everman Joe Pool Lake'],
    searchVolume: 'low',
    coordinates: { lat: 32.6318, lng: -97.2922 },
    drivingTime: '15 minutes',
    description: 'Quality tattoo services for Everman residents with a focus on custom designs and professional craftsmanship.',
  },
  'dallas': {
    slug: 'dallas',
    displayName: 'Dallas',
    county: 'Dallas County',
    population: '1,343,000',
    zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210'],
    landmarks: ['Downtown Dallas', 'Deep Ellum', 'Bishop Arts District', 'Fair Park'],
    searchVolume: 'high',
    coordinates: { lat: 32.7767, lng: -96.7970 },
    drivingTime: '30 minutes',
    description: 'Professional tattoo services for Dallas residents, offering exceptional artistry and custom designs.',
    neighborhoods: ['Downtown', 'Deep Ellum', 'Bishop Arts', 'Uptown', 'Oak Cliff'],
  },
  'irving': {
    slug: 'irving',
    displayName: 'Irving',
    county: 'Dallas County',
    population: '256,000',
    zipCodes: ['75038', '75039', '75060', '75061', '75062', '75063'],
    landmarks: ['Irving Arts Center', 'Mustangs at Las Colinas', 'Toyota Music Factory'],
    searchVolume: 'medium',
    coordinates: { lat: 32.8140, lng: -96.9489 },
    drivingTime: '35 minutes',
    description: 'Expert tattoo artistry for Irving community, specializing in custom designs and professional service.',
    neighborhoods: ['Las Colinas', 'Valley Ranch', 'Heritage District'],
  },
  'cedar-hill': {
    slug: 'cedar-hill',
    displayName: 'Cedar Hill',
    county: 'Dallas County',
    population: '48,000',
    zipCodes: ['75104', '75106'],
    landmarks: ['Cedar Hill State Park', 'Historic Downtown Cedar Hill'],
    searchVolume: 'low',
    coordinates: { lat: 32.5885, lng: -96.9561 },
    drivingTime: '25 minutes',
    description: 'Professional tattoo services for Cedar Hill, offering custom artwork and exceptional craftsmanship.',
  },
  'duncanville': {
    slug: 'duncanville',
    displayName: 'Duncanville',
    county: 'Dallas County',
    population: '40,000',
    zipCodes: ['75116', '75137'],
    landmarks: ['Armstrong Park', 'Duncanville Community Theater'],
    searchVolume: 'low',
    coordinates: { lat: 32.6518, lng: -96.9083 },
    drivingTime: '20 minutes',
    description: 'Quality tattoo services for Duncanville residents with personalized attention and custom designs.',
  },
  'desoto': {
    slug: 'desoto',
    displayName: 'DeSoto',
    county: 'Dallas County',
    population: '53,000',
    zipCodes: ['75115'],
    landmarks: ['Thorntree Country Club', 'DeSoto Town Center'],
    searchVolume: 'low',
    coordinates: { lat: 32.5896, lng: -96.8570 },
    drivingTime: '22 minutes',
    description: 'Professional tattoo artistry for DeSoto community, specializing in custom designs and quality work.',
  },
};

/**
 * Generate location-specific metadata for SEO optimization
 */
export function generateLocationMetadata(locationSlug: string) {
  const location = DFW_LOCATIONS[locationSlug];
  
  if (!location) {
    throw new Error(`Location ${locationSlug} not found`);
  }

  const title = `Professional Tattoo Artist in ${location.displayName}, TX | ${seoConfig.businessName}`;
  const description = `Expert tattoo services in ${location.displayName}, ${location.county}. Custom designs, cover-ups, and professional artwork by ${seoConfig.artistName}. ${location.drivingTime} from our studio. Book consultation today!`;

  const keywords = [
    `tattoo artist ${location.displayName}`,
    `tattoo shop ${location.displayName}`,
    `custom tattoos ${location.displayName}`,
    `${location.displayName} tattoo artist`,
    `tattoo parlor ${location.displayName} tx`,
    `best tattoo artist ${location.displayName}`,
    `professional tattoo ${location.displayName}`,
    ...location.zipCodes.map(zip => `tattoo artist ${zip}`),
    ...location.landmarks.map(landmark => `tattoo near ${landmark}`),
  ];

  if (location.neighborhoods) {
    keywords.push(...location.neighborhoods.map(neighborhood => `tattoo artist ${neighborhood}`));
  }

  return generateAdvancedMetadata({
    title,
    description,
    keywords,
    canonical: `/tattoo-artist-${locationSlug}`,
    ogType: 'website',
    ogImage: '/images/traditional.jpg',
  });
}

/**
 * Generate location-specific structured data
 */
export function generateLocationStructuredData(locationSlug: string) {
  const location = DFW_LOCATIONS[locationSlug];
  
  if (!location) {
    throw new Error(`Location ${locationSlug} not found`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${seoConfig.siteUrl}/tattoo-artist-${locationSlug}#service`,
    name: `Professional Tattoo Services - ${location.displayName}`,
    description: `Expert tattoo artistry serving ${location.displayName}, ${location.county}. Custom designs, cover-ups, and professional tattoo services.`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${seoConfig.siteUrl}#business`,
      name: seoConfig.businessName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: seoConfig.location.city,
        addressRegion: seoConfig.location.state,
        postalCode: seoConfig.location.zipCode,
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'City',
      name: location.displayName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: location.county,
        containedInPlace: {
          '@type': 'State',
          name: 'Texas',
        },
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
      },
    },
    serviceType: 'Tattoo Services',
    category: 'Body Art',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Tattoo Services in ${location.displayName}`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Tattoo Design',
            description: `Personalized tattoo artwork for ${location.displayName} residents`,
          },
          areaServed: {
            '@type': 'City',
            name: location.displayName,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cover-up Tattoos',
            description: `Professional cover-up services in ${location.displayName}`,
          },
          areaServed: {
            '@type': 'City',
            name: location.displayName,
          },
        },
      ],
    },
    url: `${seoConfig.siteUrl}/tattoo-artist-${locationSlug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.siteUrl}/tattoo-artist-${locationSlug}`,
    },
  };
}

/**
 * Generate location-specific content for landing pages
 */
export function generateLocationContent(locationSlug: string) {
  const location = DFW_LOCATIONS[locationSlug];
  
  if (!location) {
    throw new Error(`Location ${locationSlug} not found`);
  }

  return {
    heroTitle: `Professional Tattoo Artist in ${location.displayName}, TX`,
    heroSubtitle: `Custom tattoo designs and expert artistry serving ${location.displayName} and surrounding ${location.county} areas`,
    
    introSection: {
      title: `Why Choose ${seoConfig.businessName} for Your ${location.displayName} Tattoo?`,
      content: [
        `Located just ${location.drivingTime} from ${location.displayName}, ${seoConfig.businessName} provides exceptional tattoo services to the ${location.county} community.`,
        `Our studio specializes in custom designs, cover-ups, traditional work, Japanese art, and photorealistic tattoos.`,
        `${seoConfig.artistName} brings years of experience and artistic excellence to every piece, ensuring your tattoo is both beautiful and professionally executed.`,
      ],
    },
    
    servicesSection: {
      title: `Tattoo Services for ${location.displayName} Residents`,
      services: [
        {
          name: 'Custom Tattoo Design',
          description: `Personalized artwork created specifically for ${location.displayName} clients`,
        },
        {
          name: 'Cover-up Tattoos',
          description: `Transform existing tattoos into stunning new artwork`,
        },
        {
          name: 'Traditional Tattoos',
          description: `Classic American traditional style tattooing`,
        },
        {
          name: 'Japanese Tattoos',
          description: `Authentic Japanese style artwork and techniques`,
        },
        {
          name: 'Realism Tattoos',
          description: `Photorealistic portraits and detailed artwork`,
        },
      ],
    },
    
    locationSection: {
      title: `Convenient Location for ${location.displayName}`,
      content: [
        `Our professional tattoo studio is conveniently located in nearby Crowley, making us easily accessible from ${location.displayName}.`,
        `Just ${location.drivingTime} drive from popular ${location.displayName} landmarks like ${location.landmarks.slice(0, 2).join(' and ')}.`,
        `We serve clients throughout ${location.county} including ${location.neighborhoods?.slice(0, 3).join(', ') ?? 'the surrounding areas'}.`,
      ],
    },
    
    ctaSection: {
      title: `Ready for Your ${location.displayName} Tattoo?`,
      content: `Book your free consultation today and let's create something amazing together. We're proud to serve the ${location.displayName} community with professional, high-quality tattoo artistry.`,
    },
    
    faqSection: {
      title: `Frequently Asked Questions - ${location.displayName} Tattoo Services`,
      faqs: [
        {
          question: `How far is your studio from ${location.displayName}?`,
          answer: `Our studio is located ${location.drivingTime} from ${location.displayName}, making us easily accessible for all your tattoo needs.`,
        },
        {
          question: `Do you serve other areas near ${location.displayName}?`,
          answer: `Yes! We serve all of ${location.county} and the greater DFW metroplex, including neighboring cities and communities.`,
        },
        {
          question: `What zip codes do you serve in ${location.displayName}?`,
          answer: `We serve all ${location.displayName} zip codes including ${location.zipCodes.join(', ')} and surrounding areas.`,
        },
      ],
    },
  };
}

/**
 * Get all location slugs for dynamic routing
 */
export function getAllLocationSlugs(): string[] {
  return Object.keys(DFW_LOCATIONS);
}

/**
 * Get location data by slug
 */
export function getLocationData(slug: string): LocationData | null {
  return DFW_LOCATIONS[slug] ?? null;
}

/**
 * Generate breadcrumb schema for location pages
 */
export function generateLocationBreadcrumbs(locationSlug: string) {
  const location = DFW_LOCATIONS[locationSlug];
  
  if (!location) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: seoConfig.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Service Areas',
        item: `${seoConfig.siteUrl}/service-areas`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${location.displayName} Tattoo Artist`,
        item: `${seoConfig.siteUrl}/tattoo-artist-${locationSlug}`,
      },
    ],
  };
}
