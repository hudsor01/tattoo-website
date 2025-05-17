/**
 * Carousel component type definitions
 */
import type { ReactNode } from 'react';

export interface CarouselApi {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
  scrollTo: (index: number) => void;
}

export interface CarouselProps {
  orientation?: 'horizontal' | 'vertical';
  opts?: {
    axis?: 'x' | 'y';
    align?: 'start' | 'center' | 'end';
    loop?: boolean;
    skipSnaps?: boolean;
    dragFree?: boolean;
    containScroll?: 'trimSnaps' | 'keepSnaps' | false;
    slidesToScroll?: number;
    duration?: number;
  };
  setApi?: (api: CarouselApi | undefined) => void;
  plugins?: any[];
  children?: ReactNode;
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
}

export interface CarouselContext {
  api?: CarouselApi;
  orientation?: CarouselProps['orientation'];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollTo: (index: number) => void;
}