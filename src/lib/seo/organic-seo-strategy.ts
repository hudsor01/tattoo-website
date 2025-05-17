// SEO and Performance Optimization Strategy

// 1. Core SEO Configuration
export const seoConfig = {
  // Local Business Schema
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "TattooShop",
    name: "Fernando Govea Tattoo Studio",
    description: "Professional tattoo artist specializing in custom designs, traditional, and fine line tattoos",
    url: "https://fernandogoveatatoo.com",
    telephone: "+1-XXX-XXX-XXXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address",
      addressLocality: "Your City",
      addressRegion: "TX",
      postalCode: "XXXXX",
      addressCountry: "US"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "XX.XXXXXX",
      longitude: "-XX.XXXXXX"
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "18:00"
      }
    ],
    priceRange: "$$",
    image: "https://fernandogoveatatoo.com/images/studio-front.jpg",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127"
    }
  },
  
  // Meta Tags Strategy
  defaultMeta: {
    title: {
      template: '%s | Fernando Govea Tattoo',
      default: 'Fernando Govea Tattoo - Custom Tattoo Artist in [City]'
    },
    description: 'Award-winning tattoo artist specializing in custom designs, traditional, and fine line tattoos. Book your consultation today.',
    keywords: [
      'tattoo artist',
      'custom tattoos',
      'tattoo studio',
      'traditional tattoos',
      'fine line tattoos',
      'tattoo shop near me',
      'best tattoo artist [city]'
    ],
    authors: [{ name: 'Fernando Govea' }],
    creator: 'Fernando Govea',
    publisher: 'Fernando Govea Tattoo Studio',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://fernandogoveatatoo.com',
      siteName: 'Fernando Govea Tattoo',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Fernando Govea Tattoo Studio'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@fernandotattoo',
      creator: '@fernandotattoo'
    }
  }
};

// 2. Page-Specific SEO Strategies
export const pageSEO = {
  home: {
    title: 'Fernando Govea Tattoo - Award-Winning Custom Tattoo Artist',
    description: 'Professional tattoo studio offering custom designs, traditional, and fine line tattoos. Book your consultation with Fernando Govea today.',
    keywords: 'tattoo artist, custom tattoos, tattoo studio, professional tattoos'
  },
  
  gallery: {
    title: 'Tattoo Gallery - Portfolio | Fernando Govea',
    description: 'Browse our extensive portfolio of custom tattoos including traditional, fine line, black and grey, and colored designs.',
    keywords: 'tattoo portfolio, tattoo gallery, custom tattoo designs, tattoo examples'
  },
  
  services: {
    title: 'Tattoo Services & Styles | Fernando Govea',
    description: 'Specializing in custom designs, traditional tattoos, fine line work, cover-ups, and restoration. View our services and pricing.',
    keywords: 'tattoo services, tattoo styles, tattoo pricing, custom tattoo design'
  },
  
  booking: {
    title: 'Book a Tattoo Consultation | Fernando Govea',
    description: 'Schedule your tattoo consultation online. We offer free consultations for all custom tattoo projects.',
    keywords: 'book tattoo appointment, tattoo consultation, tattoo booking'
  },
  
  contact: {
    title: 'Contact Fernando Govea Tattoo Studio',
    description: 'Get in touch for tattoo inquiries, consultations, or general questions. Located in [City], serving [Region].',
    keywords: 'contact tattoo artist, tattoo studio location, tattoo shop hours'
  }
};

// 3. Performance Optimization Strategies
export const performanceOptimization = {
  images: {
    // Use Next.js Image component with these settings
    quality: 85,
    formats: ['webp', 'avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Lazy loading strategy
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    
    // Priority images (above the fold)
    priorityImages: [
      '/hero-tattoo.jpg',
      '/fernando-artist.jpg'
    ]
  },
  
  // Code splitting strategies
  dynamicImports: {
    gallery: () => import('@/app/gallery/page'),
    booking: () => import('@/components/booking/BookingForm'),
    heavyComponents: [
      'ImageCarousel',
      'GalleryModal',
      'BookingCalendar'
    ]
  },
  
  // Resource hints
  resourceHints: {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://www.googletagmanager.com'
    ],
    dnsPrefetch: [
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com'
    ]
  }
};

