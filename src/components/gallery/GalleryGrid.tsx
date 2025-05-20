'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { galleryPhotos, categories } from './gallery-photos';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Video from 'yet-another-react-lightbox/plugins/video';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Play } from 'lucide-react';
// Import analytics tracking hook
import { useGalleryAnalytics } from '@/hooks/use-analytics';

type GalleryGridProps = {
  fullPage?: boolean;
  limit?: number;
  mediaType?: 'image' | 'video' | 'all';
};

export function GalleryGrid({
  fullPage = false,
  limit,
  mediaType = 'all',
}: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Get gallery analytics tracking hooks
  const { 
    trackGalleryFilter, 
    trackDesignView, 
    trackDesignViewEnded,
    trackDesignShare,
    trackDesignZoom,
    trackDesignSwipe,
    trackDesignDownload
  } = useGalleryAnalytics();

  // Filter gallery items based on active category and media type
  const filteredPhotos = galleryPhotos
    .filter(photo => activeCategory === 'All' || photo.category === activeCategory)
    .filter(photo => {
      if (mediaType === 'all') return true;
      if (mediaType === 'image') return photo.type !== 'video';
      if (mediaType === 'video') return photo.type === 'video';
      return true;
    });

  // Limit the number of items if specified
  const displayPhotos = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Item variants for animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Track currently viewed design in lightbox
  useEffect(() => {
    // When lightbox is closed or index is -1, end tracking for current design
    if (lightboxIndex === -1) return;
    
    // Get the current design
    const currentDesign = displayPhotos[lightboxIndex];
    
    // Track the view
    trackDesignView(
      currentDesign.title || 'Untitled', 
      currentDesign.category,
      undefined,
      [currentDesign.category || 'uncategorized']
    );
    
    // Clean up when lightbox closes or design changes
    return () => {
      trackDesignViewEnded(currentDesign.title || 'Untitled');
    };
  }, [lightboxIndex, displayPhotos, trackDesignView, trackDesignViewEnded]);

  // Handle category change with smooth animation
  const handleCategoryChange = (category: string) => {
    // Track category filter change
    trackGalleryFilter('category', category);
    
    // Update active category
    setActiveCategory(category);

    // Scroll back to top of gallery when changing categories
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle media type filter tracking
  useEffect(() => {
    if (mediaType !== 'all') {
      trackGalleryFilter('mediaType', mediaType);
    }
  }, [mediaType, trackGalleryFilter]);

  return (
    <div ref={galleryRef}>
      {/* Category Filters */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {categories.map((category, index) => (
          <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <Button
              variant={activeCategory === category ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange(category)}
              className={`rounded-full font-semibold ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-black/30 text-white/80 border border-white/10 hover:bg-blue-600/80 hover:text-white'
              }`}
            >
              {category}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Gallery Grid - Custom Implementation */}
      <motion.div
        className={`grid gap-6 grid-cols-1 ${
          fullPage
            ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayPhotos.map((photo, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-lg aspect-square group"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(index)}
          >
            <div className="relative h-full w-full">
              <Image
                src={photo.src}
                alt={photo.alt || ''}
                fill
                priority={index < 6} 
                quality={80}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  console.error(`Failed to load image: ${photo.src}`);
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />

              {/* Video Indicator */}
              {photo.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-red-500/70 rounded-full p-4 animate-pulse shadow-lg">
                    <Play className="text-white h-6 w-6" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{photo.title}</h3>
                  <p className="text-sm text-white/70">{photo.category}</p>
                  {photo.type === 'video' && (
                    <p className="text-xs text-white/50 mt-1">Click to play video</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox for fullscreen viewing */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        plugins={[Video, Thumbnails, Zoom]}
        carousel={{
          finite: displayPhotos.length <= 1,
          preload: 3
        }}
        thumbnails={{
          width: 120,
          height: 80,
          padding: 4
        }}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 2,
          onChange: (zoomLevel) => {
            if (lightboxIndex >= 0 && displayPhotos[lightboxIndex]) {
              const currentDesign = displayPhotos[lightboxIndex];
              trackDesignZoom(currentDesign.title || 'Untitled', zoomLevel);
            }
          }
        }}
        controller={{
          closeOnBackdropClick: true
        }}
        share={{
          buttons: [
            { id: 'facebook', label: 'Facebook' },
            { id: 'twitter', label: 'Twitter' },
            { id: 'pinterest', label: 'Pinterest' }
          ],
          url: (slide) => {
            const currentDesign = displayPhotos[lightboxIndex];
            // Track share event
            if (currentDesign) {
              trackDesignShare(currentDesign.title || 'Untitled', currentDesign.category);
            }
            return window.location.href;
          }
        }}
        on={{
          view: ({ index }) => {
            if (index !== lightboxIndex && index >= 0 && displayPhotos[index]) {
              const prevDesign = displayPhotos[lightboxIndex];
              const newDesign = displayPhotos[index];
              if (prevDesign && newDesign) {
                const direction = index > lightboxIndex ? 'right' : 'left';
                trackDesignSwipe(prevDesign.title || 'Untitled', direction);
                // Note: don't call setLightboxIndex here to avoid infinite loop
                // The lightbox component will handle index management internally
              }
            }
          }
        }}
        slides={displayPhotos.map(item => {
          if (item.type === 'video' && item.videoSrc) {
            return {
              type: 'video',
              poster: item.src,
              width: typeof item.width === 'number' ? item.width : 1200,
              height: typeof item.height === 'number' ? item.height : 800,
              sources: [
                {
                  src: item.videoSrc,
                  type: 'video/quicktime',
                },
              ],
              alt: item.alt || item.title || '',
              title: item.title || '',
            };
          }

          return {
            src: item.src,
            alt: item.alt || item.title || '',
            width: typeof item.width === 'number' ? item.width : 1200,
            height: typeof item.height === 'number' ? item.height : 800,
            title: item.title || '',
          };
        })}
      />
    </div>
  );
}

export default GalleryGrid;