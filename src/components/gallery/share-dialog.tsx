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
  imageUrl,
}: ShareDialogProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: SharePlatform) => {
    setIsLoading((prev) => ({ ...prev, [platform]: true }));

    try {
      if (platform === 'copy') {
        const url = `${window.location.origin}/gallery/${contentId}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsLoading((prev) => ({ ...prev, [platform]: false }));
        return;
      }

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

      if (platform !== 'email') {
        void window.open(result.shareUrl, '_blank', 'noopener,noreferrer');
      } else {

        window.location.href = result.shareUrl;
      }

      // Show enhanced success toast with animation
      toast({
        title: '✨ Shared successfully!',
        description: `Your tattoo design has been shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Thank you for spreading the word!`,
        duration: 4000,
      });

      // Close dialog after successful share
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
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
        title: '📋 Link copied!',
        description: 'Share link has been copied to your clipboard. Paste it anywhere to share this design!',
        duration: 3000,
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
    image: imageUrl,
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
    { name: 'email' as SharePlatform, icon: Mail, color: 'bg-steel hover:bg-charcoal' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Share this {contentType}</DialogTitle>
          <DialogDescription>Share "{title}" with your friends and followers</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Preview card */}
          <div className="border rounded-md p-3 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-muted rounded-md shrink-0 overflow-hidden">
                <Image
                  src={shareMetadata.image ?? '/placeholder.svg'}
                  alt={
                    shareMetadata.title
                      ? `${shareMetadata.title} - Professional tattoo design by Ink 37`
                      : 'Professional tattoo design by Ink 37 - Custom tattoo art in Crowley, TX'
                  }
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {

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
          
          {/* Separator */}
          <hr className="my-3 border-border" />

          {/* Copy Link Section */}
          <div>
            <label htmlFor="share-link-input" className="text-sm font-medium text-foreground mb-1 block">
              Or copy link
            </label>
            <div className="flex items-center space-x-2">
              <Input 
                id="share-link-input"
                value={shareUrl || previewUrl} 
                readOnly 
                className="flex-1 text-sm" 
                aria-label="Shareable link"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => void copyToClipboard(shareUrl || previewUrl)}
                aria-label="Copy link to clipboard"
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
