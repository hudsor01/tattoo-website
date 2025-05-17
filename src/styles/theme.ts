/**
 * Combined theme configuration for Ink 37 website
 * 
 * This file provides a unified theme configuration with colors, typography,
 * and other design tokens. It replaces the separate themes.ts and theme.css files.
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

// Theme CSS variables for use in the application
export const themeVariables = {
  // Transitions & animations
  easeFluid: 'cubic-bezier(0.3, 0, 0, 1)',
  easeSnappy: 'cubic-bezier(0.2, 0, 0, 1)',
  
  // Border radius
  radius: '0.5rem',
  radiusSmall: '0.25rem',
  radiusLarge: '1rem',
  
  // Shadows
  shadowSmall: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  shadowMedium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLarge: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Blur values
  blurSmall: '4px',
  blurDefault: '8px',
  blurMedium: '12px',
  blurLarge: '16px',
  blurXL: '24px',
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

// Export default theme colors for use in components
export const tattooColors = {
  // Base colors
  tattooBlack: themeColors.black,
  tattooWhite: themeColors.white,
  tattooRed: themeColors.red,
  tattooBlue: themeColors.blue,
  
  // Variations
  tattooRedLight: themeColors.redLight,
  tattooRedDark: themeColors.redDark,
  tattooBlueLight: themeColors.blueLight,
  tattooBlueDark: themeColors.blueDark,
};