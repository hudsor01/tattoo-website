/**
 * Design Detail Component
 * 
 * Displays details of a specific tattoo design with booking options.
 * Enhanced with analytics tracking and related designs.
 * Uses tRPC hooks for data fetching and interactions.
 */
'use client';

import { useState, useEffect } from 'react';
import { useDesign } from '@/hooks/trpc/use-gallery';
import { usePopularDesigns } from '@/hooks/use-analytics';
import { useEventTracking } from '@/hooks/use-page-view-tracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ChevronLeft, 
  InfoIcon, 
  RulerIcon, 
  ShareIcon,
  CheckCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/styling';

interface DesignDetailProps {
  id: string;
}

export function DesignDetail({ id }: DesignDetailProps) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Track page view
  const { track } = useEventTracking();
  
  // Fetch the design data
  const { design, isLoading } = useDesign(id);
  
  // Get related designs (popular designs in the same category)
  const { data: popularDesigns } = usePopularDesigns(4);
  
  // Track design view
  useEffect(() => {
    if (design && !isLoading) {
      track('design_view', id, { 
        designName: design.name,
        designType: design.designType,
        artistId: design.artistId
      });
    }
  }, [design, id, isLoading, track]);
  
  // Handle back navigation
  const handleBack = () => {
    router.back();
  };
  
  // Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: design?.name || 'Tattoo Design',
        text: `Check out this awesome tattoo design from Ink 37: ${design?.name}`,
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing', error);
      });
    } else {
      // Copy link to clipboard if Web Share API not available
      navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 3000);
    }
  };
  
  // Handle booking click
  const handleBooking = () => {
    // Track booking started
    if (design) {
      track('booking_started', id, {
        designName: design.name,
        designType: design.designType,
      });
    }
    
    // Navigate to booking page
    router.push(`/booking?designId=${id}`);
  };
  
  // We shouldn't hit this but just in case
  if (!design && !isLoading) {
    return (
      <div className="text-center py-16">
        <InfoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Design Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The design you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBack} variant="default">
          Back to Gallery
        </Button>
      </div>
    );
  }
  
  // Filter related designs to exclude current design
  const relatedDesigns = popularDesigns?.filter(d => d.id !== id) || [];
  
  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <Button
        variant="ghost"
        className="group"
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </Button>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square w-full bg-muted/30 rounded-lg overflow-hidden">
          {design?.fileUrl ? (
            <Image
              src={design.fileUrl}
              alt={design.name}
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : design?.thumbnailUrl ? (
            <Image
              src={design.thumbnailUrl}
              alt={design.name}
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <InfoIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold">{design?.name}</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleShare}
                className="relative"
              >
                <ShareIcon className="h-5 w-5" />
                {showShareModal && (
                  <div className="absolute bottom-full mb-2 right-0 bg-primary text-primary-foreground px-3 py-1 rounded text-sm whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </Button>
            </div>
            
            {design?.designType && (
              <Badge variant="secondary" className="mt-2">
                {design.designType}
              </Badge>
            )}
          </div>
          
          {design?.description && (
            <p className="text-base text-muted-foreground">
              {design.description}
            </p>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Added</p>
              <p className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                {design?.createdAt && format(new Date(design.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
            
            {design?.size && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Size</p>
                <p className="flex items-center text-sm">
                  <RulerIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  {design.size}
                </p>
              </div>
            )}
          </div>
          
          {design?.artist?.user && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Artist</p>
              <Link 
                href={`/artists/${design.artist.id}`}
                className="flex items-center gap-3 group"
              >
                <Avatar className="h-10 w-10">
                  {design.artist.user.image ? (
                    <AvatarImage src={design.artist.user.image} alt={design.artist.user.name || 'Artist'} />
                  ) : (
                    <AvatarFallback>
                      {design.artist.user.name ? design.artist.user.name.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {design.artist.user.name}
                  </p>
                  {design.artist.specialty && (
                    <p className="text-sm text-muted-foreground">
                      {design.artist.specialty}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={handleBooking}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book This Design
            </Button>
          </div>
        </div>
      </div>
      
      {/* Related designs section */}
      {relatedDesigns.length > 0 && (
        <div className="pt-8">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedDesigns.map((relatedDesign) => (
              <Link 
                href={`/gallery/${relatedDesign.id}`} 
                key={relatedDesign.id}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                <Card className="overflow-hidden h-full transition-all hover:shadow-md hover:translate-y-[-2px]">
                  <div className="relative h-48 bg-muted/20">
                    {relatedDesign.thumbnailUrl ? (
                      <Image
                        src={relatedDesign.thumbnailUrl}
                        alt={relatedDesign.name}
                        className="object-cover"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <InfoIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium line-clamp-1">{relatedDesign.name}</h3>
                      {relatedDesign.designType && (
                        <Badge variant="secondary" className="text-xs">
                          {relatedDesign.designType}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
