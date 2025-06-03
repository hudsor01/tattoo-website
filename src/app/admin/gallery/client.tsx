/**
 * Admin Gallery Management Client Component
 * 
 * Purpose: Client component for managing gallery images and portfolio
 * Rendering: CSR with image upload and management capabilities
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { trpc } from '@/lib/trpc/client';
import { 
  Image, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  Search,
  Grid,
  List
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function GalleryPageClient() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch gallery data
  const { data: galleryItems, isLoading } = trpc.gallery.getAll.useQuery(
    { 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchQuery ?? undefined 
    },
    { 
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  const mockGalleryItems = [
    {
      id: '1',
      title: 'Traditional Rose Sleeve',
      description: 'Full sleeve traditional style tattoo',
      imageUrl: '/images/traditional.jpg',
      status: 'approved',
      category: 'Traditional',
      artist: 'John Doe',
      createdAt: new Date('2024-01-15'),
      views: 156,
      likes: 23
    },
    {
      id: '2', 
      title: 'Japanese Dragon Back Piece',
      description: 'Large scale Japanese dragon tattoo',
      imageUrl: '/images/japanese.jpg',
      status: 'pending',
      category: 'Japanese',
      artist: 'Jane Smith',
      createdAt: new Date('2024-01-10'),
      views: 89,
      likes: 12
    },
    {
      id: '3',
      title: 'Realistic Portrait',
      description: 'Black and grey realistic portrait',
      imageUrl: '/images/realism.jpg', 
      status: 'approved',
      category: 'Realism',
      artist: 'Mike Johnson',
      createdAt: new Date('2024-01-08'),
      views: 234,
      likes: 45
    }
  ];

  const items = galleryItems || mockGalleryItems;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div>
            <h1 className="dashboard-section-heading text-4xl lg:text-5xl">Gallery Management</h1>
            <p className="dashboard-section-subheading mt-1">
              Manage tattoo portfolio images and approve submissions
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Filters & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'approved') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Gallery Grid/List */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={`gallery-skeleton-${i}`} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={item.status === 'approved' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>By {item.artist}</span>
                      <span>{item.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views}
                        </span>
                        <span>{item.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {item.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              By {item.artist} • {item.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.status === 'approved' ? 'success' : 'warning'}
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              {item.status === 'pending' && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && items.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground mb-4">
                Upload some images to get started with your gallery.
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Image
              </Button>
            </div>
          )}
        </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}