// Pricing-related types for the application
// These are business logic types, not database entities

export interface PricingBreakdown {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
}

export interface SizePricing {
  size: string;
  label: string;
  basePrice: number;
}

export interface PlacementFactor {
  placement: string;
  label: string;
  factor: number;
}

export interface ComplexityLevel {
  level: number;
  label: string;
  factor: number;
}

export interface StandardPricingData {
  sizePrices: SizePricing[];
  placementFactors: PlacementFactor[];
  complexityLevels: ComplexityLevel[];
  depositPercentage: number;
  baseHourlyRate: number;
}

export interface ArtistRate {
  baseRate: number;
  customRates: Array<{
    size: string;
    placement: string;
    rate: number;
  }>;
}
