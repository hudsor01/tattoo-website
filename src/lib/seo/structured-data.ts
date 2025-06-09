/**
 * Enterprise-grade structured data for maximum SEO visibility
 * Implements schema.org standards for tattoo business
 */

export interface LocalBusinessStructuredData {
  "@context": "https://schema.org";
  "@type": "TattooShop" | "LocalBusiness";
  name: string;
  image: string[];
  "@id": string;
  url: string;
  telephone: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  sameAs: string[];
  priceRange: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    "@type": "Review";
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
    };
    author: {
      "@type": "Person";
      name: string;
    };
    reviewBody: string;
    datePublished: string;
  }>;
  hasOfferCatalog?: {
    "@type": "OfferCatalog";
    name: string;
    itemListElement: Array<{
      "@type": "Offer";
      itemOffered: {
        "@type": "Service";
        name: string;
        description: string;
        provider: {
          "@type": "LocalBusiness";
          name: string;
        };
      };
    }>;
  };
}

export interface ServiceStructuredData {
  "@context": "https://schema.org";
  "@type": "Service";
  name: string;
  description: string;
  provider: {
    "@type": "LocalBusiness";
    name: string;
    url: string;
  };
  areaServed: Array<{
    "@type": "City";
    name: string;
  }>;
  hasOfferCatalog: {
    "@type": "OfferCatalog";
    name: string;
    itemListElement: Array<{
      "@type": "Offer";
      itemOffered: {
        "@type": "Service";
        name: string;
      };
    }>;
  };
}

export interface CreativeWorkStructuredData {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  description: string;
  image: string;
  creator: {
    "@type": "Person";
    name: string;
    jobTitle: string;
    worksFor: {
      "@type": "LocalBusiness";
      name: string;
    };
  };
  genre: string;
  keywords: string[];
  dateCreated: string;
  thumbnail: string;
}

export interface FAQStructuredData {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface BreadcrumbStructuredData {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface WebsiteStructuredData {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

/**
 * Generate comprehensive local business structured data
 */
export function generateLocalBusinessStructuredData(): LocalBusinessStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "TattooShop",
    name: "Ink 37 Tattoos",
    image: [
      "https://ink37tattoos.com/images/japanese.jpg",
      "https://ink37tattoos.com/images/traditional.jpg", 
      "https://ink37tattoos.com/images/realism.jpg",
      "https://ink37tattoos.com/logo.png"
    ],
    "@id": "https://ink37tattoos.com",
    url: "https://ink37tattoos.com",
    telephone: "+1-817-297-3700",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Main Street", // Update with actual address
      addressLocality: "Crowley",
      addressRegion: "TX",
      postalCode: "76036",
      addressCountry: "US"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.579166,
      longitude: -97.362500
    },
    openingHours: [
      "Mo-Fr 10:00-18:00",
      "Sa 10:00-16:00"
    ],
    sameAs: [
      "https://www.instagram.com/ink37tattoos",
      "https://www.facebook.com/ink37tattoos"
    ],
    priceRange: "$$",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tattoo Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Tattoo Design",
            description: "Original custom tattoo artwork designed specifically for each client",
            provider: {
              "@type": "LocalBusiness",
              name: "Ink 37 Tattoos"
            }
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cover-up Tattoos",
            description: "Expert cover-up tattoo services to transform existing tattoos",
            provider: {
              "@type": "LocalBusiness",
              name: "Ink 37 Tattoos"
            }
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Traditional Tattoos",
            description: "Classic American traditional style tattoos",
            provider: {
              "@type": "LocalBusiness",
              name: "Ink 37 Tattoos"
            }
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Realistic Tattoos",
            description: "Photorealistic tattoo artwork with exceptional detail",
            provider: {
              "@type": "LocalBusiness",
              name: "Ink 37 Tattoos"
            }
          }
        }
      ]
    }
  };
}

/**
 * Generate gallery item structured data
 */
export function generateGalleryItemStructuredData(item: {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  designType: string;
  artistName: string;
  createdAt: Date;
}): CreativeWorkStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.name,
    description: item.description ?? `${item.designType} tattoo artwork by ${item.artistName}`,
    image: item.fileUrl,
    creator: {
      "@type": "Person",
      name: item.artistName,
      jobTitle: "Tattoo Artist",
      worksFor: {
        "@type": "LocalBusiness",
        name: "Ink 37 Tattoos"
      }
    },
    genre: item.designType,
    keywords: [
      "tattoo",
      item.designType,
      "custom tattoo",
      "body art",
      "Crowley tattoo",
      "DFW tattoo"
    ],
    dateCreated: item.createdAt.toISOString(),
    thumbnail: item.thumbnailUrl ?? item.fileUrl
  };
}

/**
 * Generate FAQ page structured data
 */
export function generateFAQStructuredData(): FAQStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much do tattoos cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tattoo pricing varies based on size, complexity, and placement. We offer free consultations to provide accurate quotes. Small tattoos start around $100, while larger custom pieces are quoted individually."
        }
      },
      {
        "@type": "Question", 
        name: "How long does the tattoo process take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Small tattoos typically take 1-3 hours, while larger pieces may require multiple sessions. During your consultation, we'll provide a time estimate based on your specific design."
        }
      },
      {
        "@type": "Question",
        name: "Do you offer free consultations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We provide free 30-60 minute consultations to discuss your tattoo ideas, placement, sizing, and pricing. Book online or call to schedule."
        }
      },
      {
        "@type": "Question",
        name: "What tattoo styles do you specialize in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We specialize in traditional, realistic, Japanese, fine-line, black & grey, and color tattoos. We also excel at cover-ups and custom designs tailored to each client."
        }
      },
      {
        "@type": "Question",
        name: "What areas do you serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Located in Crowley, Texas, we serve the entire DFW metroplex including Fort Worth, Arlington, Burleson, Mansfield, and surrounding areas."
        }
      }
    ]
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): BreadcrumbStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };
}

/**
 * Generate website search structured data
 */
export function generateWebsiteStructuredData(): WebsiteStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ink 37 Tattoos",
    url: "https://ink37tattoos.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://ink37tattoos.com/gallery?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}