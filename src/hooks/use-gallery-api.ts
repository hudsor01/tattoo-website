'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types (will match Prisma generated types)
interface TattooDesign {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  designType: string | null;
  size: string | null;
  isApproved: boolean;
  artistId: string;
  artistName: string;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GalleryResponse {
  designs: TattooDesign[];
  nextCursor: string | null;
  totalCount: number;
}

interface CreateDesignData {
  name: string;
  description?: string;
  fileUrl: string;
  designType?: string;
  size?: string;
}

interface UpdateDesignData {
  name?: string;
  description?: string;
  fileUrl?: string;
  designType?: string;
  size?: string;
  isApproved?: boolean;
}

// API functions
async function fetchGalleryDesigns(params: {
  limit?: number;
  cursor?: string;
  designType?: string;
} = {}): Promise<GalleryResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.designType) searchParams.set('designType', params.designType);

  const response = await fetch(`/api/gallery?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch gallery designs');
  }
  
  return response.json();
}

async function fetchDesignById(id: string): Promise<TattooDesign> {
  const response = await fetch(`/api/gallery/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch design');
  }
  
  return response.json();
}

async function createDesign(data: CreateDesignData): Promise<TattooDesign> {
  const response = await fetch('/api/gallery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create design');
  }
  
  return response.json();
}

async function updateDesign(id: string, data: UpdateDesignData): Promise<TattooDesign> {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update design');
  }
  
  return response.json();
}

async function deleteDesign(id: string): Promise<void> {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete design');
  }
}

// Hooks
export function useGallery(params: {
  limit?: number;
  cursor?: string;
  designType?: string;
} = {}) {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: () => fetchGalleryDesigns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDesignById(id: string | null) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => fetchDesignById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDesign,
    onSuccess: () => {
      // Invalidate and refetch gallery queries
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDesignData }) =>
      updateDesign(id, data),
    onSuccess: (updatedDesign) => {
      // Update the specific design in the cache
      queryClient.setQueryData(['design', updatedDesign.id], updatedDesign);
      
      // Invalidate gallery queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: (_, deletedId) => {
      // Remove the design from the cache
      queryClient.removeQueries({ queryKey: ['design', deletedId] });
      
      // Invalidate gallery queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}