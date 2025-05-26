'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { MediaItem } from './gallery-photos';

interface GalleryPreviewCardProps {
  mediaItem: MediaItem;
  category: string;
}

/**
 * GalleryPreviewCard Component
 *
 * Showcases a gallery item with an appealing design
 * and directs users to view more items in a specific category.
 */
export function GalleryPreviewCard({ mediaItem, category }: GalleryPreviewCardProps) {
  // Encode category for URL
  const encodedCategory = encodeURIComponent(category);

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-2xl relative group"
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image container with overlay */}
      <div className="relative aspect-[3/4]">
        <Image
          src={mediaItem.src}
          alt={
            mediaItem.alt ??
            `Professional ${category} tattoo design by Ink 37 - Custom tattoo art in Crowley, TX`
          }
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
          quality={90}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300"></div>

        {/* Video indicator if applicable */}
        {mediaItem.type === 'video' && (
          <div className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 shadow-lg z-10">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6.5L15 10.5L9 14.5V6.5Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white shadow-lg">
          {category}
        </div>

        {/* Text content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-lg font-bold text-white mb-2">{mediaItem.title ?? category}</h3>

          <Link
            href={`/gallery?category=${encodedCategory}`}
            className="inline-flex items-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-red-500/25"
            prefetch={false}
          >
            View Collection
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default GalleryPreviewCard;
