/**
 * Google Business Profile Integration
 * Utilities for Google My Business optimization and local SEO
 */

export interface GoogleBusinessConfig {
  businessName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  website: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    closed?: boolean;
  }>;
  categories: string[];
  description: string;
  services: string[];
  paymentMethods: string[];
  languages: string[];
}

export const googleBusinessConfig: GoogleBusinessConfig = {
  businessName: "Ink 37 Tattoos",
  address: {
    street: "123 Main Street", // Update with actual address
    city: "Crowley",
    state: "TX",
    zipCode: "76036",
    country: "US"
  },
  phone: "+1-817-297-3700",
  website: "https://ink37tattoos.com",
  coordinates: {
    lat: 32.579166,
    lng: -97.362500
  },
  businessHours: [
    { day: "Monday", open: "10:00", close: "18:00" },
    { day: "Tuesday", open: "10:00", close: "18:00" },
    { day: "Wednesday", open: "10:00", close: "18:00" },
    { day: "Thursday", open: "10:00", close: "18:00" },
    { day: "Friday", open: "10:00", close: "18:00" },
    { day: "Saturday", open: "10:00", close: "16:00" },
    { day: "Sunday", closed: true }
  ],
  categories: [
    "Tattoo Shop",
    "Artist",
    "Body Art",
    "Custom Tattoo Designer"
  ],
  description: "Professional tattoo artist in Crowley, Texas specializing in custom designs, traditional tattoos, Japanese art, realistic portraits, and cover-ups. Serving the Dallas-Fort Worth metroplex with exceptional tattoo artistry.",
  services: [
    "Custom Tattoo Design",
    "Traditional Tattoos",
    "Japanese Tattoos", 
    "Realistic Portrait Tattoos",
    "Fine Line Tattoos",
    "Cover-up Tattoos",
    "Black & Grey Tattoos",
    "Color Tattoos",
    "Sleeve Tattoos",
    "Small Tattoos",
    "Tattoo Consultation",
    "Tattoo Touch-ups"
  ],
  paymentMethods: [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Venmo",
    "CashApp"
  ],
  languages: ["English", "Spanish"]
};

/**
 * Generate Google My Business structured data
 */
export function generateGoogleBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "TattooShop",
    "name": googleBusinessConfig.businessName,
    "description": googleBusinessConfig.description,
    "url": googleBusinessConfig.website,
    "telephone": googleBusinessConfig.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": googleBusinessConfig.address.street,
      "addressLocality": googleBusinessConfig.address.city,
      "addressRegion": googleBusinessConfig.address.state,
      "postalCode": googleBusinessConfig.address.zipCode,
      "addressCountry": googleBusinessConfig.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": googleBusinessConfig.coordinates.lat,
      "longitude": googleBusinessConfig.coordinates.lng
    },
    "openingHoursSpecification": googleBusinessConfig.businessHours
      .filter(hour => !hour.closed)
      .map(hour => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": hour.day,
        "opens": hour.open,
        "closes": hour.close
      })),
    "paymentAccepted": googleBusinessConfig.paymentMethods,
    "currenciesAccepted": "USD",
    "priceRange": "$$",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tattoo Services",
      "itemListElement": googleBusinessConfig.services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "provider": {
            "@type": "LocalBusiness",
            "name": googleBusinessConfig.businessName
          }
        }
      }))
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Crowley, TX"
      },
      {
        "@type": "City", 
        "name": "Fort Worth, TX"
      },
      {
        "@type": "City",
        "name": "Dallas, TX"
      },
      {
        "@type": "City",
        "name": "Arlington, TX"
      },
      {
        "@type": "City",
        "name": "Burleson, TX"
      },
      {
        "@type": "City",
        "name": "Mansfield, TX"
      },
      {
        "@type": "City",
        "name": "Grand Prairie, TX"
      }
    ],
    "knowsLanguage": googleBusinessConfig.languages,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

/**
 * Generate local business citation data for directory submissions
 */
export function generateBusinessCitation() {
  return {
    name: googleBusinessConfig.businessName,
    address: `${googleBusinessConfig.address.street}, ${googleBusinessConfig.address.city}, ${googleBusinessConfig.address.state} ${googleBusinessConfig.address.zipCode}`,
    phone: googleBusinessConfig.phone,
    website: googleBusinessConfig.website,
    categories: googleBusinessConfig.categories.join(", "),
    description: googleBusinessConfig.description,
    keywords: [
      "tattoo shop Crowley TX",
      "custom tattoos DFW",
      "professional tattoo artist",
      "Fernando Govea tattoo",
      "Ink 37 Tattoos",
      "Dallas Fort Worth tattoo"
    ].join(", "),
    social: {
      instagram: "https://www.instagram.com/ink37tattoos",
      facebook: "https://www.facebook.com/ink37tattoos"
    }
  };
}

/**
 * Generate Google Business Profile optimization checklist
 */
export function getGoogleBusinessOptimizationTips() {
  return [
    "Complete all business information fields",
    "Add high-quality photos of work, shop interior, and exterior",
    "Encourage satisfied customers to leave Google reviews",
    "Post regular Google Business updates and promotions",
    "Respond to all customer reviews promptly",
    "Use Google Business messaging feature",
    "Add business hours and holiday schedules",
    "Verify business location with Google",
    "Use relevant business categories",
    "Add detailed business description with keywords",
    "Upload videos of tattoo process and finished work",
    "Create Google Business posts about new work and events",
    "Use Google Business Q&A feature proactively",
    "Monitor Google Business insights and metrics",
    "Ensure NAP (Name, Address, Phone) consistency across web"
  ];
}

/**
 * Local citation directories for tattoo business
 */
export const localCitationDirectories = [
  "Google My Business",
  "Yelp",
  "Facebook Business",
  "Yellow Pages",
  "Bing Places",
  "Apple Maps",
  "Foursquare",
  "TripAdvisor",
  "Better Business Bureau",
  "Angie's List",
  "Thumbtack",
  "Nextdoor Business",
  "Chamber of Commerce",
  "Local newspaper directories",
  "City business directories",
  "Industry-specific directories (tattoo finder sites)"
];

/**
 * Generate NAP (Name, Address, Phone) consistency data
 */
export function getNAPData() {
  return {
    name: googleBusinessConfig.businessName,
    address: `${googleBusinessConfig.address.street}, ${googleBusinessConfig.address.city}, ${googleBusinessConfig.address.state} ${googleBusinessConfig.address.zipCode}`,
    phone: googleBusinessConfig.phone,
    formatted: {
      singleLine: `${googleBusinessConfig.businessName}, ${googleBusinessConfig.address.street}, ${googleBusinessConfig.address.city}, ${googleBusinessConfig.address.state} ${googleBusinessConfig.address.zipCode}, ${googleBusinessConfig.phone}`,
      multiLine: [
        googleBusinessConfig.businessName,
        googleBusinessConfig.address.street,
        `${googleBusinessConfig.address.city}, ${googleBusinessConfig.address.state} ${googleBusinessConfig.address.zipCode}`,
        googleBusinessConfig.phone
      ]
    }
  };
}