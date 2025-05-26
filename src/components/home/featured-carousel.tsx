'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type FeaturedImage = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

interface FeaturedCarouselProps {
  images: FeaturedImage[];
  autoPlayInterval?: number;
  className?: string;
  aspectRatio?: 'portrait' | 'square';
  showControls?: boolean;
  showDots?: boolean;
  showInfo?: boolean;
}

export default function FeaturedCarousel({
  images,
  autoPlayInterval = 5000,
  className,
  aspectRatio = 'portrait',
  showControls = true,
  showDots = true,
  showInfo = true,
}: FeaturedCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  // Auto-play functionality
  void React.useEffect(() => {
    if (!api || !autoPlayInterval) return undefined;

    const intervalId = setInterval(() => {
      void api.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(intervalId);
  }, [api, autoPlayInterval]);

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      setApi={setApi}
      className={cn('w-full', className)}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.src} className="relative">
            <div
              className={cn(
                'overflow-hidden rounded-xl relative',
                aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square',
                'border-2 border-gradient-to-r border-red-500 border-orange-500 shadow-lg'
              )}
            >
              {/* Efficient border gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, #ef4444, #f97316)',
                  borderRadius: '0.75rem',
                  padding: '2px',
                }}
              >
                <div className="absolute inset-[2px] rounded-[calc(0.75rem-2px)] overflow-hidden z-10">
                  <Image
                    src={image.src}
                    alt={
                      image.alt ||
                      `Professional tattoo design by Ink 37 - Custom tattoo art in Crowley, TX`
                    }
                    fill
                    priority={index < 3}
                    quality={90}
                    sizes="(max-width: 768px) 90vw, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* Image overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>

                  {/* Image information */}
                  {showInfo && (image.title ?? image.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      {image.title && (
                        <h3 className="text-white text-lg font-semibold mb-1">{image.title}</h3>
                      )}
                      {image.description && (
                        <p className="text-white/80 text-sm">{image.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && (
        <>
          <CarouselPrevious className="left-2 bg-black/50 hover:bg-black/70 border-none text-white" />
          <CarouselNext className="right-2 bg-black/50 hover:bg-black/70 border-none text-white" />
        </>
      )}

      {showDots && <CarouselDots count={images.length} className="mt-4" />}
    </Carousel>
  );
}
