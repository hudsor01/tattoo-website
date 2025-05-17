/**
 * Simple theme configuration for Ink 37 website
 * 
 * This file provides a straightforward theme configuration with
 * basic colors that can be easily updated and maintained.
 */

import type { ThemeMode, ThemeColors, ThemeConfigurations } from '@/types/theme-types';

export const themeColors: ThemeColors = {
  // Core brand colors
  black: '#0A0A0A',  // Main background
  white: '#FAFAFA',  // Main text color
  red: '#E53935',    // Primary accent/brand color
  blue: '#2563EB',   // Secondary accent color
  
  // Variations
  blackLight: '#121212',
  blackDark: '#050505',
  redLight: '#F44336',
  redDark: '#C62828',
  blueLight: '#3B82F6',
  blueDark: '#1D4ED8',
  
  // UI state colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Re-export the ThemeMode type
export type { ThemeMode };

// Theme configuration by mode
export const themeConfig: ThemeConfigurations = {
  dark: {
    background: themeColors.black,
    foreground: themeColors.white,
    primary: themeColors.red,
    secondary: themeColors.blue,
    accent: themeColors.red,
    card: 'rgba(18, 18, 18, 0.5)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    muted: 'rgba(255, 255, 255, 0.7)',
    success: themeColors.success,
    warning: themeColors.warning,
    error: themeColors.error,
    info: themeColors.info,
  },
  light: {
    background: themeColors.white,
    foreground: themeColors.black,
    primary: themeColors.red,
    secondary: themeColors.blue,
    accent: themeColors.redDark,
    card: 'rgba(255, 255, 255, 0.8)',
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    muted: 'rgba(0, 0, 0, 0.7)',
    success: themeColors.success,
    warning: themeColors.warning,
    error: themeColors.error,
    info: themeColors.info,
  },
};