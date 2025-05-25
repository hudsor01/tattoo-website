'use client'

import React, { useState } from 'react'
import { Search, Filter, Grid, List, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGalleryInfiniteQuery } from '@/hooks/use-trpc-infinite-query'
import Image from 'next/image'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import type { GalleryDesignDto } from '@/types/gallery-types'

interface GalleryInfiniteProps {
  className?: string
  initialDesignType?: string
  showFilters?: boolean
  gridCols?: number
  itemsPerPage?: number
  enableLightbox?: boolean
}

export default function GalleryInfinite({
  className = '',
  initialDesignType,
  showFilters = true,
  gridCols = 3,
  itemsPerPage = 20,
  enableLightbox = false,
}: GalleryInfiniteProps) {
  const [designType, setDesignType] = useState<string | undefined>(initialDesignType)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'popular'>('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)

  // Use the infinite query hook
  const {
    data: designs,
    isLoading,
    isFetching,
    hasMore,
    fetchNextPage,
    count: totalCount,
    error,
  } = useGalleryInfiniteQuery({
    designType,
    limit: itemsPerPage,
  })

  // Type assertion for designs
  const typedDesigns = (designs as GalleryDesignDto[]) || []

  // Filter designs by search term (client-side filtering)
  const filteredDesigns = React.useMemo(() => {
    if (!typedDesigns) return []
    
    let filtered = typedDesigns
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((design: GalleryDesignDto) => 
        design.name.toLowerCase().includes(searchLower) ||
        (design.description?.toLowerCase().includes(searchLower) ?? false) ||
        (design.designType?.toLowerCase().includes(searchLower) ?? false)
      )
    }
    
    // Sort (Note: server already sorts by latest, but we can re-sort client-side)
    const sorted = [...filtered].sort((a: GalleryDesignDto, b: GalleryDesignDto) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          // You could implement a popularity metric here
          return Number(b.id) - Number(a.id)
        default:
          return 0
      }
    })
    
    return sorted
  }, [typedDesigns, searchTerm, sortBy])

  // Prepare slides for lightbox
  const lightboxSlides = React.useMemo(() => {
    if (!enableLightbox) return []
    
    return filteredDesigns.map((design: GalleryDesignDto) => ({
      src: design.fileUrl ?? design.thumbnailUrl ?? '/images/placeholder-tattoo.jpg',
      width: 1200,
      height: 800,
      title: design.name,
      description: design.description ?? design.designType ?? '',
    }))
  }, [filteredDesigns, enableLightbox])

  // Handle lightbox open/close
  const openLightbox = (index: number) => {
    if (!enableLightbox) return
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setLightboxIndex(-1)
  }

  // Intersection observer for infinite scrolling
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!hasMore || isFetching) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isFetching, fetchNextPage])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading gallery</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={designType ?? 'all'} onValueChange={(value) => setDesignType(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="realism">Realism</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="cover-up">Cover-up</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: 'latest' | 'oldest' | 'popular') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols}` 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: itemsPerPage }, (_, i) => `skeleton-${i}`).map((key) => (
            <div key={key} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Grid/List */}
      {!isLoading && (
        <>
          {filteredDesigns.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No designs found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols}` 
                : 'grid-cols-1'
            }`}>
              {filteredDesigns.map((design: GalleryDesignDto, index: number) => {
                if (enableLightbox) {
                  return (
                    <div key={design.id} onClick={() => openLightbox(index)}>
                      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative aspect-square">
                          <Image
                            src={design.thumbnailUrl ?? design.fileUrl ?? '/images/placeholder-tattoo.jpg'}
                            alt={design.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {design.designType && (
                            <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                              {design.designType}
                            </Badge>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                              <Eye className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {design.name}
                          </h3>
                          {design.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {design.description}
                            </p>
                          )}
                          {design.artist?.user?.name && (
                            <p className="text-xs text-gray-500">
                              by {design.artist.user.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(design.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )
                }

                return (
                  <Link key={design.id} href={`/gallery/${design.id}`}>
                    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={design.thumbnailUrl ?? design.fileUrl ?? '/images/placeholder-tattoo.jpg'}
                          alt={design.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {design.designType && (
                          <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                            {design.designType}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {design.name}
                        </h3>
                        {design.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {design.description}
                          </p>
                        )}
                        {design.artist?.user?.name && (
                          <p className="text-xs text-gray-500">
                            by {design.artist.user.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetching ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-500">Loading more designs...</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => void fetchNextPage()}
                  className="px-8"
                >
                  Load More Designs
                </Button>
              )}
            </div>
          )}

          {/* End Message */}
          {!hasMore && filteredDesigns.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've seen all {totalCount} designs</p>
            </div>
          )}

          {/* Summary */}
          <div className="text-center text-sm text-gray-500">
            Showing {filteredDesigns.length} of {totalCount} designs
          </div>
        </>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          open={isLightboxOpen}
          close={closeLightbox}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Captions, Counter, Fullscreen, Slideshow, Thumbnails, Zoom]}
          captions={{
            showToggle: true,
            descriptionTextAlign: 'center',
          }}
          counter={{
            container: { style: { top: 'unset', bottom: 0 } },
          }}
          thumbnails={{
            position: 'bottom',
            width: 120,
            height: 80,
            border: 1,
            borderRadius: 4,
            padding: 4,
            gap: 16,
          }}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
          }}
          slideshow={{
            autoplay: false,
            delay: 3000,
          }}
          styles={{
            container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
            slide: { padding: 0 },
          }}
          render={lightboxSlides.length <= 1 ? {
            buttonPrev: () => null,
            buttonNext: () => null,
          } : {}}
        />
      )}
    </div>
  )
}