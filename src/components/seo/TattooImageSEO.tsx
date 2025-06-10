/**
 * Image SEO Optimization Component for Tattoo Gallery
 * 
 * Provides comprehensive image optimization for maximum search engine visibility:
 * - Structured data for images
 * - Optimized alt text generation
 * - Lazy loading with SEO-friendly implementation
 * - Social media optimization
 * - Google Images optimization
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { seoConfig } from '@/lib/seo/seo-config';

interface TattooImageSEOProps {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  designType?: string;
  bodyPlacement?: string;
  artistName?: string;
  style?: string;
  tags?: string[];
  priority?: boolean;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * SEO-optimized image component for tattoo gallery
 */
export default function TattooImageSEO({
  src,
  alt,
  title,
  width = 800,
  height = 600,
  designType,
  bodyPlacement,
  artistName = seoConfig.artistName,
  style,
  tags = [],
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  onLoad,
  onError,
}: TattooImageSEOProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate optimized alt text if not provided
  const optimizedAlt = alt ?? generateTattooAltText({
    designType,
    bodyPlacement,
    artistName,
    style,
    tags,
  });

  // Generate optimized title if not provided
  const optimizedTitle = title ?? generateTattooTitle({
    designType,
    bodyPlacement,
    artistName,
    style,
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    console.warn(`Failed to load image: ${src}`);
    onError?.();
  };

  // Generate structured data for the image
  const imageStructuredData = generateImageStructuredData({
    src,
    alt: optimizedAlt,
    title: optimizedTitle,
    width,
    height,
    designType,
    bodyPlacement,
    artistName,
    style,
    tags,
  });

  return (
    <div ref={imgRef} className={`tattoo-image-container ${className}`}>
      {/* Structured data for the image */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageStructuredData) }}
      />
      
      {/* Optimized image with SEO attributes */}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={optimizedAlt}
          title={optimizedTitle}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          quality={85}
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: 'cover',
            aspectRatio: `${width}/${height}`,
          }}
        />
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="bg-gray-200 animate-pulse flex items-center justify-center"
          style={{
            width: '100%',
            aspectRatio: `${width}/${height}`,
          }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Additional meta tags for enhanced SEO */}
      <meta
        property="og:image"
        content={src.startsWith('http') ? src : `${seoConfig.siteUrl}${src}`}
      />
      <meta property="og:image:alt" content={optimizedAlt} />
      <meta property="og:image:width" content={width.toString()} />
      <meta property="og:image:height" content={height.toString()} />
      <meta property="og:image:type" content="image/jpeg" />
    </div>
  );
}

/**
 * Generate SEO-optimized alt text for tattoo images
 */
function generateTattooAltText({
  designType,
  bodyPlacement,
  artistName,
  style,
  tags,
}: {
  designType?: string;
  bodyPlacement?: string;
  artistName?: string;
  style?: string;
  tags?: string[];
}) {
  const parts = [];
  
  if (style) parts.push(style);
  if (designType) parts.push(designType);
  parts.push('tattoo');
  if (bodyPlacement) parts.push(`on ${bodyPlacement}`);
  if (artistName) parts.push(`by ${artistName}`);
  if (tags && tags.length > 0) parts.push(`featuring ${tags.slice(0, 2).join(' and ')}`);
  
  return parts.join(' ') + ' - Professional tattoo artwork in Dallas/Fort Worth, TX';
}

/**
 * Generate SEO-optimized title for tattoo images
 */
function generateTattooTitle({
  designType,
  bodyPlacement,
  artistName,
  style,
}: {
  designType?: string;
  bodyPlacement?: string;
  artistName?: string;
  style?: string;
}) {
  const parts = [];
  
  if (style) parts.push(style);
  if (designType) parts.push(designType);
  parts.push('Tattoo');
  if (bodyPlacement) parts.push(`- ${bodyPlacement}`);
  if (artistName) parts.push(`by ${artistName}`);
  
  return parts.join(' ');
}

/**
 * Generate structured data for tattoo images
 */
