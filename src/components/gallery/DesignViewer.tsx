/**
 * Design Viewer Component
 * 
 * Provides an interface for viewing design details
 * with related designs and comprehensive design information.
 * Features conditional data loading and design relationship mapping.
 */

'use client';

import { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ImageIcon, 
  Calendar, 
  Tag, 
  Palette, 
  Share,
  ExternalLink 
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useDesign, useRelatedDesigns } from '@/hooks/use-design';
import { ShareDialog } from './share-dialog';

/**
 * Design Detail Content
 */
function DesignDetailContent({ designId }: { designId: string | null }) {
  // Design data
  const { design, isLoading } = useDesign(designId);
  
  // Related designs
  const { relatedDesigns, isLoading: relatedLoading } = useRelatedDesigns(design ?? null);
  
  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Show placeholder when no design is selected
  if (!designId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No Design Selected</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Enter a design ID above to view the design details
        </p>
      </div>
    );
  }

  // Show loading state while design data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if design not found
  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ImageIcon className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive">Design Not Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          No design found with ID: {designId}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Design Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{design.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Design ID: {design.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShareDialogOpen(true)}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {design.designType && (
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {design.designType}
              </Badge>
            )}
            {design.size && (
              <Badge variant="outline">
                <Palette className="h-3 w-3 mr-1" />
                {design.size}
              </Badge>
            )}
            {design.createdAt && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(design.createdAt), 'MMM dd, yyyy')}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Design Image */}
          {design.fileUrl && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-muted">
              <Image
                src={design.fileUrl}
                alt={design.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          
          {/* Design Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {design.description && (
              <div className="md:col-span-2">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{design.description}</p>
              </div>
            )}
            
            {design.size && (
              <div>
                <h4 className="font-medium mb-1">Size</h4>
                <p className="text-muted-foreground">{design.size}</p>
              </div>
            )}
            
            {design.designType && (
              <div>
                <h4 className="font-medium mb-1">Design Type</h4>
                <p className="text-muted-foreground">{design.designType}</p>
              </div>
            )}
            
            {design.Artist?.User?.name && (
              <div>
                <h4 className="font-medium mb-1">Artist</h4>
                <p className="text-muted-foreground">{design.Artist.User.name}</p>
              </div>
            )}
            
            {design.isApproved && (
              <div>
                <h4 className="font-medium mb-1">Status</h4>
                <Badge variant="default" className="bg-green-500">
                  Approved
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Designs */}
      {design.designType && (
        <Card>
          <CardHeader>
            <CardTitle>Related Designs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Other designs in the {design.designType} style
            </p>
          </CardHeader>
          <CardContent>
            {relatedLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => `related-design-skeleton-${Date.now()}-${i}`).map((uniqueKey) => (
                  <Skeleton key={uniqueKey} className="h-32 w-full" />
                ))}
              </div>
            ) : relatedDesigns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedDesigns.map((related) => (
                  <div key={related.id} className="group cursor-pointer">
                    <div className="relative h-32 rounded-md overflow-hidden bg-muted">
                      {related.fileUrl && (
                        <Image
                          src={related.fileUrl}
                          alt={related.name}
                          fill
                          className="group-hover:scale-105 transition-transform"
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}
                    </div>
                    <p className="text-sm font-medium mt-2 truncate">{related.name}</p>
                    <p className="text-xs text-muted-foreground">{related.designType}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No related designs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Share Dialog */}
      {design && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          contentType="design"
          contentId={design.id}
          title={design.name}
        />
      )}
    </div>
  );
}

/**
 * Main Design Detail Component
 * 
 * Demonstrates React 19 Suspense integration with use() hook
 */
export function DesignViewer() {
  const [designId, setDesignId] = useState<string>('');
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

  const handleLoadDesign = () => {
    setSelectedDesignId(designId.trim() || null);
  };

  const handleClearDesign = () => {
    setSelectedDesignId(null);
    setDesignId('');
  };

  return (
    <div className="space-y-6">
      {/* Design ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Design Viewer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Search and view detailed information about tattoo designs including 
            related designs and comprehensive metadata.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="designId">Design ID</Label>
              <Input
                id="designId"
                value={designId}
                onChange={(e) => setDesignId(e.target.value)}
                placeholder="Enter design ID (e.g., existing design ID)"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleLoadDesign}
              disabled={!designId.trim()}
            >
              Load Design
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearDesign}
              disabled={!selectedDesignId}
            >
              Clear
            </Button>
          </div>
          
          {/* Code Example */}
          <div className="mt-6 p-4 bg-muted rounded-md text-sm">
            <h4 className="font-medium mb-2">React 19 use() Hook Pattern:</h4>
            <pre className="text-xs">
{`// Traditional pattern (React 18)
const { data, isLoading } = trpc.gallery.getDesignById.useQuery(
  { id: designId },
  { enabled: !!designId }
);

// React 19 pattern with use() hook
const { design, isLoading } = useDesignReact19(designId);`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Design Detail Content with Suspense */}
      <Suspense fallback={
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading design data...</span>
            </div>
          </CardContent>
        </Card>
      }>
        <DesignDetailContent designId={selectedDesignId} />
      </Suspense>
    </div>
  );
}

export default DesignViewer;