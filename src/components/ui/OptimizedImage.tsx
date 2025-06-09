'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
src: string;
alt: string;
width?: number;
height?: number;
fill?: boolean;
className?: string;
priority?: boolean;
placeholder?: 'blur' | 'empty';
blurDataURL?: string;
sizes?: string;
quality?: number;
loading?: 'eager' | 'lazy';
onLoad?: () => void;
onError?: () => void;
fallback?: string;
}

/**
 * Optimized Image Component for Gallery and Performance
 * 
 * Features:
 * - Automatic WebP/AVIF conversion via Next.js
 * - Lazy loading with intersection observer
 * - Blur placeholder support
 * - Error handling with fallback
 * - Core Web Vitals optimization
 */
export default function OptimizedImage({
src,
alt,
width,
height,
fill,
className,
priority = false,
placeholder = 'blur',
blurDataURL,
sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
quality = 85,
loading = 'lazy',
onLoad,
onError,
fallback = '/images/placeholder-tattoo.jpg'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg width="${width ?? 400}" height="${height ?? 300}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-family="sans-serif" font-size="14">
        Loading...
      </text>
    </svg>`
  )}`;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  // Preload critical images
  useEffect(() => {
    if (priority && typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
    return undefined;
  }, [src, priority]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
      src={imageSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL ?? defaultBlurDataURL}
      sizes={sizes}
      quality={quality}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      hasError && 'opacity-75'
      )}
      style={{
      objectFit: 'cover',
      ...(fill ? {} : { width: '100%', height: '100%' })
      }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse text-muted-foreground">
            <svg
              className="w-8 h-8 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Image Error
        </div>
      )}
    </div>
  );
}

/**
 * Gallery-specific optimized image with aspect ratio
 */
export function GalleryImage({
  src,
  alt,
  aspectRatio = 'square',
  ...props
}: OptimizedImageProps & {
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={cn('relative', aspectRatioClasses[aspectRatio])}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}

/**
 * Hero image with optimized loading
 */
export function HeroImage({
  src,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      quality={90}
      sizes="100vw"
      placeholder="blur"
      loading="eager"
      {...props}
    />
  );
}

/**
 * Thumbnail image for cards and previews
 */
export function ThumbnailImage({
  src,
  alt,
  size = 'md',
  ...props
}: OptimizedImageProps & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const sizeDimensions = {
    sm: { width: 64, height: 64 },
    md: { width: 96, height: 96 },
    lg: { width: 128, height: 128 }
  };

  return (
    <div className={cn('relative', sizeClasses[size])}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={sizeDimensions[size].width}
        height={sizeDimensions[size].height}
        sizes={`${sizeDimensions[size].width}px`}
        quality={75}
        className="object-cover rounded"
        {...props}
      />
    </div>
  );
}