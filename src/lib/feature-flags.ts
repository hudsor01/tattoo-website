/**
 * Feature flags implementation
 * 
 * This file provides environment-based feature flags for enabling/disabling features.
 * Feature flags allow for controlled rollout of new functionality and A/B testing.
 */

import { useState, useEffect } from 'react';
import { getEnvSafe } from '@/lib/utils/env';

// Define feature flags interface
export interface FeatureFlags {
  enableModernCalProvider: boolean;
  enableAdvancedAnalytics: boolean;
  enableNewBookingFlow: boolean;
  enableCustomerNotifications: boolean;
  enablePaymentProcessing: boolean;
  enableDebugMode: boolean;
}

// Environment-based feature flags
function getEnvironmentFlags(): FeatureFlags {
  const envFlags = {
    enableModernCalProvider: getEnvSafe('ENABLE_MODERN_CAL_PROVIDER', '') === 'true',
    enableAdvancedAnalytics: getEnvSafe('ENABLE_ADVANCED_ANALYTICS', 'true') === 'true',
    enableNewBookingFlow: getEnvSafe('ENABLE_NEW_BOOKING_FLOW', '') === 'true',
    enableCustomerNotifications: getEnvSafe('ENABLE_CUSTOMER_NOTIFICATIONS', 'true') === 'true',
    enablePaymentProcessing: getEnvSafe('ENABLE_PAYMENT_PROCESSING', '') === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development',
  };
  
  return envFlags;
}

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = getEnvironmentFlags();

// Hook to access feature flags
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    
    // Get environment flags
    const envFlags = getEnvironmentFlags();
    setFlags(envFlags);
    setLoaded(true);
  }, [loaded]);

  return flags;
}

// Utility for checking a specific flag
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const flags = useFeatureFlags();
  return flags[flagName];
}