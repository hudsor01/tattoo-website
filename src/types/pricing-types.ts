/**
 * pricing-types.ts
 * 
 * Type definitions for pricing-related functionality
 */

/**
 * Pricing breakdown structure
 */
export interface PricingBreakdown {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
}

/**
 * Size pricing data structure
 */
export interface SizePricing {
  size: string;
  label: string;
  basePrice: number;
}

/**
 * Placement factor data structure
 */
export interface PlacementFactor {
  placement: string;
  label: string;
  factor: number;
}

/**
 * Complexity level data structure
 */
export interface ComplexityLevel {
  level: number;
  label: string;
  factor: number;
}

/**
 * Standard pricing data structure
 */
export interface StandardPricingData {
  sizePrices: SizePricing[];
  placementFactors: PlacementFactor[];
  complexityLevels: ComplexityLevel[];
  depositPercentage: number;
  baseHourlyRate: number;
}

/**
 * Artist rate structure
 */
export interface ArtistRate {
  baseRate: number;
  customRates: Array<{
    size: string;
    placement: string;
    rate: number;
  }>;
}
