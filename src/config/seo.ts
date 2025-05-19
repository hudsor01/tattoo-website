// SEO Configuration for Next.js Metadata API

const siteName = 'Fernando Govea Tattoo';
const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://ink37tattoos.com';
const siteDescription = 'Award-winning tattoo artist specializing in custom designs, traditional, and fine line tattoos. Book your consultation today in Austin, TX.';

// Default metadata template for all pages
export const defaultMetadata = {
  title: {
    default: 'Fernando Govea Tattoo - Custom Tattoo Artist in Austin',
    template: '%s | Fernando Govea Tattoo',
  },
  description: siteDescription,
  keywords: 'tattoo artist, custom tattoos, tattoo studio, traditional tattoos, fine line tattoos, tattoo shop Austin, best tattoo artist Texas',
  authors: [{ name: 'Fernando Govea' }],
  creator: 'Fernando Govea',
  publisher: 'Fernando Govea Tattoo',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: 'Fernando Govea Tattoo',
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Fernando Govea Tattoo Studio',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fernando Govea Tattoo - Custom Tattoo Artist',  
    description: siteDescription,
    creator: '@fernandotattoo',
    images: [`${siteUrl}/og-image.jpg`],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'Custom Tattoo Artist in Dallas/Fort Worth',
    description: 'Professional tattoo studio offering custom designs, traditional, and fine line tattoos. Book your consultation with Fernando Govea today.',
    openGraph: {
      title: 'Fernando Govea Tattoo - Award-Winning Custom Tattoo Artist',
      description: 'Professional tattoo studio in Dallas/Fort Worth, TX. Specializing in custom designs, traditional, and fine line tattoos.',
    },
  },
  gallery: {
    title: 'Tattoo Gallery - Portfolio',
    description: 'Browse our extensive portfolio of custom tattoos including traditional, fine line, black and grey, and colored designs by Fernando Govea.',
    openGraph: {
      title: 'Tattoo Gallery - Fernando Govea Portfolio',
      description: 'Explore our tattoo portfolio featuring custom designs, traditional, fine line, and unique artwork.',
      images: [
        {
          url: `${siteUrl}/gallery-og.jpg`,
          width: 1200,
          height: 630,
          alt: 'Fernando Govea Tattoo Gallery',
        }
      ],
    },
  },
  services: {
    title: 'Tattoo Services & Styles',
    description: 'Specializing in custom designs, traditional tattoos, fine line work, cover-ups, and restoration. View our services and pricing.',
    openGraph: {
      title: 'Tattoo Services - Fernando Govea',
      description: 'Professional tattoo services including custom designs, traditional, fine line, cover-ups, and restoration.',
    },
  },
  booking: {
    title: 'Book a Tattoo Consultation',
    description: 'Schedule your tattoo consultation online. We offer free consultations for all custom tattoo projects in Austin, TX.',
    openGraph: {
      title: 'Book Your Tattoo Consultation - Fernando Govea',
      description: 'Schedule your free tattoo consultation online. Custom designs, professional service, Austin TX.',
    },
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch for tattoo inquiries, consultations, or general questions. Located in Austin, serving Central Texas.',
    openGraph: {
      title: 'Contact Fernando Govea Tattoo Studio',
      description: 'Contact us for tattoo inquiries and consultations. Located in Austin, TX.',
    },
  },
  about: {
    title: 'About Fernando Govea',
    description: 'Award-winning tattoo artist with over 10 years of experience. Learn about Fernando\'s journey and artistic philosophy.',
    openGraph: {
      title: 'About Fernando Govea - Professional Tattoo Artist',
      description: 'Meet Fernando Govea, award-winning tattoo artist with over 10 years of experience in custom tattoo design.',
    },
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about tattoo care, booking process, pricing, and what to expect during your tattoo session.',
    openGraph: {
      title: 'Tattoo FAQ - Fernando Govea',
      description: 'Common questions about tattoo care, booking, pricing, and the tattoo process answered.',
    },
  },
};

// Structured data configurations
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'TattooShop',
    name: 'Fernando Govea Tattoo Studio',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://www.instagram.com/fernandogoveatatattoo',
      'https://www.facebook.com/fernandogoveatatattoo',
      'https://www.yelp.com/biz/fernando-govea-tattoo',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'Fort Worth',
      addressRegion: 'TX',
      postalCode: '76102',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.7555,
      longitude: -97.3327,
    },
    telephone: '+1-512-XXX-XXXX',
    email: 'info@fernandogoveatatoo.com',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
  },
  breadcrumb: (items: { name: string; item: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  }),
  faqPage: (questions: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }),
  service: (service: { name: string; description: string; price?: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Tattoo Service',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Fernando Govea Tattoo Studio',
    },
    name: service.name,
    description: service.description,
    offers: service.price ? {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'USD',
    } : undefined,
    areaServed: {
      '@type': 'City', 
      name: 'Dallas/Fort Worth',
    },
  }),
  imageObject: (image: { url: string; caption: string; width?: number; height?: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: image.url,
    caption: image.caption,
    width: image.width,
    height: image.height,
    creator: {
      '@type': 'Person',
      name: 'Fernando Govea',
    },
  }),
};