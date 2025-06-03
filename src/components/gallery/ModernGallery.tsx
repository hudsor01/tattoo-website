'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, ImageIcon } from 'lucide-react';
import { AceternityLayoutGrid } from './AceternityLayoutGrid';
import { useGalleryInfiniteQuery } from '@/hooks/use-trpc-infinite-query';
import type { GalleryDesignDto } from '@prisma/client';
import { motion } from 'framer-motion';

export function ModernGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [designType, setDesignType] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  
  // Use the infinite query hook
  const queryResult = useGalleryInfiniteQuery({
    ...(designType && { designType }),
    limit: 30, // Fetch more items at once for the grid layout
  });

  const { data: queryData, isLoading, fetchNextPage, hasNextPage } = queryResult;

  // Flatten the paginated data
  const designs = React.useMemo(() => {
    return queryData?.pages.flatMap((page: { designs: GalleryDesignDto[]; }) => page.designs) ?? [];
  }, [queryData]);

  // Filter designs by search term (client-side filtering)
  const filteredDesigns = React.useMemo(() => {
    if (!designs) return [];

    let filtered = designs;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (design: GalleryDesignDto) =>
          design.name.toLowerCase().includes(searchLower) ||
          (design.description?.toLowerCase().includes(searchLower) ?? false) ||
          (design.designType?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Filter by active tab
    if (activeTab === 'images') {
      filtered = filtered.filter((design: { fileUrl: string | string[]; }) => !design.fileUrl?.includes('.mp4'));
    } else if (activeTab === 'videos') {
      filtered = filtered.filter((design: { fileUrl: string | string[]; }) => design.fileUrl?.includes('.mp4'));
    }

    return filtered;
  }, [designs, searchTerm, activeTab]);

  // Load more designs when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;
      const scrollThreshold = 0.9; // Load more when user scrolls to 90% of the page

      if (scrollPosition >= pageHeight * scrollThreshold && hasNextPage && !isLoading) {
        void fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isLoading]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === 'images' || value === 'videos') {
      setActiveTab(value);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-red-600 from-[30%] via-[#FF3131] via-[55%] to-orange-500">
          Tattoo Gallery
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Browse our collection of custom tattoo designs showcasing a diverse range of styles. From
          traditional to Japanese, portraits to custom pieces - each design reflects our commitment
          to quality, creativity, and personal expression.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <Card className="max-w-4xl mx-auto bg-background/70 backdrop-blur-md border border-muted/50">
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Gallery
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Design type filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!designType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType(undefined)}
            >
              All Styles
            </Button>
            <Button
              variant={designType === 'traditional' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType('traditional')}
            >
              Traditional
            </Button>
            <Button
              variant={designType === 'realism' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType('realism')}
            >
              Realism
            </Button>
            <Button
              variant={designType === 'japanese' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType('japanese')}
            >
              Japanese
            </Button>
            <Button
              variant={designType === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType('custom')}
            >
              Custom
            </Button>
            <Button
              variant={designType === 'cover-up' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDesignType('cover-up')}
            >
              Cover-up
            </Button>
          </div>

          {/* Image/Video Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2">
              <TabsTrigger value="images" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>Images</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-4 w-4"
                >
                  <path d="M18 7c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-3" />
                  <path d="m22 12-4.5 4.5" />
                  <path d="m22 12-4.5-4.5" />
                  <path d="M22 12h-10" />
                </svg>
                <span>Videos</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Gallery Content */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={`skeleton-${i}`} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : filteredDesigns.length > 0 ? (
          <AceternityLayoutGrid designs={filteredDesigns} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-muted-foreground">No Designs Found</h2>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasNextPage && filteredDesigns.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => void fetchNextPage()} 
            disabled={isLoading}
            className="bg-linear-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white border-none"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Designs'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ModernGallery;