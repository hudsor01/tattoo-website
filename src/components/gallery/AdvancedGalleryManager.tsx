/**
 * Advanced Gallery Manager Component
 * 
 * Provides comprehensive gallery management with granular loading,
 * statistics display, category filtering, and search functionality.
 * Features optimized performance with progressive rendering.
 */

'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ImageIcon, 
  Filter, 
  Search,
  Heart,
  Share,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { trpc } from '@/lib/trpc/client';
import { ShareDialog } from './share-dialog';

/**
 * Gallery Header with Search - Loads immediately
 */
function GalleryHeader({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          Tattoo Gallery
        </CardTitle>
        <p className="text-muted-foreground">
          Browse our collection of custom tattoo designs and find inspiration for your next ink.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Gallery Stats - Loads in separate Suspense boundary
 */
function GalleryStats() {
  const { data: stats } = trpc.gallery.getStats.useQuery();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats?.totalDesigns ?? 0}</div>
          <div className="text-sm text-muted-foreground">Total Designs</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats?.approvedDesigns ?? 0}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats?.pendingDesigns ?? 0}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Gallery Stats Loading Skeleton
 */
function GalleryStatsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, i) => `gallery-stats-skeleton-${Date.now()}-${i}`).map((uniqueKey) => (
        <Card key={uniqueKey}>
          <CardContent className="p-4 text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Gallery Categories - Loads in separate Suspense boundary
 */
function GalleryCategories({ selectedCategory, onCategoryChange }: {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { data: designTypes } = trpc.gallery.getDesignTypes.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Design Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
          >
            All
          </Button>
          {designTypes?.map((designType) => (
            <Button
              key={designType}
              variant={selectedCategory === designType ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(designType)}
            >
              {designType}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Gallery Categories Loading Skeleton
 */
function GalleryCategoriesLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-18" />
          <Skeleton className="h-8 w-22" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Design Grid Item
 */
function DesignGridItem({ design }: { design: { 
  id: string; 
  name: string; 
  fileUrl: string | null; 
  thumbnailUrl: string | null; 
  designType: string | null; 
  isApproved: boolean;
} }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={design.fileUrl ?? design.thumbnailUrl ?? '/images/placeholder.jpg'}
          alt={design.name}
          fill
          className="group-hover:scale-105 transition-transform duration-300"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShareDialogOpen(true);
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 text-xs">
                <Eye className="h-3 w-3" />
                0
              </div>
              <Button size="sm" variant="secondary" className="h-6 text-xs">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium truncate">{design.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className="text-xs">
            {design.designType ?? 'Custom'}
          </Badge>
          {design.isApproved && (
            <Badge variant="default" className="text-xs bg-green-500">
              Approved
            </Badge>
          )}
        </div>
      </CardContent>
      
      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        contentType="design"
        contentId={design.id}
        title={design.name}
      />
    </Card>
  );
}

/**
 * Design Grid - Main gallery content
 */
function DesignGrid({ category, searchTerm }: { 
  category: string; 
  searchTerm: string;
}) {
  const { data: designsData, isLoading } = trpc.gallery.getPublicDesigns.useQuery({
    designType: category === 'all' ? undefined : category,
    limit: 20,
  });

  if (isLoading) {
    return <DesignGridLoading />;
  }

  const designs = designsData?.designs ?? [];

  // Simple client-side search filter if searchTerm exists
  const filteredDesigns = searchTerm 
    ? designs.filter(design => {
        // Check name
        if (design.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // Check description if available
        if (design.description !== null && design.description !== undefined) {
          if (design.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }
        }
        
        return false;
      })
    : designs;

  if (!filteredDesigns.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Designs Found</h3>
          <p className="text-muted-foreground text-center mt-2">
            {searchTerm
              ? `No designs found matching "${searchTerm}"`
              : `No designs found${category !== 'all' ? ` in the ${category} category` : ''}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredDesigns.map((design) => (
        <DesignGridItem key={design.id} design={design} />
      ))}
    </div>
  );
}

/**
 * Design Grid Loading Skeleton
 */
function DesignGridLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, i) => `design-grid-skeleton-${Date.now()}-${i}`).map((uniqueKey) => (
        <Card key={uniqueKey} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Main Gallery Component with Granular Suspense Boundaries
 */
export function AdvancedGalleryManager() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header loads immediately - no Suspense needed */}
      <GalleryHeader onSearch={setSearchTerm} />

      {/* Stats load in separate Suspense boundary */}
      <Suspense fallback={<GalleryStatsLoading />}>
        <GalleryStats />
      </Suspense>

      {/* Categories load in separate Suspense boundary */}
      <Suspense fallback={<GalleryCategoriesLoading />}>
        <GalleryCategories 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </Suspense>

      {/* Main content with its own Suspense boundary */}
      <Suspense fallback={<DesignGridLoading />}>
        <DesignGrid 
          category={selectedCategory}
          searchTerm={searchTerm}
        />
      </Suspense>

      {/* Demo info */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Gallery Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This gallery features optimized performance with granular loading:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <strong>Header:</strong> Loads immediately (no data dependencies)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <strong>Stats:</strong> Independent Suspense boundary for statistics
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <strong>Design Types:</strong> Independent Suspense boundary for design type filters
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <strong>Gallery Grid:</strong> Main content with its own Suspense boundary
            </li>
          </ul>
          <div className="mt-4 p-3 bg-muted rounded-md text-xs">
            <strong>Benefits:</strong> Independent loading sections provide better perceived
            performance and prevent slow queries from blocking the entire interface.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedGalleryManager;