/**
 * SEO Head Component
 * 
 * Comprehensive SEO component that adds structured data, JSON-LD,
 * and additional metadata for improved search engine visibility.
 */

import Script from 'next/script';
import { generateBusinessStructuredData } from '@/lib/seo/seo-config';

interface SEOHeadProps {
  structuredData?: Record<string, unknown>;
  includeLocalBusiness?: boolean;
  additionalJsonLd?: Record<string, unknown>[];
}

/**
 * SEO Head component for adding structured data and additional SEO elements
 */
export function SEOHead({ 
  structuredData, 
  includeLocalBusiness = true,
  additionalJsonLd = []
}: SEOHeadProps) {
  const localBusinessData = includeLocalBusiness ? generateBusinessStructuredData() : null;
  
  return (
    <>
      {/* Local Business Structured Data */}
      {localBusinessData && (
        <Script
          id="local-business-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessData),
          }}
        />
      )}
      
      {/* Page-specific Structured Data */}
      {structuredData && (
        <Script
          id="page-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      {/* Additional JSON-LD */}
      {additionalJsonLd.map((data, index) => {
        const uniqueKey = `additional-jsonld-${JSON.stringify(data).slice(0, 20)}-${Date.now()}-${index}`;
        return (
        <Script
          key={uniqueKey}
          id={`additional-structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
        );
      })}
    </>
  );
}

/**
 * Generate Article structured data for blog posts or informational pages
 */
export function generateArticleStructuredData({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ink 37 Tattoos',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ink37tattoos.com/logo.png',
      },
    },
    datePublished,
    dateModified: dateModified ?? datePublished,
    image: image ? {
      '@type': 'ImageObject',
      url: image,
    } : undefined,
    url,
  };
}

/**
 * Generate FAQ structured data for FAQ pages
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Service structured data for service pages
 */
export function generateServiceStructuredData({
  serviceName,
  description,
  serviceType,
  provider,
  areaServed,
}: {
  serviceName: string;
  description: string;
  serviceType?: string;
  provider: string;
  areaServed: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description,
    serviceType,
    provider: {
      '@type': 'TattooShop',
      name: provider,
    },
    areaServed: areaServed.map(area => ({
      '@type': 'City',
      name: area,
    })),
    offers: {
      '@type': 'Offer',
      description: `Professional ${serviceName.toLowerCase()} services`,
      availability: 'https://schema.org/InStock',
    },
  };
}

/**
 * Generate ImageGallery structured data for gallery pages
 */
export function generateGalleryStructuredData({
  name,
  description,
  images,
}: {
  name: string;
  description: string;
  images: Array<{
    url: string;
    caption?: string;
    description?: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    description,
    associatedMedia: images.map(image => ({
      '@type': 'ImageObject',
      contentUrl: image.url,
      caption: image.caption,
      description: image.description,
      creator: {
        '@type': 'Person',
        name: 'Fernando Govea',
      },
      copyrightHolder: {
        '@type': 'Organization',
        name: 'Ink 37 Tattoos',
      },
    })),
  };
}

/**
 * Generate WebSite structured data with search functionality
 */
export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ink 37 Tattoos',
    url: 'https://ink37tattoos.com',
    description: 'Custom tattoo artistry by Fernando Govea in Crowley, Texas',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ink37tattoos.com/gallery?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ink 37 Tattoos',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ink37tattoos.com/logo.png',
      },
    },
  };
}

export default SEOHead;