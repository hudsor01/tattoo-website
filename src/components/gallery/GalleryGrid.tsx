'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { galleryPhotos } from './gallery-photos';
import Image from 'next/image';
import { Play, ImageIcon, Film } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DynamicLightbox } from './DynamicLightbox';

// Media item interfaces
interface BaseGalleryItem {
  src: string;
  alt?: string;
  title?: string;
  category?: string;
  width?: number;
  height?: number;
  type: 'image' | 'video';
}

interface ImageGalleryItem extends BaseGalleryItem {
  type: 'image';
}

interface VideoGalleryItem extends BaseGalleryItem {
  type: 'video';
  videoSrc?: string;
}

type GalleryItem = ImageGalleryItem | VideoGalleryItem;

// Simple gallery interfaces for our static content

type GalleryGridProps = {
  limit?: number;
  mediaType?: 'image' | 'video' | 'all';
};

export function GalleryGrid({
  limit,
}: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filter gallery items based on active tab (images or videos)
  const filteredPhotos: GalleryItem[] = galleryPhotos.filter(photo => {
    if (activeTab === 'images') return photo.type === 'image';
    if (activeTab === 'videos') return photo.type === 'video';
    return true;
  }) as GalleryItem[];

  // Limit the number of items if specified
  const displayPhotos: GalleryItem[] = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;
  
  // Prepare slides for lightbox
  const lightboxSlides = displayPhotos.map((photo) => {
    if (photo.type === 'video') {
      return {
        type: 'video' as const,
        sources: [
          {
            src: (photo as VideoGalleryItem).videoSrc ?? photo.src,
            type: 'video/mp4',
          },
        ],
        poster: photo.src,
        width: photo.width ?? 1200,
        height: photo.height ?? 800,
        title: photo.title,
        description: photo.category,
      };
    } else {
      return {
        src: photo.src,
        width: photo.width ?? 1200,
        height: photo.height ?? 800,
        title: photo.title,
        description: photo.category,
      };
    }
  });

  // Debug logging
  useEffect(() => {
    void console.warn('Gallery Debug Info:', {
      activeTab,
      totalPhotos: galleryPhotos.length,
      filteredPhotos: filteredPhotos.length,
      displayPhotos: displayPhotos.length,
      galleryPhotos: galleryPhotos.slice(0, 3) // Show first 3 items
    });
  }, [activeTab, filteredPhotos.length, displayPhotos.length]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  // Item variants for animation
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Handle lightbox open/close
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxIndex(-1);
  };

  // Handle tab change
  const handleTabChange = (value: string): void => {
    if (value === 'images' || value === 'videos') {
      // Gallery filter tracking removed with analytics
      setActiveTab(value);
      
      if (galleryRef.current) {
        galleryRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  return (
    <div ref={galleryRef} className="animate-fade-in">
      {/* Modern Hero Section */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
          Tattoo Portfolio
        </h1>
        <p className="text-zinc-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Browse our collection of custom tattoo designs showcasing a diverse range of styles. From 
          traditional to Japanese, portraits to custom pieces - each design reflects our commitment to 
          quality, creativity, and personal expression.
        </p>
        
        {/* CTA Button */}
        <motion.a
          href="/booking"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book a Consultation
        </motion.a>
      </div>
      
      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-12 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 p-1 rounded-xl">
            <TabsTrigger 
              value="images" 
              className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-zinc-400 hover:text-zinc-200"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-zinc-400 hover:text-zinc-200"
            >
              <Film className="h-4 w-4 mr-2" />
              <span>Videos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="mt-0">
            {/* Modern Images Gallery Grid */}
            <motion.div
              className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPhotos.map((photo, index) => (
                <motion.div
                  key={photo.src}
                  className="relative group cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  onClick={() => {
                    void console.warn('Clicked item:', { index, photo, type: photo.type });
                    openLightbox(index);
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-800/50 border border-zinc-700/30 group-hover:border-red-500/50 transition-all duration-300">
                    <Image
                      src={photo.src}
                      alt={photo.alt ?? `${photo.category ?? 'Custom'} tattoo design by Fernando Govea - Professional tattoo artist Dallas Fort Worth`}
                      fill
                      priority={index < 12} 
                      quality={95}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        void console.error(`Failed to load image: ${photo.src}`);
                        e.currentTarget.src = '/images/traditional.jpg';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Video Indicator */}
                    {photo.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-500 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Play className="text-white h-4 w-4 fill-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-medium text-sm truncate">{photo.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{photo.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            {/* Modern Videos Gallery Grid */}
            <motion.div
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPhotos.map((photo, index) => (
                <motion.div
                  key={photo.src}
                  className="relative group cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ y: -12 }}
                  onClick={() => {
                    void console.warn('Clicked item:', { index, photo, type: photo.type });
                    openLightbox(index);
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-800/50 border border-zinc-700/30 group-hover:border-red-500/50 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    <Image
                      src={photo.src}
                      alt={photo.alt ?? `${photo.category ?? 'Custom'} tattoo design by Fernando Govea - Professional tattoo artist Dallas Fort Worth`}
                      fill
                      priority={index < 6} 
                      quality={95}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        void console.error(`Failed to load image: ${photo.src}`);
                        e.currentTarget.src = '/images/traditional.jpg';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Video Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-500 rounded-full p-4 shadow-2xl group-hover:scale-110 transition-all duration-300">
                        <Play className="text-white h-6 w-6 fill-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-base truncate">{photo.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{photo.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Dynamic Lightbox - only loads when needed */}
      <DynamicLightbox
      open={isLightboxOpen}
      close={closeLightbox}
      index={lightboxIndex}
      slides={lightboxSlides}
      render={{
      ...(lightboxSlides.length <= 1 && {
      buttonPrev: () => null,
      buttonNext: () => null,
      })
      }}
      animation={{ fade: 250, swipe: 250, easing: { fade: 'ease', swipe: 'ease', navigation: 'ease' } }}
      controller={{
        closeOnPullDown: true,
        closeOnPullUp: false,
        closeOnBackdropClick: true,
        focus: true,
        touchAction: 'pan-y' as const,
        aria: true,
        preventDefaultWheelX: true,
        preventDefaultWheelY: false,
        disableSwipeNavigation: false,
        ref: { current: null }
      }}
      toolbar={{ buttons: ['close'] }}
      carousel={{ 
      finite: lightboxSlides.length <= 1,
      preload: 2,
      padding: 0,
      spacing: 0,
      imageFit: 'contain',
      imageProps: {}
      }}
      labels={{}}
      plugins={[]}
      portal={{}}
      noScroll={{ disabled: false }}
      on={{}}
      styles={{}}
      className=""
      />
      </div>
      );
      }
      
      export default GalleryGrid;;