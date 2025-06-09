/**
 * Local SEO Optimization for Crowley/DFW Area
 * Comprehensive local search optimization strategies
 */

export interface LocalSEOConfig {
  primaryLocation: {
    city: string;
    state: string;
    region: string;
    zipCode: string;
    county: string;
  };
  serviceAreas: Array<{
    city: string;
    state: string;
    zipCode?: string;
    distance?: number; // miles from primary location
    priority: 'primary' | 'secondary' | 'tertiary';
  }>;
  localKeywords: {
    primary: string[];
    serviceSpecific: string[];
    locationSpecific: string[];
    longTail: string[];
  };
  competitors: Array<{
    name: string;
    city: string;
    strengths: string[];
    weaknesses: string[];
  }>;
}

export const localSEOConfig: LocalSEOConfig = {
  primaryLocation: {
    city: 'Crowley',
    state: 'Texas',
    region: 'DFW Metroplex',
    zipCode: '76036',
    county: 'Tarrant County'
  },
  serviceAreas: [
    { city: 'Crowley', state: 'TX', zipCode: '76036', distance: 0, priority: 'primary' },
    { city: 'Fort Worth', state: 'TX', distance: 15, priority: 'primary' },
    { city: 'Burleson', state: 'TX', distance: 8, priority: 'primary' },
    { city: 'Arlington', state: 'TX', distance: 20, priority: 'secondary' },
    { city: 'Mansfield', state: 'TX', distance: 12, priority: 'secondary' },
    { city: 'Grand Prairie', state: 'TX', distance: 25, priority: 'secondary' },
    { city: 'Forest Hill', state: 'TX', distance: 10, priority: 'secondary' },
    { city: 'Kennedale', state: 'TX', distance: 6, priority: 'secondary' },
    { city: 'Everman', state: 'TX', distance: 7, priority: 'secondary' },
    { city: 'White Settlement', state: 'TX', distance: 18, priority: 'tertiary' },
    { city: 'Dallas', state: 'TX', distance: 35, priority: 'tertiary' },
    { city: 'Irving', state: 'TX', distance: 30, priority: 'tertiary' }
  ],
  localKeywords: {
    primary: [
      'tattoo artist Crowley TX',
      'Crowley tattoo shop',
      'tattoo Crowley Texas',
      'DFW tattoo artist',
      'Fort Worth tattoo artist',
      'Tarrant County tattoo'
    ],
    serviceSpecific: [
      'custom tattoo Crowley',
      'traditional tattoo DFW',
      'Japanese tattoo Texas',
      'cover up tattoo Crowley',
      'realistic tattoo Fort Worth',
      'fine line tattoo DFW'
    ],
    locationSpecific: [
      'tattoo near Burleson TX',
      'tattoo near Mansfield TX',
      'tattoo near Arlington TX',
      'Crowley body art',
      'DFW tattoo consultation',
      'South Fort Worth tattoo'
    ],
    longTail: [
      'best tattoo artist in Crowley Texas',
      'custom tattoo design Crowley TX',
      'professional tattoo artist near me',
      'where to get tattoo in Crowley',
      'tattoo shop near Burleson Texas',
      'Fernando Govea tattoo artist',
      'Ink 37 Tattoos reviews',
      'tattoo consultation Crowley TX'
    ]
  },
  competitors: [
    {
      name: 'Local Tattoo Shops Fort Worth',
      city: 'Fort Worth',
      strengths: ['Established presence', 'Multiple artists'],
      weaknesses: ['Generic designs', 'Higher prices']
    },
    {
      name: 'Chain Tattoo Shops',
      city: 'Arlington',
      strengths: ['Brand recognition', 'Multiple locations'],
      weaknesses: ['Less personalized', 'Corporate feel']
    }
  ]
};

/**
 * Generate location-specific page content
 */
export function generateLocationContent(city: string) {
  const serviceArea = localSEOConfig.serviceAreas.find(area => 
    area.city.toLowerCase() === city.toLowerCase()
  );
  
  if (!serviceArea) return null;

  return {
    title: `Professional Tattoo Artist Serving ${city}, TX | Ink 37 Tattoos`,
    description: `Expert tattoo services for ${city}, Texas residents. Custom designs, traditional work, and cover-ups by Fernando Govea. Serving ${city} and surrounding DFW areas.`,
    h1: `Tattoo Artist Serving ${city}, Texas`,
    content: {
      intro: `Located in nearby Crowley, Ink 37 Tattoos proudly serves ${city}, Texas and the surrounding DFW metroplex with professional tattoo services.`,
      services: `Whether you're in ${city} looking for custom tattoo designs, traditional work, Japanese art, or expert cover-ups, Fernando Govea brings years of experience to every piece.`,
      convenience: serviceArea.distance ? `Just ${serviceArea.distance} miles from ${city}, our Crowley location is easily accessible for all your tattoo needs.` : 'Conveniently located in Crowley for easy access.',
      consultation: `Schedule your free consultation today and discover why ${city} residents choose Ink 37 Tattoos for their body art needs.`
    },
    keywords: [
      `tattoo artist ${city} TX`,
      `${city} tattoo services`,
      `tattoo near ${city} Texas`,
      `custom tattoo ${city}`,
      `professional tattoo artist near ${city}`
    ]
  };
}

/**
 * Generate service-specific local content
 */
