"use client";

import React, { JSX, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/styling";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "./share-dialog";
import { Share, Calendar, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TattooDesign } from "@prisma/client";
import Cal, { getCalApi } from "@calcom/embed-react";

// Cal.com integration config - use process.env safely
const CAL_USERNAME = typeof window === 'undefined' 
  ? process.env['NEXT_PUBLIC_CAL_USERNAME'] ?? 'ink37tattoos'
  : 'ink37tattoos';
const CAL_EVENT_SLUG = 'consultation';

interface BookerProps {
  eventSlug: string;
  username: string;
  onCreateBookingSuccess?: () => void;
}

type Card = {
  id: string;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
  designData: TattooDesign;
};

export const AceternityLayoutGrid = ({ designs }: { designs: TattooDesign[] }) => {
const [selected, setSelected] = useState<Card | null>(null);
const [lastSelected, setLastSelected] = useState<Card | null>(null);
const [shareDialogOpen, setShareDialogOpen] = useState(false);
const [sharingDesign, setSharingDesign] = useState<TattooDesign | null>(null);
const [showDetailedView, setShowDetailedView] = useState(false);
const [showBooking, setShowBooking] = useState(false);
const router = useRouter();

const handleOutsideClick = useCallback(() => {
  setLastSelected(selected);
  setSelected(null);
  setShowDetailedView(false);
  setShowBooking(false); // Also close booking
}, [selected]);

// Handle keyboard events
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (showBooking) {
        setShowBooking(false);
      } else if (selected) {
        handleOutsideClick();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [selected, showBooking, handleOutsideClick]);

  // Convert designs to cards format
  const cards: Card[] = designs.map((design, index) => ({
    id: design.id,
    content: (
      <div className="text-white">
        <h3 className="font-bold text-xl mb-2">{design.name}</h3>
        {design.description && <p className="text-sm mb-4 opacity-90">{design.description}</p>}
        <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-fernando-gradient text-white border-none hover:bg-fernando-gradient-hover"
            onClick={(e) => {
              e.stopPropagation();
              setShowBooking(true);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book This Design
          </Button>
          <Button 
            variant="outline" 
            className="bg-transparent border-white text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setSharingDesign(design);
              setShareDialogOpen(true);
            }}
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    ),
    className: index === 0 
      ? "md:col-span-2 md:row-span-2" 
      : index % 5 === 4 
        ? "md:col-span-2"
        : "",
    thumbnail: design.fileUrl ?? design.thumbnailUrl ?? '/images/placeholder.jpg',
    designData: design
  }));

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleViewDetails = (designId: string) => {
    setShowDetailedView(!showDetailedView);
  };

  return (
  <>
  <div className="w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-6 relative">
  
  {/* Backdrop - render first so it's behind content */}
  <motion.div
    onClick={handleOutsideClick}
    className={cn(
      "fixed inset-0 bg-black/30 z-[900]",
      selected?.id ? "pointer-events-auto" : "pointer-events-none"
    )}
    animate={{ opacity: selected?.id ? 1 : 0 }}
  />

  {cards.map((card) => (
        <div key={card.id} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            data-testid={`gallery-item-${card.id}`}
            className={cn(
              "relative overflow-hidden cursor-pointer",
              selected?.id === card.id
                ? "fixed inset-0 z-[950] flex justify-center items-center"
                : lastSelected?.id === card.id
                ? "z-40 bg-black rounded-xl h-full w-full"
                : "bg-black rounded-xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
            transition={{ duration: 0.4 }}
          >
            {selected?.id === card.id ? (
              <SelectedCard 
                selected={selected} 
                onViewDetails={() => handleViewDetails(card.id)}
                onClose={handleOutsideClick}
                setSharingDesign={setSharingDesign}
                setShareDialogOpen={setShareDialogOpen}
                showDetailedView={showDetailedView}
                setShowDetailedView={setShowDetailedView}
                showBooking={showBooking}
                setShowBooking={setShowBooking}
              />
            ) : (
              <ImageComponent card={card} />
            )}
          </motion.div>
        </div>
      ))}

      {/* Share Dialog */}
      {sharingDesign && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          contentType="tattoo"
          contentId={sharingDesign.id}
          title={sharingDesign.name}
        />
      )}

      </div>
      </>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  const isVideo = ['.mov', '.mp4', '.webm'].some(ext => card.thumbnail.endsWith(ext));
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Auto-play video when component mounts
  React.useEffect(() => {
    if (isVideo && videoRef.current) {
      void videoRef.current.play();
    }
  }, [isVideo]);
  
  return (
    <div className="relative w-full h-full aspect-[3/4] group">
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={card.thumbnail}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
            preload="metadata"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
          {/* Video indicator */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      ) : (
        <Image
          src={card.thumbnail}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-105"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          alt={`Tattoo design: ${card.designData.name} - Professional tattoo art by Fernando Govea`}
          priority={false}
          quality={90}
        />
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60" />
    </div>
  );
};

const SelectedCard = ({ 
  selected, 
  onViewDetails, 
  onClose, 
  setSharingDesign, 
  setShareDialogOpen, 
  showDetailedView, 
  setShowDetailedView,
  showBooking,
  setShowBooking
}: { 
  selected: Card | null, 
  onViewDetails: () => void,
  onClose: () => void,
  setSharingDesign: (design: TattooDesign | null) => void,
  setShareDialogOpen: (open: boolean) => void,
  showDetailedView: boolean,
  setShowDetailedView: (show: boolean) => void,
  showBooking: boolean,
  setShowBooking: (show: boolean) => void
}) => {
  const isVideo = selected?.thumbnail ? ['.mov', '.mp4', '.webm'].some(ext => selected.thumbnail.endsWith(ext)) : false;

  // Cal.com Booker Component
  const CalBooker = ({ eventSlug, username, onCreateBookingSuccess }: BookerProps) => {
    React.useEffect(() => {
      void (async function () {
        const cal = await getCalApi();
        
        // Listen for booking success events
        cal("on", {
          action: "bookingSuccessful",
          callback: (_e) => {
            if (onCreateBookingSuccess) {
              try {
                onCreateBookingSuccess();
              } catch (error: unknown) {
                console.error('Error in booking success callback:', error);
              }
            }
            // Close booking modal after successful booking
            setShowBooking(false);
          }
        });
      })();
    }, [onCreateBookingSuccess, eventSlug, username]);

    return (
      <div className="w-full min-h-[700px] h-full">
        <Cal
          calLink={`${username}/${eventSlug}`}
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{
            layout: "month_view",
            theme: "light"
          }}
        />
      </div>
    );
  };
  
  return (
    <>
      <div 
        className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col bg-ink-black rounded-xl overflow-hidden shadow-2xl relative z-[960]"
        data-testid="gallery-zoom-view"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking on content
      >
        {/* Enhanced Close button - square with rounded corners */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onClose();
          }}
          data-testid="gallery-close-button"
          className="absolute top-4 right-4 z-[990] bg-ink-black hover:bg-charcoal text-white rounded-xl p-4 transition-all duration-200 hover:scale-105 border-2 border-white shadow-2xl cursor-pointer"
          aria-label="Close gallery item"
          style={{ minWidth: '48px', minHeight: '48px' }}
        >
          <X className="h-7 w-7" />
        </button>

        {/* Image/Video container */}
        <div className="flex-1 relative">
          {isVideo ? (
            <video
              src={selected?.thumbnail}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={selected?.thumbnail ?? '/images/placeholder.jpg'}
              fill
              className="object-contain"
              alt={`${selected?.designData.name} - Full view`}
              quality={100}
            />
          )}
        </div>

        {/* Content overlay - repositioned to avoid edge overflow */}
        {!showBooking && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, y: 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`absolute bottom-4 left-4 right-20 max-w-[calc(100%-7rem)] ${showDetailedView ? 'sm:max-w-2xl lg:max-w-3xl' : 'sm:max-w-sm lg:max-w-md'} bg-ink-black/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border-2 border-white/30 shadow-2xl z-[975]`}
            style={{
              maxHeight: showDetailedView ? '60vh' : '40vh'
            }}
          >
            <div className="space-y-2 sm:space-y-3 overflow-y-auto">
              {/* Design title and description - with text overflow handling */}
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-lg md:text-xl text-white mb-1 truncate">
                  {selected?.designData.name}
                </h3>
                {selected?.designData.description && (
                  <p className={`text-xs md:text-sm text-white/80 leading-4 ${showDetailedView ? 'line-clamp-none' : 'overflow-hidden'}`}
                     style={showDetailedView ? {} : {
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical',
                       maxHeight: '2rem'
                     }}>
                    {selected.designData.description}
                  </p>
                )}
              </div>
              
              {/* Detailed information - only show when detailed view is active */}
              {showDetailedView && (
                <div className="space-y-2 border-t border-white/20 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-1">{selected?.designData.designType || 'Custom'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <span className="ml-1">{selected?.designData.size || 'Medium'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Artist:</span>
                      <span className="ml-1">{selected?.designData.artistName || 'Fernando Govea'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Style:</span>
                      <span className="ml-1">Professional</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    This design showcases the artistic expertise and attention to detail that defines our work at Ink 37 Tattoos. 
                    Each piece is carefully crafted to match our client's vision while maintaining the highest standards of tattoo artistry.
                  </p>
                </div>
              )}
              
              {/* Action buttons - responsive layout with overflow prevention */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <Button
                  className="bg-fernando-gradient text-white border-none hover:bg-fernando-gradient-hover text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-7 sm:h-9 w-full justify-center font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBooking(true);
                  }}
                >
                  <Calendar className="h-3 w-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span className="truncate">Book This Design</span>
                </Button>
                
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    onClick={onViewDetails}
                    variant="secondary"
                    className="bg-white/15 text-white hover:bg-white/25 border-2 border-white/30 hover:border-white/50 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-7 sm:h-9 flex-1 min-w-0 font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <span className="truncate">{showDetailedView ? 'Hide Details' : 'View Details'}</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-7 sm:h-9 flex-shrink-0 font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingDesign(selected?.designData ?? null);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share className="h-3 w-3 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cal.com Booking Modal - ALWAYS FUNCTIONAL */}
        {showBooking && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80">
            {/* GUARANTEED VISIBLE Close button */}
            <button
              onClick={() => setShowBooking(false)}
              data-testid="cal-modal-close-button"
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-lg p-3 transition-all duration-200 hover:scale-105 border-2 border-white shadow-2xl cursor-pointer z-[3000]"
              aria-label="Close booking modal"
              style={{ 
                minWidth: '56px', 
                minHeight: '56px'
              }}
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Cal.com modal container */}
            <div className="relative w-[90vw] max-w-7xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden mx-auto">
              {/* Header */}
              <div className="flex items-center justify-center p-4 border-b bg-black text-white">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Book Consultation</h3>
                  <p className="text-sm opacity-70">{selected?.designData.name}</p>
                </div>
              </div>
              
              {/* Cal.com embed */}
              <div className="h-full">
                <CalBooker
                  eventSlug={CAL_EVENT_SLUG}
                  username={CAL_USERNAME}
                  onCreateBookingSuccess={() => {
                    setShowBooking(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AceternityLayoutGrid;