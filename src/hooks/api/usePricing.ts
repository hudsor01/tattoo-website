'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import type { 
  PricingBreakdown,
  StandardPricingData 
} from '@/types/payments-types';

interface PricingCalculationParams {
  size: string;
  placement: string;
  complexity?: number;
  artistId?: string;
  customHourlyRate?: number;
}

/**
 * Hook for pricing calculations
 */
export function usePricing() {
  const toast = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch standard pricing data
  const pricingDataQuery = useQuery({
    queryKey: ['pricingData'],
    queryFn: async () => {
      const { data } = await axios.get<StandardPricingData>('/api/pricing');
      return data;
    },
  });

  // Fetch artist specific rates
  const getArtistRates = (artistId: string) => {
    return useQuery({
      queryKey: ['artistRates', artistId],
      queryFn: async () => {
        const { data } = await axios.get(`/api/pricing?artistId=${artistId}`);
        return data;
      },
      enabled: !!artistId,
    });
  };

  // Calculate pricing mutation
  const calculatePricingMutation = useMutation({
    mutationFn: async (params: PricingCalculationParams) => {
      setIsCalculating(true);
      try {
        const { data } = await axios.post<PricingBreakdown & { estimatedDuration: string }>(
          '/api/pricing',
          params
        );
        return data;
      } finally {
        setIsCalculating(false);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to calculate pricing';
      toast.error(message);
    },
  });

  return {
    // Standard pricing data
    pricingData: pricingDataQuery.data,
    isPricingDataLoading: pricingDataQuery.isLoading,
    isPricingDataError: pricingDataQuery.isError,
    pricingDataError: pricingDataQuery.error,
    
    // Artist rates
    getArtistRates,
    
    // Calculate pricing
    calculatePricing: calculatePricingMutation.mutate,
    pricingResult: calculatePricingMutation.data,
    isCalculating,
    isPricingError: calculatePricingMutation.isError,
    pricingError: calculatePricingMutation.error,
    
    // Refetch
    refetchPricingData: pricingDataQuery.refetch,
  };
}