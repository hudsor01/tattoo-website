'use client';

import { trpc } from '@/lib/trpc/client-provider';
import type { GalleryDesign } from '@/types/gallery-types';

export function useDesign(designId: string) {
  const {
    data: design,
    isLoading,
    error,
    refetch,
  } = trpc.gallery.getDesignById.useQuery(
    { id: designId },
    {
      enabled: !!designId,
      staleTime: 5 * 60 * 1000,
    }
  );

  return {
    design: design as GalleryDesign | undefined,
    isLoading,
    error,
    refetch,
  };
}
