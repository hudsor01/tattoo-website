/**
 * Pricing API Routes
 * 
 * API endpoints for pricing calculations and related functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { 
  createValidatedRoute, 
  createRoute 
} from '../route-creator';
import {
  calculatePricing,
  getStandardPricingData,
  calculateAppointmentDuration,
  getArtistRates
} from '@/lib/db/db-pricing';

// Schema for pricing calculations
const PricingCalculationSchema = z.object({
  size: z.string(),
  placement: z.string(),
  complexity: z.number().min(1).max(5).default(3),
  artistId: z.string().optional(),
  customHourlyRate: z.number().optional(),
});

/**
 * GET /api/pricing
 * 
 * Get standard pricing data
 */
export const GET = createRoute(async (req) => {
  const searchParams = req.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');
  
  try {
    // If artist ID is provided, get artist-specific rates
    if (artistId) {
      const rates = await getArtistRates(artistId);
      return NextResponse.json(rates);
    }
    
    // Otherwise, get standard pricing data
    const pricingData = await getStandardPricingData();
    return NextResponse.json(pricingData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/pricing
 * 
 * Calculate pricing for a specific tattoo
 */
export const POST = createValidatedRoute(
  PricingCalculationSchema,
  async (req, { data }) => {
    try {
      // Calculate pricing
      const pricingBreakdown = await calculatePricing(
        data.size,
        data.placement,
        data.complexity,
        data.artistId,
        data.customHourlyRate
      );
      
      // Get estimated duration
      const duration = await calculateAppointmentDuration(
        data.size,
        data.complexity
      );
      
      return NextResponse.json({
        ...pricingBreakdown,
        estimatedDuration: duration
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to calculate pricing' },
        { status: 500 }
      );
    }
  }
);

/**
 * OPTIONS /api/pricing
 * 
 * Get options for pricing calculations (CORS support)
 */
export const OPTIONS = createRoute(async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});