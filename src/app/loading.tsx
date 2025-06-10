/**
 * Global Loading Component
 * 
 * High-quality, adaptive loading state that provides appropriate skeletons
 * for different page types based on the current route context.
 */

'use client';

import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Loading variant types based on page content
type LoadingVariant = 'default' | 'about' | 'contact' | 'services' | 'gallery' | 'booking' | 'faq';

function getLoadingVariant(pathname: string): LoadingVariant {
  if (pathname.includes('/about')) return 'about';
  if (pathname.includes('/contact')) return 'contact';
  if (pathname.includes('/services')) return 'services';
  if (pathname.includes('/gallery')) return 'gallery';
  if (pathname.includes('/booking') || pathname.includes('/book-consultation')) return 'booking';
  if (pathname.includes('/faq')) return 'faq';
  return 'default';
}

// Reusable skeleton components
function HeroSkeleton({ titleWidth = 'w-96', descriptionWidth = 'w-2xl' }: { titleWidth?: string; descriptionWidth?: string }) {
  return (
    <div className="text-center mb-16">
      <Skeleton className={`h-16 ${titleWidth} mx-auto mb-4 bg-muted/20`} />
      <Skeleton className={`h-6 ${descriptionWidth} mx-auto mb-8 bg-muted/20`} />
      <Skeleton className="h-1 w-24 mx-auto bg-muted/20" />
    </div>
  );
}

function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Image Skeleton */}
      <Skeleton className="h-[500px] rounded-xl bg-muted/20" />
      
      {/* Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4 bg-muted/20" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted/20" />
          <Skeleton className="h-4 w-full bg-muted/20" />
          <Skeleton className="h-4 w-3/4 bg-muted/20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted/20" />
          <Skeleton className="h-4 w-5/6 bg-muted/20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-muted/20" />
          <Skeleton className="h-4 w-4/5 bg-muted/20" />
        </div>
        <Skeleton className="h-12 w-48 bg-muted/20 rounded-md" />
      </div>
    </div>
  );
}

function ValuesGridSkeleton() {
  return (
    <div className="py-16 mt-12">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-80 mx-auto mb-4 bg-muted/20" />
        <Skeleton className="h-6 w-96 mx-auto bg-muted/20" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-6 rounded-lg border border-zinc-800">
            <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted/20" />
            <Skeleton className="h-8 w-32 mx-auto mb-3 bg-muted/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-muted/20" />
              <Skeleton className="h-4 w-4/5 mx-auto bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Contact Form Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
        <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
        <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
        <Skeleton className="h-32 w-full bg-muted/20 rounded-md" />
        <Skeleton className="h-12 w-full bg-muted/20 rounded-md" />
      </div>
      
      {/* Contact Info Skeleton */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-muted/20" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 bg-muted/20 rounded" />
                <Skeleton className="h-5 w-40 bg-muted/20" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-32 bg-muted/20" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full bg-muted/20" />
            <Skeleton className="h-5 w-5/6 bg-muted/20" />
            <Skeleton className="h-5 w-4/5 bg-muted/20" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 bg-muted/20" />
          <div className="flex space-x-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 bg-muted/20 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesGridSkeleton() {
  return (
    <>
      {/* Services Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
            {/* Service Image Skeleton */}
            <Skeleton className="h-48 w-full bg-muted/20" />
            
            {/* Service Content Skeleton */}
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4 bg-muted/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-muted/20" />
                <Skeleton className="h-4 w-5/6 bg-muted/20" />
                <Skeleton className="h-4 w-4/5 bg-muted/20" />
              </div>
              
              {/* Price Skeleton */}
              <div className="flex items-center justify-between pt-4">
                <Skeleton className="h-6 w-24 bg-muted/20" />
                <Skeleton className="h-10 w-28 bg-muted/20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* CTA Section Skeleton */}
      <div className="text-center mt-16 space-y-6">
        <Skeleton className="h-12 w-80 mx-auto bg-muted/20" />
        <Skeleton className="h-6 w-96 mx-auto bg-muted/20" />
        <Skeleton className="h-12 w-48 mx-auto bg-muted/20 rounded-md" />
      </div>
    </>
  );
}

function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="group relative overflow-hidden rounded-lg bg-zinc-900/50 border border-zinc-800">
          <Skeleton className="aspect-square w-full bg-muted/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 space-y-2">
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-4 w-16 bg-white/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FAQSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border border-zinc-800 rounded-lg p-6 space-y-3">
          <Skeleton className="h-6 w-3/4 bg-muted/20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-muted/20" />
            <Skeleton className="h-4 w-5/6 bg-muted/20" />
            <Skeleton className="h-4 w-4/5 bg-muted/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <ContentGridSkeleton />
    </>
  );
}

export default function GlobalLoading() {
  const pathname = usePathname();
  const variant = getLoadingVariant(pathname);

  // For booking pages, use simple spinner
  if (variant === 'booking') {
    return <BookingSkeleton />;
  }

  // Main loading layout for content pages
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="w-full max-w-none px-6 py-16 pt-24">
        {variant === 'about' && (
          <>
            <HeroSkeleton />
            <ContentGridSkeleton />
            <ValuesGridSkeleton />
          </>
        )}

        {variant === 'contact' && (
          <>
            <HeroSkeleton titleWidth="w-80" />
            <ContactFormSkeleton />
          </>
        )}

        {variant === 'services' && (
          <>
            <HeroSkeleton />
            <ServicesGridSkeleton />
          </>
        )}

        {variant === 'gallery' && (
          <>
            <HeroSkeleton titleWidth="w-64" descriptionWidth="w-xl" />
            <GalleryGridSkeleton />
          </>
        )}

        {variant === 'faq' && (
          <>
            <HeroSkeleton titleWidth="w-80" descriptionWidth="w-2xl" />
            <FAQSkeleton />
          </>
        )}

        {variant === 'default' && <DefaultSkeleton />}
      </div>
    </main>
  );
}