export function generateServiceLocationContent(service: string, city: string) {
  const serviceNames: Record<string, string> = {
    'custom': 'Custom Tattoo Design',
    'traditional': 'Traditional Tattoos',
    'japanese': 'Japanese Tattoos',
    'realistic': 'Realistic Tattoos',
    'coverup': 'Cover-up Tattoos',
    'fineline': 'Fine Line Tattoos'
  };

  const serviceName = serviceNames[service] ?? service;

  return {
    title: `${serviceName} ${city} TX | Expert Tattoo Artist | Ink 37`,
    description: `Professional ${serviceName.toLowerCase()} services for ${city}, Texas. Expert tattoo artist Fernando Govea specializing in ${serviceName.toLowerCase()} near ${city}.`,
    h1: `${serviceName} Artist Serving ${city}, Texas`,
    content: {
      intro: `Looking for expert ${serviceName.toLowerCase()} in ${city}, Texas? Ink 37 Tattoos specializes in ${serviceName.toLowerCase()} for clients throughout the DFW area.`,
      expertise: `Fernando Govea brings exceptional skill in ${serviceName.toLowerCase()}, creating stunning pieces for ${city} residents and beyond.`,
      portfolio: `View our ${serviceName.toLowerCase()} portfolio to see examples of work done for clients from ${city} and surrounding areas.`,
      booking: `Ready to get your ${serviceName.toLowerCase()}? Contact us to schedule your consultation and join satisfied clients from ${city}, Texas.`
    }
  };
}

/**
 * Generate local business schema for service areas
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TattooShop",
    "name": "Ink 37 Tattoos",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": localSEOConfig.primaryLocation.city,
      "addressRegion": localSEOConfig.primaryLocation.state,
      "postalCode": localSEOConfig.primaryLocation.zipCode,
      "addressCountry": "US"
    },
    "areaServed": localSEOConfig.serviceAreas.map(area => ({
      "@type": "City",
      "name": `${area.city}, ${area.state}`,
      "containedInPlace": {
        "@type": "State",
        "name": "Texas"
      }
    })),
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 32.579166,
      "longitude": -97.362500
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 32.579166,
        "longitude": -97.362500
      },
      "geoRadius": "25 miles"
    }
  };
}

/**
 * Get local SEO optimization checklist
 */
export function getLocalSEOChecklist() {
  return {
    onPage: [
      'Include city/region in title tags',
      'Add local keywords to meta descriptions',
      'Create location-specific landing pages',
      'Include address and phone in footer',
      'Add local business schema markup',
      'Optimize for "near me" searches',
      'Include service area pages',
      'Add local testimonials and reviews'
    ],
    offPage: [
      'Claim and optimize Google Business Profile',
      'Get listed in local directories',
      'Build local citations (NAP consistency)',
      'Encourage Google reviews',
      'Partner with local businesses',
      'Sponsor local events',
      'Create local content and blog posts',
      'Build local backlinks'
    ],
    technical: [
      'Ensure mobile-friendly design',
      'Optimize page loading speed',
      'Add location-based structured data',
      'Implement local business schema',
      'Create XML sitemap with local pages',
      'Set up Google Search Console',
      'Monitor local search rankings',
      'Track local organic traffic'
    ],
    content: [
      'Write location-specific blog posts',
      'Create service + location landing pages',
      'Add local landmarks and references',
      'Include local event mentions',
      'Create area-specific galleries',
      'Add local artist background info',
      'Include community involvement',
      'Feature local client stories'
    ]
  };
}

/**
 * Generate local keyword suggestions
 */
export function generateLocalKeywords() {
  const serviceTypes = ['custom', 'traditional', 'japanese', 'realistic', 'cover-up', 'fine-line'];
  const locations = localSEOConfig.serviceAreas.map(area => area.city);
  const modifiers = ['best', 'professional', 'experienced', 'expert', 'top', 'affordable'];
  const terms = ['tattoo artist', 'tattoo shop', 'tattoo studio', 'body art'];

  const keywords: string[] = [];

  // Service + Location combinations
  serviceTypes.forEach(service => {
    locations.forEach(location => {
      keywords.push(`${service} tattoo ${location} TX`);
      keywords.push(`${service} tattoo artist ${location}`);
    });
  });

  // Modifier + Term + Location combinations
  modifiers.forEach(modifier => {
    terms.forEach(term => {
      locations.forEach(location => {
        keywords.push(`${modifier} ${term} ${location} TX`);
        if (location !== 'Crowley') {
          keywords.push(`${modifier} ${term} near ${location}`);
        }
      });
    });
  });

  // Long-tail local keywords
  locations.forEach(location => {
    keywords.push(`where to get tattoo in ${location} Texas`);
    keywords.push(`tattoo consultation ${location} TX`);
    keywords.push(`tattoo appointment ${location}`);
  });

  return keywords;
}

/**
 * Generate local content calendar
 */
export function generateLocalContentCalendar() {
  return {
    monthly: [
      'Feature local client spotlight',
      'Highlight service area community events',
      'Create seasonal tattoo trends content',
      'Share local business partnerships'
    ],
    quarterly: [
      'Update service area pages',
      'Refresh local SEO keywords',
      'Audit local citations',
      'Review competitor analysis'
    ],
    annually: [
      'Complete local SEO audit',
      'Update Google Business Profile',
      'Refresh all location content',
      'Plan local marketing campaigns'
    ],
    eventBased: [
      'Local festivals and events coverage',
      'Community involvement posts',
      'Local sports team references',
      'Regional holiday content'
    ]
  };
}