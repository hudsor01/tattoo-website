'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/utils';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Instagram, ExternalLink } from 'lucide-react';

// Define Instagram post type
interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface InstagramFeedProps {
  username?: string;
  accessToken?: string;
  limit?: number;
  className?: string;
}

export function InstagramFeed({
  username = 'ink37tattoo',
  accessToken,
  limit = 12,
  className,
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    async function fetchInstagramPosts() {
      try {
        let token = accessToken;

        // If no token is provided, try to fetch it from our API
        if (!token) {
          const tokenResponse = await fetch('/api/instagram/token');
          if (!tokenResponse.ok) {
            throw new Error('Failed to fetch Instagram token');
          }
          const tokenData = await tokenResponse.json();
          token = tokenData.accessToken;
        }

        if (!token) {
          throw new Error('Instagram access token is missing');
        }

        // Using the Instagram Graph API
        const response = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`Instagram API error: ${response.statusText}`);
        }

        const data = await response.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('Error fetching Instagram posts:', err);
        setError('Failed to load Instagram posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (inView) {
      fetchInstagramPosts();
    }
  }, [accessToken, limit, inView]);

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Function to truncate caption
  const truncateCaption = (caption?: string, maxLength = 100) => {
    if (!caption) return '';
    return caption.length > maxLength ? `${caption.substring(0, maxLength)  }...` : caption;
  };

  // Loading placeholder
  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: limit }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <CardContent>
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <p className="text-sm text-muted-foreground">
            Follow us on Instagram at{' '}
            <a
              href={`https://instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @{username}
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fallback for no posts
  if (posts.length === 0) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <CardContent>
          <div className="flex justify-center mb-4">
            <Instagram size={32} className="text-tattoo-red" />
          </div>
          <h3 className="text-lg font-medium mb-2">Check Out Our Instagram</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Follow us on Instagram at{' '}
            <a
              href={`https://instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @{username}
            </a>{' '}
            to see our latest work.
          </p>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
          >
            <Instagram size={16} />
            View on Instagram
          </a>
        </CardContent>
      </Card>
    );
  }

  // Success state with posts
  return (
    <div ref={ref}>
      <motion.div
        className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {posts.map(post => (
          <motion.div key={post.id} variants={itemVariants}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={
                    post.media_type === 'VIDEO'
                      ? post.thumbnail_url || post.media_url
                      : post.media_url
                  }
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300"
                >
                  <ExternalLink className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  {new Date(post.timestamp).toLocaleDateString()}
                </p>
                {post.caption && (
                  <p className="text-sm mt-1 line-clamp-2">{truncateCaption(post.caption)}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 text-center">
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-tattoo-red text-tattoo-red hover:bg-tattoo-red hover:text-white transition-colors duration-300"
        >
          <Instagram size={18} />
          Follow @{username} on Instagram
        </a>
      </div>
    </div>
  );
}

// Fallback component for when no accessToken is available yet
export function InstagramFeedFallback({ username = 'ink37tattoo' }: { username?: string }) {
  return (
    <Card className="p-6 text-center">
      <CardContent>
        <div className="flex justify-center mb-4">
          <Instagram size={32} className="text-tattoo-red" />
        </div>
        <h3 className="text-lg font-medium mb-2">Follow Us on Instagram</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Check out our latest work on Instagram at{' '}
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @{username}
          </a>
        </p>
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
        >
          <Instagram size={16} />
          View on Instagram
        </a>
      </CardContent>
    </Card>
  );
}
