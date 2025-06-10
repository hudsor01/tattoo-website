/**
 * Mobile-Optimized Gallery Component for Ink 37 Tattoos
 * 
 * Features:
 * - Touch gesture support (swipe, pinch-to-zoom)
 * - Lazy loading with progressive enhancement
 * - Performance optimizations for mobile
 * - Accessibility features
 * - Infinite scroll
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

interface MobileGalleryProps {
  images: GalleryImage[];
  categories?: string[];
  enableInfiniteScroll?: boolean;
  enableZoom?: boolean;
  enableSwipe?: boolean;
  imagesPerLoad?: number;
}

export default function MobileGallery({
  images,
  categories = [],
  enableInfiniteScroll = true,
  enableZoom = true,
  enableSwipe = true,
  imagesPerLoad = 12,
}: MobileGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayedImages, setDisplayedImages] = useState<GalleryImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Filter images by category
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Load initial images
  useEffect(() => {
    const initialImages = filteredImages.slice(0, imagesPerLoad);
    setDisplayedImages(initialImages);
    setCurrentPage(1);
  }, [filteredImages, imagesPerLoad]);

  // Load more images function
  const loadMoreImages = useCallback(() => {
    if (isLoading || displayedImages.length >= filteredImages.length) return;

    setIsLoading(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * imagesPerLoad;
      const endIndex = startIndex + imagesPerLoad;
      const newImages = filteredImages.slice(startIndex, endIndex);
      
      setDisplayedImages(prev => [...prev, ...newImages]);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 300);
  }, [currentPage, displayedImages.length, filteredImages, imagesPerLoad, isLoading]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current) {
      return () => {
        // No cleanup needed when observer is not created
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoading && displayedImages.length < filteredImages.length) {
          loadMoreImages();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedImages.length, filteredImages.length, isLoading, enableInfiniteScroll, loadMoreImages]);

  // Touch gesture handlers for zoom
  const handleTouchStart = useCallback((e: React.TouchEvent): void => {
    if (!enableZoom || !selectedImage) return;
    
    if (e.touches.length === 2) {
      // Pinch gesture
      e.preventDefault();
    }
  }, [enableZoom, selectedImage]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableZoom || !selectedImage) return;
    
    if (e.touches.length === 2) {
      e.preventDefault();
      // Calculate pinch distance and adjust zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Adjust zoom level based on pinch gesture
        setZoomLevel(_prev => Math.min(Math.max(distance / 200, 0.5), 3));
      }
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      // Pan gesture when zoomed
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        setPanPosition(_prev => ({
          x: touch.clientX * 0.1,
          y: touch.clientY * 0.1,
        }));
      }
    }
  }, [enableZoom, selectedImage, zoomLevel]);

  // Swipe handlers for navigation
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!enableSwipe || !selectedImage) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'left') {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    }
    
    const newImage = filteredImages[newIndex];
    if (newImage) {
      setSelectedImage(newImage);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [enableSwipe, selectedImage, filteredImages]);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="mobile-gallery">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="category-filter">
          <div className="category-scroll">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div 
        ref={galleryRef}
        className="gallery-grid"
        role="grid"
        aria-label="Tattoo gallery"
      >
        {displayedImages.map((image, index) => (
          <div
            key={image.id}
            className="gallery-item"
            role="gridcell"
            onClick={() => handleImageClick(image)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleImageClick(image);
              }
            }}
            tabIndex={0}
            aria-label={`View ${image.alt}`}
          >
            <div className="image-container">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                placeholder={image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={image.blurDataURL}
                loading={index < 6 ? 'eager' : 'lazy'}
                className="gallery-image"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              <div className="image-overlay">
                <span className="view-icon">👁️</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Loading more images...</span>
        </div>
      )}

      {/* Load More Trigger */}
      {enableInfiniteScroll && displayedImages.length < filteredImages.length && (
        <div ref={loadMoreRef} className="load-more-trigger" />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="image-modal"
          onClick={handleCloseModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="modal-header">
            <button 
              onClick={handleCloseModal}
              className="close-button"
              aria-label="Close image"
            >
              ✕
            </button>
          </div>
          
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-image-container"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                transition: zoomLevel === 1 ? 'transform 0.3s ease' : 'none',
              }}
            >
              <Image
                ref={imageRef}
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={selectedImage.width}
                height={selectedImage.height}
                className="modal-image"
                priority
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {enableSwipe && filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe('right');
                }}
                className="nav-arrow nav-prev"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe('left');
                }}
                className="nav-arrow nav-next"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Zoom Controls */}
          {enableZoom && (
            <div className="zoom-controls">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
                }}
                className="zoom-button"
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.min(prev + 0.5, 3));
                }}
                className="zoom-button"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          )}

          {/* Image Info */}
          <div className="image-info">
            <h3>{selectedImage.alt}</h3>
            <p>Category: {selectedImage.category}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-gallery {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        .category-filter {
          padding: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid #333;
        }

        .category-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-button {
          flex-shrink: 0;
          padding: 8px 16px;
          background: #2a2a2a;
          color: #ccc;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          touch-action: manipulation;
          min-height: 44px;
        }

        .category-button.active {
          background: #ff6b35;
          color: white;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 0 16px;
        }

        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }

        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1a1a;
          transition: transform 0.2s ease;
          touch-action: manipulation;
        }

        .gallery-item:hover {
          transform: scale(1.02);
        }

        .gallery-item:focus {
          outline: 2px solid #ff6b35;
          outline-offset: 2px;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: filter 0.3s ease;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-item:hover .image-overlay {
          opacity: 1;
        }

        .view-icon {
          font-size: 24px;
        }

        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px;
          color: #ccc;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #333;
          border-top: 3px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .load-more-trigger {
          height: 10px;
        }

        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 100;
          display: flex;
          flex-direction: column;
          touch-action: pan-x pan-y;
        }

        .modal-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 101;
          padding: 16px;
          display: flex;
          justify-content: flex-end;
        }

        .close-button {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          font-size: 20px;
          cursor: pointer;
          touch-action: manipulation;
        }

        .modal-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .modal-image-container {
          max-width: 100%;
          max-height: 100%;
          transform-origin: center;
        }

        .modal-image {
          max-width: 100vw;
          max-height: 100vh;
          object-fit: contain;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          font-size: 24px;
          cursor: pointer;
          z-index: 101;
          touch-action: manipulation;
        }

        .nav-prev {
          left: 16px;
        }

        .nav-next {
          right: 16px;
        }

        .zoom-controls {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 16px;
          border-radius: 24px;
          z-index: 101;
        }

        .zoom-button {
          background: none;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          touch-action: manipulation;
        }

        .zoom-level {
          color: white;
          font-size: 14px;
          font-weight: 500;
          min-width: 40px;
          text-align: center;
        }

        .image-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 24px 16px 16px;
          z-index: 101;
        }

        .image-info h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .image-info p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        @supports (padding: env(safe-area-inset-bottom)) {
          .image-info {
            padding-bottom: calc(16px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}
