'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { LightboxProps } from 'yet-another-react-lightbox';

// Loading component for lightbox
const LightboxSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
    <Skeleton className="h-[80vh] w-[80vw]" />
  </div>
);

// Dynamic import the main lightbox component
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), {
  loading: () => <LightboxSkeleton />,
  ssr: false,
});

// Static imports for plugins to avoid dynamic loading complexity
import Video from 'yet-another-react-lightbox/plugins/video';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

// CSS imports
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

export interface DynamicLightboxProps extends LightboxProps {
  open: boolean;
}

export function DynamicLightbox(props: DynamicLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Lightbox
      {...props}
      plugins={[Video, Captions, Counter, Fullscreen, Slideshow, Thumbnails, Zoom]}
      captions={{
        showToggle: true,
        descriptionTextAlign: 'center',
      }}
      counter={{
        container: { style: { top: 'unset', bottom: 0 } },
      }}
      thumbnails={{
        position: 'bottom',
        width: 120,
        height: 80,
        border: 2,
        borderRadius: 4,
        padding: 4,
        gap: 16,
        imageFit: 'cover',
      }}
      video={{
        autoPlay: false,
        controls: true,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: true,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
      carousel={{
        finite: true,
        preload: 2,
        padding: 0,
        spacing: 0,
        imageFit: 'contain',
      }}
      fullscreen={{
        auto: false,
      }}
      slideshow={{
        autoplay: false,
        delay: 3000,
      }}
      animation={{
        fade: 250,
        swipe: 250,
        easing: {
          fade: 'ease-in-out',
          swipe: 'ease-out',
          navigation: 'ease-in-out',
        },
      }}
    />
  );
}
