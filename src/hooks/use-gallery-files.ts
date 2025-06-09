import { useQuery } from '@tanstack/react-query';
import type { GalleryFilesResponse } from '@/lib/prisma-types';
import { logger } from '@/lib/logger';

async function fetchGalleryFiles(): Promise<GalleryFilesResponse> {
  try {
    const response = await fetch('/api/gallery/files', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      void logger.warn('Gallery Files API error:', { status: response.status, errorDetails: errorText });
      throw new Error(`Failed to fetch gallery files: ${response.status}`);
    }
    
    const data = await response.json() as GalleryFilesResponse;
    
    // The new API already returns the correct format
    return data;
  } catch (error) {
    void logger.error('Gallery fetch error:', error);
    throw error;
  }
}

export function useGalleryFiles() {
  return useQuery({
    queryKey: ['gallery-files'],
    queryFn: fetchGalleryFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