function generateImageStructuredData({
  src,
  alt,
  title,
  width,
  height,
  designType,
  bodyPlacement,
  artistName,
  style,
  tags,
}: {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  designType?: string;
  bodyPlacement?: string;
  artistName?: string;
  style?: string;
  tags?: string[];
}) {
  const imageUrl = src.startsWith('http') ? src : `${seoConfig.siteUrl}${src}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${imageUrl}#image`,
    url: imageUrl,
    name: title,
    alternateName: alt,
    description: alt,
    width: {
      '@type': 'QuantitativeValue',
      value: width,
      unitCode: 'E37', // pixels
    },
    height: {
      '@type': 'QuantitativeValue',
      value: height,
      unitCode: 'E37', // pixels
    },
    contentUrl: imageUrl,
    thumbnailUrl: imageUrl,
    creator: {
      '@type': 'Person',
      name: artistName ?? seoConfig.artistName,
      jobTitle: 'Tattoo Artist',
      worksFor: {
        '@type': 'LocalBusiness',
        name: seoConfig.businessName,
        url: seoConfig.siteUrl,
      },
    },
    copyrightHolder: {
      '@type': 'Organization',
      name: seoConfig.businessName,
      url: seoConfig.siteUrl,
    },
    license: `${seoConfig.siteUrl}/terms-of-use`,
    acquireLicensePage: `${seoConfig.siteUrl}/contact`,
    creditText: `© ${seoConfig.businessName} - Professional Tattoo Artwork`,
    about: {
      '@type': 'CreativeWork',
      name: `${style ?? 'Custom'} ${designType ?? 'Tattoo'} Design`,
      description: `Professional ${style ?? 'custom'} tattoo artwork${bodyPlacement ? ` on ${bodyPlacement}` : ''} created by ${artistName ?? seoConfig.artistName}`,
      creator: {
        '@type': 'Person',
        name: artistName ?? seoConfig.artistName,
      },
      ...(tags && tags.length > 0 && {
        keywords: tags.join(', '),
      }),
    },
    associatedArticle: {
      '@type': 'Article',
      headline: `${style ?? 'Custom'} Tattoo Gallery - ${seoConfig.businessName}`,
      url: `${seoConfig.siteUrl}/gallery${style ? `/${style.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
      author: {
        '@type': 'Person',
        name: artistName ?? seoConfig.artistName,
      },
      publisher: {
        '@type': 'Organization',
        name: seoConfig.businessName,
        logo: {
          '@type': 'ImageObject',
          url: `${seoConfig.siteUrl}${seoConfig.logo}`,
        },
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.siteUrl}/gallery`,
    },
    isPartOf: {
      '@type': 'CollectionPage',
      name: 'Tattoo Gallery',
      url: `${seoConfig.siteUrl}/gallery`,
    },
  };
}

/**
 * Gallery container component with enhanced SEO
 */
export function TattooGallerySEO({
  children,
  title = 'Professional Tattoo Gallery',
  description,
  style,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  style?: string;
}) {
  const galleryDescription = description ?? 
    `Professional tattoo artwork gallery featuring ${style ?? 'custom'} designs by ${seoConfig.artistName} at ${seoConfig.businessName} in ${seoConfig.location.region}`;

  const galleryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    description: galleryDescription,
    url: `${seoConfig.siteUrl}/gallery${style ? `/${style.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
    creator: {
      '@type': 'Person',
      name: seoConfig.artistName,
      jobTitle: 'Professional Tattoo Artist',
      worksFor: {
        '@type': 'LocalBusiness',
        name: seoConfig.businessName,
        url: seoConfig.siteUrl,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.businessName,
      url: seoConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}${seoConfig.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.siteUrl}/gallery${style ? `/${style.toLowerCase().replace(/\s+/g, '-')}` : ''}`,
    },
    about: {
      '@type': 'Service',
      name: 'Professional Tattoo Services',
      provider: {
        '@type': 'LocalBusiness',
        name: seoConfig.businessName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: seoConfig.location.city,
          addressRegion: seoConfig.location.state,
          addressCountry: 'US',
        },
      },
    },
  };

  return (
    <div className="tattoo-gallery-seo">
      {/* Gallery structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryStructuredData) }}
      />
      
      {/* Gallery content */}
      {children}
    </div>
  );
}
