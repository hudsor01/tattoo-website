'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DARK_PLACEHOLDER, getImageLoadingStrategy, getImageSizes } from '@/lib/utils/image';

interface LazyImageProps extends Omit<ImageProps, 'loading' | 'placeholder' | 'blurDataURL'> {
  blurhash?: string;
  componentType?: 'hero' | 'card' | 'gallery' | 'thumbnail' | 'banner' | 'avatar';
  index?: number;
  fallbackSrc?: string;
  showLoadingAnimation?: boolean;
}

export function LazyImage({
  src,
  alt,
  priority = false,
  componentType = 'card',
  index = 0,
  className,
  fallbackSrc = '/images/placeholder.jpg',
  showLoadingAnimation = true,
  sizes,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const loading = getImageLoadingStrategy(priority, index);
  const imageSizes = sizes || getImageSizes(componentType);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [currentSrc, fallbackSrc]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {showLoadingAnimation && !isLoaded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
        </motion.div>
      )}

      {/* Image */}
      <Image
        src={currentSrc}
        alt={alt}
        loading={loading}
        placeholder="blur"
        blurDataURL={DARK_PLACEHOLDER}
        sizes={imageSizes}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && 'opacity-0',
          isLoaded && 'opacity-100',
          className
        )}
        onLoadingComplete={handleLoad}
        onError={handleError}
        priority={priority}
        {...props}
      />

      {/* Error state */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <p className="text-sm text-gray-400">Image not available</p>
        </div>
      )}
    </div>
  );
}