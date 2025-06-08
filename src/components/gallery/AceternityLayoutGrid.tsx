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

interface Card extends Pick<TattooDesign, 'id'> {
  content: JSX.Element;
  className: string;
  thumbnail: string;
  designData: TattooDesign;
}

export const AceternityLayoutGrid = ({ designs }: { designs: TattooDesign[] }) => {
const [selected, setSelected] = useState<Card | null>(null);
const [lastSelected, setLastSelected] = useState<Card | null>(null);
const [shareDialogOpen, setShareDialogOpen] = useState(false);
const [sharingDesign, setSharingDesign] = useState<TattooDesign | null>(null);
const router = useRouter();

// Add scroll lock when lightbox is open
React.useEffect(() => {
  if (selected) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  // Cleanup on unmount
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [selected]);

const handleOutsideClick = useCallback(() => {
  setLastSelected(selected);
  setSelected(null);
}, [selected]);

// Handle keyboard events
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && selected) {
      handleOutsideClick();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [selected, handleOutsideClick]);

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
              // Navigate to book-consultation page with design parameter
              router.push(`/book-consultation?design=${encodeURIComponent(design.name)}&id=${design.id}`);
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


  return (
  <>
  <div className="w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-6 relative">
  
  {/* Professional Backdrop with Blur */}
  <motion.div
    onClick={handleOutsideClick}
    className={cn(
      "fixed inset-0 bg-black/80 backdrop-blur-md z-[900]",
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
                onClose={handleOutsideClick}
                setSharingDesign={setSharingDesign}
                setShareDialogOpen={setShareDialogOpen}
                router={router}
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
          imageUrl={sharingDesign.thumbnailUrl ?? sharingDesign.fileUrl ?? undefined}
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
          className="transition-transform duration-500 group-hover:scale-105 object-cover object-center"
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
  onClose,
  setSharingDesign,
  setShareDialogOpen,
  router
}: { 
  selected: Card | null, 
  onClose: () => void,
  setSharingDesign: (design: TattooDesign | null) => void,
  setShareDialogOpen: (open: boolean) => void,
  router: ReturnType<typeof useRouter>
}) => {
  const isVideo = selected?.thumbnail ? ['.mov', '.mp4', '.webm'].some(ext => selected.thumbnail.endsWith(ext)) : false;

  const handleShare = (design: TattooDesign | undefined) => {
    if (!design) return;
    
    // Directly open the custom share dialog
    setSharingDesign(design);
    setShareDialogOpen(true);
  };

  
  return (
    <>
      <div 
        className="max-w-5xl max-h-[95vh] w-full h-full flex flex-col bg-transparent rounded-2xl overflow-hidden relative z-[960]"
        data-testid="gallery-zoom-view"
        onClick={(e) => e.stopPropagation()}

      >
        {/* Image/Video container with professional styling */}
        <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl">
          {/* Close button - prominent black box with white X positioned inside the image */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            data-testid="gallery-close-button"
            className="absolute top-4 right-4 z-[1000] bg-black hover:bg-gray-800 transition-all duration-200 rounded-lg p-3 shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Close gallery item"
          >
            <X className="h-6 w-6 text-white font-bold stroke-[3]" />
          </button>

          {/* Book CTA Button - Bottom Left Corner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 z-[1000]"
          >
            <Button
              className="bg-fernando-gradient hover:bg-fernando-gradient-hover text-white text-sm sm:text-base md:text-lg px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 h-auto font-bold transition-all duration-300 hover:scale-105 shadow-2xl rounded-lg sm:rounded-xl border-2 border-white/20 hover:border-white/40 backdrop-blur-sm whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                const designName = selected?.designData.name ?? '';
                const designId = selected?.designData.id ?? '';
                router.push(`/book-consultation?design=${encodeURIComponent(designName)}&id=${designId}`);
              }}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Book This Design</span>
              <span className="sm:hidden">Book Now</span>
            </Button>
          </motion.div>

          {/* Share CTA Button - Bottom Right Corner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-[1000]"
          >
            <Button
              className="bg-fernando-gradient hover:bg-fernando-gradient-hover text-white text-sm sm:text-base md:text-lg px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 h-auto font-bold transition-all duration-300 hover:scale-105 shadow-2xl rounded-lg sm:rounded-xl border-2 border-white/20 hover:border-white/40 backdrop-blur-sm whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                handleShare(selected?.designData);
              }}
            >
              <Share className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Share This Design</span>
              <span className="sm:hidden">Share</span>
            </Button>
          </motion.div>
          {isVideo ? (
            <video
              src={selected?.thumbnail}
              className="w-full h-full object-contain bg-black rounded-2xl"
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
              className="object-contain rounded-2xl"
              alt={`${selected?.designData.name} - Full view`}
              quality={100}
            />
          )}
        </div>


      </div>
    </>
  );
};

export default AceternityLayoutGrid;
