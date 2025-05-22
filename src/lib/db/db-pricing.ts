/**
 * Pricing Database Functions
 * 
 * Unified functions for pricing-related operations
 */

import { executeStoredProcedure } from './prisma';
import type { 
  PricingBreakdown, 
  StandardPricingData,
  ArtistRate
} from '@/types/payments-types';

/**
 * Calculate pricing for a tattoo based on size, placement, and complexity
 */
export async function calculatePricing(
  size: string,
  placement: string,
  complexity: number = 3,
  artistId?: string,
  customHourlyRate?: number,
): Promise<PricingBreakdown> {
  try {
    const result = await executeStoredProcedure<PricingBreakdown>('calculate_pricing', [
      size,
      placement,
      complexity,
      artistId || null,
      customHourlyRate || null,
    ]);
    return result;
  } catch (error) {
    console.error('Error calculating pricing:', error);
    throw error;
  }
}

/**
 * Calculate estimated appointment duration based on tattoo size and complexity
 */
export async function calculateAppointmentDuration(
  size: string,
  complexity: number = 3,
): Promise<string> {
  try {
    const result = await executeStoredProcedure<{ duration: string }>(
      'calculate_appointment_duration',
      [size, complexity],
    );
    return result.duration;
  } catch (error) {
    console.error('Error calculating appointment duration:', error);
    throw error;
  }
}

/**
 * Get artist hourly rates
 */
export async function getArtistRates(artistId?: string): Promise<ArtistRate> {
  try {
    const result = await executeStoredProcedure<ArtistRate>('get_artist_rates', [artistId || null]);
    return result;
  } catch (error) {
    console.error('Error getting artist rates:', error);
    throw error;
  }
}

/**
 * Get all standard pricing data for display
 */
export async function getStandardPricingData(): Promise<StandardPricingData> {
  try {
    const sizePrices = [
      { size: 'tiny', label: 'Tiny (1-2 inches)', basePrice: 100 },
      { size: 'small', label: 'Small (2-4 inches)', basePrice: 200 },
      { size: 'medium', label: 'Medium (4-6 inches)', basePrice: 350 },
      { size: 'large', label: 'Large (6-10 inches)', basePrice: 600 },
      { size: 'x-large', label: 'Extra Large (10+ inches)', basePrice: 1000 },
      { size: 'half-sleeve', label: 'Half Sleeve', basePrice: 1500 },
      { size: 'full-sleeve', label: 'Full Sleeve', basePrice: 2500 },
      { size: 'back-piece', label: 'Back Piece', basePrice: 3000 },
    ];
    
    const placementFactors = [
      { placement: 'inner-arm', label: 'Inner Arm', factor: 1.0 },
      { placement: 'outer-arm', label: 'Outer Arm', factor: 1.0 },
      { placement: 'upper-back', label: 'Upper Back', factor: 1.0 },
      { placement: 'lower-back', label: 'Lower Back', factor: 1.1 },
      { placement: 'chest', label: 'Chest', factor: 1.2 },
      { placement: 'ribs', label: 'Ribs', factor: 1.5 },
      { placement: 'hands', label: 'Hands', factor: 1.5 },
      { placement: 'feet', label: 'Feet', factor: 1.4 },
      { placement: 'head', label: 'Head', factor: 1.6 },
      { placement: 'neck', label: 'Neck', factor: 1.3 },
    ];
    
    const complexityLevels = [
      { level: 1, label: 'Simple (basic line work)', factor: 0.8 },
      { level: 2, label: 'Moderate (some shading/detail)', factor: 0.9 },
      { level: 3, label: 'Standard (average detail)', factor: 1.0 },
      { level: 4, label: 'Complex (high detail/color)', factor: 1.2 },
      { level: 5, label: 'Very Complex (photorealistic/intricate)', factor: 1.5 },
    ];
    
    return {
      sizePrices,
      placementFactors,
      complexityLevels,
      depositPercentage: 30, // Standard deposit percentage
      baseHourlyRate: 150,   // Standard hourly rate
    };
  } catch (error) {
    console.error('Error getting standard pricing data:', error);
    throw error;
  }
}