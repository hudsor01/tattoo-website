'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Images for the carousel - preload all for better performance
const tattooImages = [
  '/images/japanese.jpg',
  '/images/traditional.jpg',
  '/images/realism.jpg',
  '/images/leg-piece.jpg',
  '/images/dragonballz-left-arm.jpg',
  '/images/cover-ups.jpg',
];

export default function HomeClient() {
  // For image carousel
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  // Auto-advance carousel with very slow transition (10 seconds)
  const [isPaused, setIsPaused] = React.useState(false);
  
  void React.useEffect(() => {
    if (isPaused) return undefined;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === tattooImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 seconds between image transitions
    
    return () => clearInterval(interval);
  }, [isPaused]);
  
  // Handle pause on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
  };
  
  // Touch swipe handling for mobile
  const [touchStart, setTouchStart] = React.useState<number | null>(0);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches && e.targetTouches.length > 0) {
      setTouchStart(e.targetTouches[0]?.clientX ?? 0);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches && e.targetTouches.length > 0) {
      setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
    }
  };
  
  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      if (touchStart - touchEnd > 50) {
        // Swipe left
        setCurrentImageIndex(prev => prev === tattooImages.length - 1 ? 0 : prev + 1);
      }
      
      if (touchStart - touchEnd < -50) {
        // Swipe right
        setCurrentImageIndex(prev => prev === 0 ? tattooImages.length - 1 : prev - 1);
      }
    }
  };
  
  // Disable scrolling on the page
  void React.useEffect(() => {
    // Disable scrolling on this page
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    return () => {
      // Clean up when component unmounts
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);
  
  // Preload images for better performance
  void React.useEffect(() => {
    void tattooImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);
  
  return (
    <>
      {/* Loading overlay removed since isLoading state is not being used */}
      {/* If you need a loading indicator in the future, implement it with proper state management */}
      
      {/* Persistent minimal navigation */}
      <nav className="fixed top-8 right-8 z-40 flex gap-6">
        <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/gallery"
            className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
          >
            Gallery
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/services"
            className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
          >
            Services
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/contact"
            className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
          >
            Contact
          </Link>
        </motion.div>
      </nav>
    
      <div className="fixed inset-0 overflow-hidden bg-black">
        {/* Main container with improved spacing */}
        <div className="h-full w-full flex flex-col md:flex-row px-6 lg:px-12">
          {/* Left side - Content with proper spacing from navbar */}
          <div className="md:w-[45%] flex items-center justify-start py-16 md:py-8 pl-4 md:pl-8">
            <div className="w-full md:max-w-2xl">
              <h1 className="artist-name text-white mb-6">
                TATTOOS BY<br />
                <span className="gradient-text">
                  FERNANDO GOVEA
                </span>
              </h1>
              
              <p className="paragraph-large mb-10">
                Crafting exceptional custom tattoos in Dallas/Fort Worth
              </p>

              {/* Enhanced CTAs with consistent styling */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/gallery" passHref>
                  <motion.a
                    whileHover={{ 
                      y: -4,
                      boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-md transition-all text-center shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    <span>See My Work</span>
                  </motion.a>
                </Link>
                
                <Link href="/booking" passHref>
                  <motion.a
                    whileHover={{ 
                      y: -4,
                      boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-md transition-all text-center shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    <span>Book a Consultation</span>
                  </motion.a>
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Large responsive image carousel */}
          <div className="md:w-[55%] flex items-center justify-center py-16 md:py-8 pr-4 md:pr-8">
            <div className="h-full w-full flex items-center justify-center">
              {/* Image carousel with wider proportions matching original images */}
              <div className="h-[60vh] w-full max-w-[500px] aspect-[9/16] relative">
                <div 
                  className="w-full h-full relative overflow-hidden rounded-xl"
                  style={{ 
                    filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25))",
                    maxWidth: "100%"
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={(e) => {
                    handleMouseEnter();
                    handleTouchStart(e);
                  }}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => {
                    handleMouseLeave();
                    handleTouchEnd();
                  }}
                >
                  <AnimatePresence mode="wait">
                    {tattooImages.map((src, index) => (
                      index === currentImageIndex && (
                        <motion.div
                          key={src}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          {/* Efficient border gradient to reduce repaints */}
                          <div className="absolute inset-0" style={{
                            background: "linear-gradient(to right, #ef4444, #f97316)",
                            borderRadius: "0.75rem",
                            padding: "2px"
                          }}>
                            <div className="absolute inset-[2px] rounded-[calc(0.75rem-2px)] overflow-hidden z-10">
                              <Image
                                src={src}
                                alt={`Tattoo artwork by Fernando Govea ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 90vw, 50vw"
                                priority={index === 0}
                                quality={90}
                                className="object-cover"
                                draggable="false"
                                style={{ 
                                  objectFit: 'cover',
                                  willChange: 'transform' 
                                }}
                              />
                              
                              {/* Optimized overlay with opacity reduction */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                  
                  {/* Carousel Controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                    {tattooImages.map((imagePath, index) => (
                      <button
                        key={imagePath}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-4' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Arrow Controls */}
                  <button 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center z-20 transition-all"
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? tattooImages.length - 1 : prev - 1)}
                    aria-label="Previous image"
                  >
                    &#10094;
                  </button>
                  
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center z-20 transition-all"
                    onClick={() => setCurrentImageIndex(prev => prev === tattooImages.length - 1 ? 0 : prev + 1)}
                    aria-label="Next image"
                  >
                    &#10095;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}