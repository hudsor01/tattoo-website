'use client';

import { useState } from 'react';
import { logger } from "@/lib/logger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shareContent } from '@/lib/api';
import { Facebook, Twitter, Instagram, Mail, Copy, Check, Loader2, Linkedin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
// Define share types locally since they're not in the database schema
type SharePlatform = 'facebook' | 'twitter' | 'instagram' | 'email' | 'copy' | 'linkedin';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'tattoo' | 'video';
  contentId: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

interface ShareMetadata {
  title: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  url: string;
}

interface ShareButton {
  name: SharePlatform;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  title,
}: ShareDialogProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: SharePlatform) => {
    setIsLoading((prev) => ({ ...prev, [platform]: true }));

    try {
      // Handle copy platform separately since it's not in the API
      if (platform === 'copy') {
        const url = `${window.location.origin}/gallery/${contentId}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsLoading((prev) => ({ ...prev, [platform]: false }));
        return;
      }

      // Only call shareContent for supported platforms
      const supportedPlatforms = ['facebook', 'twitter', 'instagram', 'email', 'linkedin'] as const;
      if (!supportedPlatforms.includes(platform as typeof supportedPlatforms[number])) {
        return;
      }
      
      const result = await shareContent(
        contentType, 
        contentId, 
        platform as 'facebook' | 'twitter' | 'instagram' | 'email' | 'linkedin'
      );
      setShareUrl(result.shareUrl);

      // Open the share URL in a new window for social platforms
      if (platform !== 'email') {
        void window.open(result.shareUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For email, we'll just open the mailto link
        window.location.href = result.shareUrl;
      }

      toast({
        title: 'Shared successfully',
        description: `Content shared on ${platform}`,
      });
    } catch (error) {
      void logger.error('Share error:', error);
      toast({
        title: 'Share failed',
        description: 'Could not share content. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Link copied to clipboard successfully',
      });
    } catch (err) {
      void logger.error('Failed to copy:', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard. Please try manually.',
        variant: 'error',
      });
    }
  };

  // Generate a preview URL for the content
  const previewUrl = `${window.location.origin}/gallery/${contentId}`;

  // Generate metadata for sharing
  const shareMetadata: ShareMetadata = {
    title: title,
    description: `Check out this amazing ${contentType} design by Fernando Govea at Ink 37 Tattoos`,
    url: previewUrl,
    image: `/images/${contentId}`, // Use direct image path for file-based gallery
  };

  const shareButtons: ShareButton[] = [
    { name: 'facebook' as SharePlatform, icon: Facebook, color: 'bg-[#1877F2] hover:bg-[#0E65D9]' },
    { name: 'twitter' as SharePlatform, icon: Twitter, color: 'bg-[#1DA1F2] hover:bg-[#0C90E1]' },
    { name: 'linkedin' as SharePlatform, icon: Linkedin, color: 'bg-[#0A66C2] hover:bg-[#004182]' },
    {
      name: 'instagram' as SharePlatform,
      icon: Instagram,
      color: 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90',
    },
    { name: 'email' as SharePlatform, icon: Mail, color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this {contentType}</DialogTitle>
          <DialogDescription>Share "{title}" with your friends and followers</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Preview card */}
          <div className="border rounded-md p-3 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                <Image
                  src={shareMetadata.image ?? '/placeholder.svg'}
                  alt={
                    shareMetadata.title
                      ? `${shareMetadata.title} - Professional tattoo design by Ink 37`
                      : 'Professional tattoo design by Ink 37 - Custom tattoo art in Crowley, TX'
                  }
                  width={64}
                  height={64}
                  className="w-full h-full"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = '/placeholder.svg?height=64&width=64';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{shareMetadata.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {shareMetadata.description}
                </p>
                <p className="text-xs text-primary mt-1 truncate">{shareMetadata.url}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {shareButtons.map((button) => (
              <Button
                key={button.name}
                className={`${button.color} text-white`}
                onClick={() => void handleShare(button.name as SharePlatform)}
                disabled={isLoading[button.name]}
              >
                {isLoading[button.name] ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <button.icon className="h-5 w-5 mr-2" />
                )}
                {button.name.charAt(0).toUpperCase() + button.name.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Input value={shareUrl ?? previewUrl} readOnly className="flex-1" />
            <Button
              size="icon"
              onClick={() => void copyToClipboard(shareUrl ?? previewUrl)}
              aria-label="Copy link to clipboard"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            <p>Sharing this content will include the title, description, and a preview image.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
