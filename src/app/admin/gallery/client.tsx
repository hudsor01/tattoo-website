/**
 * Admin Gallery Page Client Component
 * 
 * Purpose: Manage tattoo designs and gallery content
 * Rendering: CSR with TanStack Query
 * Dependencies: REST API, gallery management
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { useGallery } from '@/hooks/use-gallery-api';
import { 
  Image,
  Eye,
  Edit,
  Trash2,
  Upload,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminGalleryPage() {
  const { toast } = useToast();

  // Use the new gallery API hook
  const { data: galleryData, isLoading, error } = useGallery({
    limit: 50
  });

  const designs = galleryData?.designs ?? [];

  const handleApprove = async (_designId: string) => {
    try {
      // TODO: Implement approval API call
      toast({
        title: "Design approved",
        description: "The design has been approved and is now visible in the gallery.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve design. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (_designId: string) => {
    try {
      // TODO: Implement rejection API call
      toast({
        title: "Design rejected",
        description: "The design has been rejected and removed from the gallery.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject design. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Gallery Management</h1>
              <p className="text-muted-foreground">Manage tattoo designs and gallery content</p>
            </div>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Design
            </Button>
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Failed to load gallery. Please try again.</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Designs ({designs.length})</CardTitle>
              <CardDescription>Manage uploaded tattoo designs and their approval status</CardDescription>
            </CardHeader>
            <CardContent>
              {designs.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No designs uploaded</h3>
                  <p className="text-muted-foreground">Upload your first tattoo design to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.map((design) => (
                    <div key={design.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square relative">
                        {design.fileUrl ? (
                          <img 
                            src={design.fileUrl} 
                            alt={design.name || 'Tattoo design'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Image className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant={design.isApproved ? "default" : "secondary"}>
                            {design.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">{design.name || 'Untitled'}</h4>
                        {design.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {design.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {!design.isApproved && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => { void handleApprove(design.id); }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => { void handleReject(design.id); }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}