'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Heart, ExternalLink } from 'lucide-react';
import { useGalleryAnalytics } from '@/hooks/use-analytics';

import { type GalleryItemProps } from '@/types/component-types';

const GalleryItemCard: React.FC<GalleryItemProps> = ({
  id,
  title,
  description,
  imageUrl,
  artist,
  tags = [],
  position,
  className = '',
  onOpen,
}) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const { trackDesignView, trackDesignFavorite, trackDesignUnfavorite, trackDesignShare } =
    useGalleryAnalytics();

  // Track design open/view
  const handleOpenDetails = () => {
    // Track the view
    trackDesignView(id, tags?.length ? tags[0] : undefined, artist, tags);

    // Call the onOpen handler if provided
    if (onOpen) {
      onOpen(id);
    } else {
      // Otherwise navigate to the design detail page
      router.push(`/gallery/${id}`);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Update state
    const newValue = !isFavorite;
    setIsFavorite(newValue);

    // Track the action
    if (newValue) {
      trackDesignFavorite(id, tags?.length ? tags[0] : undefined);
    } else {
      trackDesignUnfavorite(id, tags?.length ? tags[0] : undefined);
    }
  };

  // Share design
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Track the share
    trackDesignShare(id, tags?.length ? tags[0] : undefined);

    // Create share URL
    const shareUrl = `${window.location.origin}/gallery/${id}`;

    // Use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: description || `Check out this tattoo design: ${title}`,
          url: shareUrl,
        })
        .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          // You can add a toast notification here
          console.log('Link copied to clipboard');
        })
        .catch(error => console.error('Could not copy link:', error));
    }
  };

  return (
    <Card
      className={`overflow-hidden h-full hover:shadow-md transition-shadow group ${className}`}
      onClick={handleOpenDetails}
    >
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={position !== undefined && position < 8}
        />

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700'}`}
            />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 stroke-gray-700" />
          </Button>
        </div>
      </div>

      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-lg font-medium line-clamp-1">{title}</CardTitle>
        {artist && <CardDescription className="text-sm">Artist: {artist}</CardDescription>}
      </CardHeader>

      {tags && tags.length > 0 && (
        <CardContent className="p-3 pt-2 pb-2">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="p-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs gap-1 hover:bg-transparent hover:text-primary"
        >
          <span>View Details</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GalleryItemCard;
