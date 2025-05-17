/**
 * theme-types.ts
 *
 * Type definitions related to theming and styling for the application.
 */

/**
 * Available theme modes
 */
export type ThemeMode = 'dark' | 'light';

/**
 * Theme colors interface
 */
export interface ThemeColors {
  // Core brand colors
  black: string;
  white: string;
  red: string;
  blue: string;
  
  // Variations
  blackLight: string;
  blackDark: string;
  redLight: string;
  redDark: string;
  blueLight: string;
  blueDark: string;
  
  // UI state colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Theme configuration for a specific mode
 */
export interface ThemeConfig {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  cardBorder: string;
  muted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfigurations {
  dark: ThemeConfig;
  light: ThemeConfig;
}