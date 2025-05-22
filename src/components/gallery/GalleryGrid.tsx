'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { galleryPhotos } from './gallery-photos';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Video from 'yet-another-react-lightbox/plugins/video';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Share from 'yet-another-react-lightbox/plugins/share';
import 'yet-another-react-lightbox/plugins/share.css';
import { Play, ImageIcon, Film } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

// Lightbox slide interfaces
interface BaseLightboxSlide {
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
}

interface VideoLightboxSlide {
  type: 'video';
  poster: string;
  width: number;
  height: number;
  sources: {
    src: string;
    type: string;
  }[];
  alt: string;
  title: string;
}

type GalleryGridProps = {
  limit?: number;
  mediaType?: 'image' | 'video' | 'all';
};

export function GalleryGrid({
  limit,
}: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filter gallery items based on active tab (images or videos)
  const filteredPhotos: GalleryItem[] = galleryPhotos.filter(photo => {
    if (activeTab === 'images') return photo.type === 'image';
    if (activeTab === 'videos') return photo.type === 'video';
    return true;
  }) as GalleryItem[];

  // Limit the number of items if specified
  const displayPhotos: GalleryItem[] = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

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

  // Track currently viewed design in lightbox
  useEffect(() => {
    if (lightboxIndex === -1) return;
    
    const currentDesign = displayPhotos[lightboxIndex];
    if (!currentDesign) return;
    
    // Design view tracking removed with analytics
    
    return () => {
      // Design view ended tracking removed with analytics
    };
  }, [lightboxIndex, displayPhotos]);

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

  // Handle share event
  const handleShare = () => {
    if (lightboxIndex >= 0 && displayPhotos[lightboxIndex]) {
      // Design share tracking removed with analytics
    }
    return window.location.href;
  };

  return (
    <div ref={galleryRef} className="animate-fade-in">
      {/* Hero Section */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 animate-gradient">Tattoo Portfolio</h1>
        <p className="text-center max-w-2xl mx-auto mb-6 text-zinc-300 text-lg leading-relaxed">
          Browse our collection of custom tattoo designs showcasing a diverse range of styles. From 
          traditional to Japanese, portraits to custom pieces - each design reflects our commitment to 
          quality, creativity, and personal expression.
        </p>
        
        <div className="mb-8">
          <a href="/booking" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 animate-gradient text-white font-medium transition-all hover:shadow-lg hover:shadow-red-500/25 hover:scale-105">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Book a Consultation
          </a>
        </div>
      </div>
      
      {/* Gallery Section with Centered Tabs */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-center mb-8">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full max-w-md"
          >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-zinc-800/50 backdrop-blur-sm">
            <TabsTrigger 
              value="images" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-orange-500 data-[state=active]:to-amber-500 data-[state=active]:animate-gradient data-[state=active]:text-white"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Tattoo Gallery</span>
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:via-orange-500 data-[state=active]:to-amber-500 data-[state=active]:animate-gradient data-[state=active]:text-white"
            >
              <Film className="h-4 w-4 mr-2" />
              <span>Process Videos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="mt-6">
            {/* Images Gallery Grid Component */}
            <motion.div
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-lg aspect-[2/3] group shadow-lg"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.4, ease: 'easeOut' }
                  }}
                  onClick={() => setLightboxIndex(index)}
                >
                  <div className="relative h-full w-full">
                    {/* Image Container with Border and Glow Effect */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={photo.src}
                        alt={photo.alt || ''}
                        fill
                        priority={index < 6} 
                        quality={95}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                        onError={(e) => {
                          console.error(`Failed to load image: ${photo.src}`);
                          e.currentTarget.src = '/images/traditional.jpg';
                        }}
                      />
                    </div>

                    {/* Video Indicator */}
                    {photo.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-primary/70 shadow-md rounded-full p-3 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                          <Play className="text-white h-5 w-5" />
                        </div>
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                      </div>
                    )}

                    {/* Enhanced Info Overlay with Title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-3 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-sm font-medium text-white truncate">{photo.title}</h3>
                        <p className="text-xs text-white/70 mt-1">{photo.category}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-6">
            {/* Videos Gallery Grid */}
            <motion.div
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-lg aspect-[2/3] group shadow-lg"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.4, ease: 'easeOut' }
                  }}
                  onClick={() => setLightboxIndex(index)}
                >
                  <div className="relative h-full w-full">
                    {/* Image Container with Border and Glow Effect */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={photo.src}
                        alt={photo.alt || ''}
                        fill
                        priority={index < 6} 
                        quality={95}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                        onError={(e) => {
                          console.error(`Failed to load image: ${photo.src}`);
                          e.currentTarget.src = '/images/traditional.jpg';
                        }}
                      />
                    </div>

                    {/* Video Indicator */}
                    {photo.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-primary/70 shadow-md rounded-full p-3 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                          <Play className="text-white h-5 w-5" />
                        </div>
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                      </div>
                    )}

                    {/* Enhanced Info Overlay with Title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-3 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-sm font-medium text-white truncate">{photo.title}</h3>
                        <p className="text-xs text-white/70 mt-1">{photo.category}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Lightbox for fullscreen viewing - Enhanced Styling */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        plugins={[Video, Thumbnails, Zoom, Share]}
        carousel={{
          finite: displayPhotos.length <= 1,
          preload: 3
        }}
        thumbnails={{
          width: 120,
          height: 80,
          padding: 4,
          border: 0,
          borderRadius: 8,
          gap: 12
        }}
        styles={{
          root: {
            "--yarl__color_backdrop": "rgba(0, 0, 0, 0.9)",
            "--yarl__slide_title_color": "#fff",
            "--yarl__color_button": "#f97316", // orange-500 to match the gradient theme
            "--yarl__color_button_active": "#f97316",
            "--yarl__color_button_hover": "#f97316",
            "--yarl__thumbnails_selected_border_color": "#f97316"
          }
        }}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
        }}
        controller={{
          closeOnBackdropClick: true,
          touchAction: "pan-y"
        }}
        share={{
          share: handleShare
        }}
        render={{
          buttonNext: () => {
            const state = { isLast: lightboxIndex === displayPhotos.length - 1 };
            return state.isLast ? null : null;
          },
          buttonPrev: () => {
            const state = { isFirst: lightboxIndex === 0 };
            return state.isFirst ? null : null;
          },
          iconNext: () => <span className="text-white text-2xl font-light">›</span>,
          iconPrev: () => <span className="text-white text-2xl font-light">‹</span>,
        }}
        on={{
          view: ({ index }: { index: number }) => {
            if (index !== lightboxIndex && index >= 0 && displayPhotos[index]) {
              const prevDesign = displayPhotos[lightboxIndex];
              const newDesign = displayPhotos[index];
              if (prevDesign && newDesign) {
                // Design swipe tracking removed with analytics
                // Note: don't call setLightboxIndex here to avoid infinite loop
                // The lightbox component will handle index management internally
              }
            }
          },
          zoom: (props) => {
            if (lightboxIndex >= 0 && displayPhotos[lightboxIndex]) {
              // Design zoom tracking removed with analytics
            }
          }
        }}
        slides={displayPhotos.map(item => {
          if (item.type === 'video' && (item as VideoGalleryItem).videoSrc) {
            return {
              type: 'video',
              poster: item.src,
              width: typeof item.width === 'number' ? item.width : 1200,
              height: typeof item.height === 'number' ? item.height : 800,
              sources: [
                {
                  src: (item as VideoGalleryItem).videoSrc as string,
                  type: 'video/quicktime',
                },
              ],
              alt: item.alt || item.title || '',
              title: item.title || '',
            } as VideoLightboxSlide;
          }

          return {
            src: item.src,
            alt: item.alt || item.title || '',
            width: typeof item.width === 'number' ? item.width : 1200,
            height: typeof item.height === 'number' ? item.height : 800,
            title: item.title || '',
          } as BaseLightboxSlide;
        })}
      />
    </div>
  );
}

export default GalleryGrid;