import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';

// Force static generation with revalidation every 4 hours
export const dynamic = 'force-static';
export const revalidate = 14400;

export const metadata: Metadata = {
  title: 'Ink 37 | Custom Tattoos in Dallas/Fort Worth by Fernando Govea',
  description: 'Premier tattoo artist Fernando Govea in the Dallas/Fort Worth metroplex specializing in custom designs, traditional tattoos, and fine line work. Schedule your consultation today.',
  keywords: [
    'tattoo artist Dallas',
    'Fort Worth tattoo',
    'custom tattoos',
    'Fernando Govea',
    'Ink 37',
    'traditional tattoos',
    'fine line tattoos',
    'tattoo consultation',
    'Dallas tattoo studio'
  ],
  openGraph: {
    title: 'Ink 37 Tattoos | Custom Designs by Fernando Govea',
    description: 'Experience exceptional custom tattoo artistry in the Dallas/Fort Worth area. Specializing in traditional, fine line, and custom designs.',
    images: [{
      url: '/images/japanese.jpg',
      width: 1200,
      height: 630,
      alt: 'Custom tattoo artwork by Fernando Govea at Ink 37'
    }],
    url: 'https://ink37tattoos.com',
    type: 'website',
    siteName: 'Ink 37 Tattoos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ink 37 Tattoos | Custom Designs by Fernando Govea',
    description: 'Experience exceptional custom tattoo artistry in the Dallas/Fort Worth area.',
    images: ['/images/japanese.jpg'],
    creator: '@ink37tattoo',
  },
  alternates: {
    canonical: 'https://ink37tattoos.com',
  },
};

// Enhanced JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['TattooParlorService', 'LocalBusiness'],
  name: 'Ink 37',
  description: 'Custom tattoos in the Dallas/Fort Worth metroplex by Fernando Govea',
  image: 'https://ink37tattoos.com/images/japanese.jpg',
  url: 'https://ink37tattoos.com',
  telephone: 'Contact via website',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dallas/Fort Worth',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.7767,
    longitude: -96.7970,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '18:00',
  },
  sameAs: [
    'https://www.instagram.com/fennyg83/',
    'https://www.tiktok.com/fennyg83/',
  ],
  priceRange: '$',
  founder: {
    '@type': 'Person',
    name: 'Fernando Govea',
    jobTitle: 'Tattoo Artist',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tattoo Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom Tattoo Design',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Traditional Tattoos',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fine Line Tattoos',
        },
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}