// 4. Content SEO Strategies
export const contentStrategy = {
  // Blog post ideas for organic traffic
  blogTopics: [
    'Tattoo aftercare guide',
    'How to prepare for your first tattoo',
    'Tattoo style guide: Traditional vs Modern',
    'The history of [local] tattoo culture',
    'Tattoo pain chart: What to expect',
    'How to choose the right tattoo design',
    'Tattoo cover-up process explained',
    'Seasonal tattoo care tips'
  ],
  
  // Local SEO content
  localContent: {
    cityPages: [
      'Tattoo Artist in [City]',
      'Best Tattoo Shop in [Neighborhood]',
      'Custom Tattoos [City] TX'
    ],
    
    nearbyAreas: [
      'Serving [City], [Suburb1], [Suburb2]',
      'Tattoo studio near [Landmark]'
    ]
  },
  
  // Gallery SEO
  galleryOptimization: {
    imageAltTags: {
      pattern: '[style] tattoo by Fernando Govea - [description]',
      examples: [
        'Traditional rose tattoo by Fernando Govea - colorful floral sleeve',
        'Fine line geometric tattoo by Fernando Govea - minimalist arm design'
      ]
    },
    
    categoryPages: [
      'Traditional Tattoos',
      'Fine Line Tattoos',
      'Black and Grey Tattoos',
      'Cover-up Tattoos',
      'Small Tattoos',
      'Sleeve Tattoos'
    ]
  }
};

// 5. Link Building Strategies
export const linkBuildingStrategy = {
  // Local directories
  localDirectories: [
    'Google My Business',
    'Yelp',
    'Facebook Business',
    'Instagram Business',
    'TripAdvisor',
    'Local Chamber of Commerce',
    'Tattoo Directory Sites'
  ],
  
  // Partnership opportunities
  partnerships: [
    'Local art galleries',
    'Music venues',
    'Barbershops',
    'Fashion boutiques',
    'Fitness studios'
  ],
  
  // Content partnerships
  guestPosts: [
    'Local lifestyle blogs',
    'Art and culture magazines',
    'Fashion blogs',
    'Men\'s lifestyle sites'
  ]
};

// 6. User Experience Signals
export const uxOptimization = {
  // Core Web Vitals targets
  coreWebVitals: {
    LCP: 2.5, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1  // Cumulative Layout Shift
  },
  
  // Mobile optimization
  mobile: {
    touchTargets: '48px minimum',
    fontSize: '16px minimum',
    viewport: 'responsive',
    scrolling: 'smooth'
  },
  
  // Accessibility
  accessibility: {
    altTags: 'all images',
    ariaLabels: 'interactive elements',
    colorContrast: 'WCAG AA',
    keyboardNavigation: 'full support'
  }
};

// 7. Analytics and Monitoring
export const analyticsSetup = {
  // Essential tracking
  googleAnalytics: {
    events: [
      'booking_started',
      'booking_completed',
      'gallery_view',
      'contact_form_submission',
      'phone_click',
      'direction_click'
    ],
    
    goals: [
      'Booking completion',
      'Contact form submission',
      'Phone call',
      'Gallery engagement'
    ]
  },
  
  // Search Console setup
  searchConsole: {
    sitemaps: [
      '/sitemap.xml',
      '/sitemap-gallery.xml',
      '/sitemap-blog.xml'
    ],
    
    monitoring: [
      'Search performance',
      'Index coverage',
      'Core Web Vitals',
      'Mobile usability'
    ]
  }
};

// Implementation function
export function implementSEOStrategy() {
  return {
    immediate: [
      'Add local business schema',
      'Optimize meta tags',
      'Submit sitemaps',
      'Set up Google My Business'
    ],
    
    shortTerm: [
      'Create location pages',
      'Optimize images',
      'Implement lazy loading',
      'Add blog section'
    ],
    
    longTerm: [
      'Build local partnerships',
      'Create content calendar',
      'Guest posting campaign',
      'Video content strategy'
    ]
  };
}