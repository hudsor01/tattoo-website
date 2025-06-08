import Script from 'next/script';

interface BusinessInfo {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  phone: string;
  email: string;
  url: string;
  image: string;
  openingHours: string[];
  priceRange: string;
  services: string[];
  areaServed: string[];
}

const businessInfo: BusinessInfo = {
  name: 'Ink 37 Tattoos',
  description:
    'Professional custom tattoo artist specializing in traditional, realism, fine line, and cover-up tattoos in Dallas Fort Worth area.',
  address: {
    streetAddress: '123 Main St',
    addressLocality: 'Dallas',
    addressRegion: 'TX',
    postalCode: '75201',
    addressCountry: 'US',
  },
  phone: '',
  email: 'hello@ink37tattoos.com',
  url: 'https://ink37tattoos.com',
  image: 'https://ink37tattoos.com/images/shop-front.jpg',
  openingHours: ['Mo-Fr 10:00-19:00', 'Sa 10:00-18:00', 'Su 12:00-17:00'],
  priceRange: '$$$',
  services: [
    'Custom Tattoo Design',
    'Traditional Tattoo',
    'Realism Tattoo',
    'Fine Line Tattoo',
    'Cover Up Tattoo',
    'Japanese Tattoo',
    'Portrait Tattoo',
    'Tattoo Consultation',
  ],
  areaServed: [
    'Dallas, TX',
    'Fort Worth, TX',
    'Austin, TX',
    'Arlington, TX',
    'Plano, TX',
    'Irving, TX',
  ],
};

export function LocalBusinessStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TattooShop',
    name: businessInfo.name,
    description: businessInfo.description,
    image: businessInfo.image,
    telephone: businessInfo.phone,
    email: businessInfo.email,
    url: businessInfo.url,
    priceRange: businessInfo.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address.streetAddress,
      addressLocality: businessInfo.address.addressLocality,
      addressRegion: businessInfo.address.addressRegion,
      postalCode: businessInfo.address.postalCode,
      addressCountry: businessInfo.address.addressCountry,
    },
    openingHoursSpecification: businessInfo.openingHours.map((hours) => {
      const parts = hours.split(' ');
      const timeParts = parts[1]?.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: parts[0],
        opens: timeParts?.[0] ?? '10:00',
        closes: timeParts?.[1] ?? '18:00',
      };
    }),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tattoo Services',
      itemListElement: businessInfo.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
          description: `Professional ${service.toLowerCase()} services in Dallas Fort Worth area`,
        },
      })),
    },
    areaServed: businessInfo.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: ['https://instagram.com/ink37tattoos', 'https://facebook.com/ink37tattoos'],
  };

  return (
    <Script
      id="local-business-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export function ArtistStructuredData() {
  const artistData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Fernando Govea',
    jobTitle: 'Professional Tattoo Artist',
    description:
      'Experienced tattoo artist specializing in custom designs, traditional, realism, and fine line tattoos in Dallas Fort Worth area.',
    image: 'https://ink37tattoos.com/images/fernando-profile.jpg',
    worksFor: {
      '@type': 'TattooShop',
      name: businessInfo.name,
      url: businessInfo.url,
    },
    knowsAbout: [
      'Traditional Tattoo',
      'Realism Tattoo',
      'Fine Line Tattoo',
      'Japanese Tattoo',
      'Cover Up Tattoo',
      'Custom Tattoo Design',
      'Portrait Tattoo',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Tattoo Artist',
      description: 'Professional tattoo artist creating custom artwork and tattoos',
      skills: 'Traditional tattoo, Realism, Fine line, Japanese style, Cover-ups',
      occupationLocation: {
        '@type': 'City',
        name: 'Dallas Fort Worth, Texas',
      },
    },
  };

  return (
    <Script
      id="artist-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(artistData),
      }}
    />
  );
}

export function GalleryStructuredData({
  images,
}: {
  images: Array<{ id: string; name: string; category: string; imageUrl: string }>;
}) {
  const galleryData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Ink37 Tattoo Gallery',
    description:
      'Professional tattoo artwork gallery featuring custom designs, traditional, realism, and fine line tattoos by Fernando Govea',
    author: {
      '@type': 'Person',
      name: 'Fernando Govea',
      jobTitle: 'Professional Tattoo Artist',
    },
    associatedMedia: images.map((image) => ({
      '@type': 'ImageObject',
      name: image.name,
      description: `${image.category} tattoo artwork by Fernando Govea - Professional tattoo design`,
      contentUrl: image.imageUrl,
      creator: {
        '@type': 'Person',
        name: 'Fernando Govea',
      },
      copyrightHolder: {
        '@type': 'Organization',
        name: businessInfo.name,
      },
      keywords: `${image.category.toLowerCase()}, tattoo, custom design, professional tattoo art, Dallas tattoo artist`,
    })),
  };

  return (
    <Script
      id="gallery-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(galleryData),
      }}
    />
  );
}

export function ServicePageStructuredData({
  serviceName,
  description,
}: {
  serviceName: string;
  description: string;
}) {
  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'TattooShop',
      name: businessInfo.name,
      url: businessInfo.url,
      address: businessInfo.address,
    },
    areaServed: businessInfo.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    offers: {
      '@type': 'Offer',
      description: `Professional ${serviceName.toLowerCase()} services`,
      priceRange: businessInfo.priceRange,
      availability: 'https://schema.org/InStock',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: serviceName,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: serviceName,
            description: description,
          },
        },
      ],
    },
  };

  return (
    <Script
      id="service-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(serviceData),
      }}
    />
  );
}
