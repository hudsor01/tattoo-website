'use client';

import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import Footer from '@/components/layouts/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import type { TattooDesign } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionBookingPrompt } from '@/components/booking/BookingPrompts';
import { useGalleryFiles } from '@/hooks/use-gallery-files';
import { Loader2, CheckCircle, X } from 'lucide-react';
import type { GalleryFile } from '@/lib/prisma-types';
import AceternityLayoutGrid from '@/components/gallery/AceternityLayoutGrid';
import { useSearchParams } from 'next/navigation';

// Loading skeleton for the gallery grid
const GalleryGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
    ))}
  </div>
));

GalleryGridSkeleton.displayName = 'GalleryGridSkeleton';

/**
* Gallery Client Component
*
* Client-side component for the Gallery page that dynamically loads images and videos
* from the filesystem via API. Features modern animations and proper data fetching.
*/
function GalleryClient() {
  const [activeTab, setActiveTab] = useState('images');
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const { data, isLoading, error } = useGalleryFiles();
  const searchParams = useSearchParams();

  // Check for booking success parameter
  useEffect(() => {
    if (searchParams.get('booking') === 'success') {
      setShowBookingSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowBookingSuccess(false);
      }, 5000);
      
      // Clear the URL parameter
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('booking');
        window.history.replaceState({}, '', url.toString());
      }

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [searchParams]);

  // Memoized tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Convert gallery files to TattooDesign format for the AceternityLayoutGrid
  const { images, videos } = useMemo(() => {
    if (!data?.files) return { images: [], videos: [] };

    const convertToTattooDesign = (file: GalleryFile): TattooDesign => ({
      id: file.id,
      name: file.name,
      description: file.description,
      fileUrl: file.src,
      thumbnailUrl: file.src,
      designType: file.designType,
      size: file.size,
      isApproved: true,
      artistId: 'fernando-govea',
      artistName: 'Fernando Govea',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TattooDesign);

    const imageFiles = data.files
      .filter(file => file.type === 'image')
      .map(convertToTattooDesign);

    const videoFiles = data.files
      .filter(file => file.type === 'video')
      .map(convertToTattooDesign);

    return { images: imageFiles, videos: videoFiles };
  }, [data]);

  if (error) {
    console.error('Gallery error in component:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Gallery Loading Error</h2>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading the tattoo gallery. This might be a temporary issue with image loading.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-fernando-gradient text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              🔄 Reload gallery
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              🏠 Go home
            </button>
            <div className="mt-8 text-sm text-muted-foreground">
              <p>You can also check out our work on social media:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="https://instagram.com" className="text-primary hover:underline">Instagram</a>
                <a href="https://tiktok.com" className="text-primary hover:underline">TikTok</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Booking Success Notification */}
      <AnimatePresence>
        {showBookingSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Booking Successful! We'll contact you soon to confirm your appointment.</span>
            <button 
              onClick={() => setShowBookingSuccess(false)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 fernando-gradient">
            Tattoo Gallery
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse our collection of custom tattoo designs showcasing a diverse range of styles. From
            traditional to Japanese, portraits to custom pieces - each design reflects our commitment
            to quality, creativity, and personal expression.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-fernando-orange" />
            <span className="ml-2 text-muted-foreground">Loading gallery...</span>
          </div>
        )}

        {/* Gallery Content */}
        {!isLoading && data && (
          <>
            {/* Tabs for Images and Videos */}
            <Tabs defaultValue="images" value={activeTab} onValueChange={handleTabChange} className="w-full gallery-tabs">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="images" className="gallery-tab-trigger">
                  Images ({images.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="gallery-tab-trigger">
                  Videos ({videos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="images" className="mt-8">
                {images.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">No images found.</p>
                  </div>
                ) : (
                  <AceternityLayoutGrid designs={images} />
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-8">
                {videos.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">No videos found.</p>
                  </div>
                ) : (
                  <AceternityLayoutGrid designs={videos} />
                )}
              </TabsContent>
            </Tabs>

            {/* Booking CTA Section */}
            <SectionBookingPrompt 
              context="gallery" 
              showStats={true}
              className="mt-16"
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Export memoized component for performance
export default memo(GalleryClient);