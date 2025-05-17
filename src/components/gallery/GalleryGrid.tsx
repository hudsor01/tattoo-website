'use client';

import React from 'react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { galleryPhotos, categories, MediaItem } from './gallery-photos';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Video from 'yet-another-react-lightbox/plugins/video';
import { FaPlay } from 'react-icons/fa';

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

  // Handle category change with smooth animation
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    // Scroll back to top of gallery when changing categories
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              className={`rounded-full font-montserrat ${
                activeCategory === category
                  ? 'bg-tattoo-blue text-white shadow-md'
                  : 'bg-tattoo-black/30 text-tattoo-white/80 border border-tattoo-white/10 hover:bg-tattoo-blue/80 hover:text-white'
              }`}
            >
              {category}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Gallery Grid - Custom Implementation instead of using PhotoAlbum */}
      <motion.div
        className={`grid gap-4 grid-cols-1 ${
          fullPage
            ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3'
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Video Indicator */}
              {photo.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-tattoo-red/60 rounded-full p-3 animate-pulse">
                    <FaPlay className="text-white text-xl" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-tattoo-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-xl font-semibold text-tattoo-white">{photo.title}</h3>
                  <p className="text-sm text-tattoo-white/70">{photo.category}</p>
                  {photo.type === 'video' && (
                    <p className="text-xs text-tattoo-white/50 mt-1">Click to play video</p>
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
        plugins={[Video]}
        slides={displayPhotos.map(item => {
          if (item.type === 'video' && item.videoSrc) {
            return {
              type: 'video',
              poster: item.src,
              width: item.width,
              height: item.height,
              sources: [
                {
                  src: item.videoSrc,
                  type: 'video/quicktime',
                },
              ],
            };
          }

          return {
            src: item.src,
            alt: item.alt || '',
            width: item.width,
            height: item.height,
          };
        })}
      />
    </div>
  );
}

export default GalleryGrid;
