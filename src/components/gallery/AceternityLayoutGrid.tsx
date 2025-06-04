"use client";

import React, { JSX, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/styling";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "./share-dialog";
import { CalendarIcon, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TattooDesign } from "@prisma/client";

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
  const router = useRouter();

  // Convert designs to cards format
  const cards: Card[] = designs.map((design, index) => ({
    id: design.id,
    content: (
      <div className="text-white">
        <h3 className="font-bold text-xl mb-2">{design.name}</h3>
        {design.description && <p className="text-sm mb-4 opacity-90">{design.description}</p>}
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/booking?designId=${design.id}`);
            }}
            className="bg-linear-to-r from-red-600 from-[30%] via-[#FF3131] via-[55%] to-orange-500 text-white border-none"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
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

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  const handleViewDetails = (designId: string) => {
    router.push(`/gallery/${designId}`);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-6 relative">
      {cards.map((card) => (
        <div key={card.id} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              "relative overflow-hidden cursor-pointer",
              selected?.id === card.id
                ? "rounded-lg absolute inset-0 h-3/4 w-full md:w-2/3 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-black rounded-xl h-full w-full"
                : "bg-black rounded-xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
            transition={{ duration: 0.4 }}
          >
            {selected?.id === card.id && (
              <SelectedCard 
                selected={selected} 
                onViewDetails={() => handleViewDetails(card.id)}
              />
            )}
            <ImageComponent card={card} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "fixed inset-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.7 : 0 }}
      />

      {/* Share Dialog */}
      {sharingDesign && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          contentType="tattoo"
          contentId={parseInt(sharingDesign.id, 10)}
          title={sharingDesign.name}
        />
      )}
    </div>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <div className="relative w-full h-full aspect-[3/4]">
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
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-60" />
      
      {/* Title only shown in grid view */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-white font-medium truncate text-sm">{card.designData.name}</h3>
        {card.designData.designType && (
          <div className="mt-1 text-xs bg-black/30 text-white inline-block px-2 py-0.5 rounded">
            {card.designData.designType}
          </div>
        )}
      </div>
    </div>
  );
};

const SelectedCard = ({ selected, onViewDetails }: { 
  selected: Card | null, 
  onViewDetails: () => void
}) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-6 pt-6 z-[70]"
      >
        {selected?.content}
        <div className="mt-4">
          <Button
            onClick={onViewDetails}
            variant="secondary"
            className="mt-2 bg-white/10 text-white hover:bg-white/20 border-none"
          >
            View Details
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AceternityLayoutGrid;