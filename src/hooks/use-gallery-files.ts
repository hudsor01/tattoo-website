import { useQuery } from '@tanstack/react-query';
import type { GalleryFilesResponse } from '@/lib/prisma-types';

async function fetchGalleryFiles(): Promise<GalleryFilesResponse> {
  try {
    const response = await fetch('/api/gallery/files', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Gallery API error:', response.status, errorText);
      throw new Error(`Failed to fetch gallery files: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gallery files loaded:', data);
    return data;
  } catch (error) {
    console.error('Gallery fetch error:', error);
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