/**
 * Design tokens for the unified theme system
 * These tokens are consumed by both Tailwind CSS and Material UI
 * Enhanced with Tailwind CSS v4.1.5 features - OKLCH colors for wider gamut
 */

// Color palette definition with OKLCH colors
export const colors = {
  // Brand colors - both hex and OKLCH for compatibility
  tattoo: {
    black: '#0a0a0a',
    oklchBlack: 'oklch(0.10 0.01 0)', // OKLCH equivalent
    red: {
      DEFAULT: '#d62828',
      oklch: 'oklch(0.60 0.25 25)', // OKLCH equivalent
      dark: '#b21e1e',
      oklchDark: 'oklch(0.51 0.22 25)', // OKLCH equivalent
      light: '#e05151',
      oklchLight: 'oklch(0.65 0.27 25)', // OKLCH equivalent
    },
    blue: {
      DEFAULT: '#3b82f6',
      oklch: 'oklch(0.65 0.18 255)', // OKLCH equivalent
      dark: '#2563eb',
      oklchDark: 'oklch(0.58 0.18 255)', // OKLCH equivalent
      light: '#60a5fa',
      oklchLight: 'oklch(0.72 0.18 255)', // OKLCH equivalent
    },
    white: '#ffffff',
    oklchWhite: 'oklch(0.99 0.01 0)', // OKLCH equivalent
    green: '#10b981',
    oklchGreen: 'oklch(0.74 0.19 155)', // OKLCH equivalent
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    oklch50: 'oklch(0.98 0.01 0)',
    100: '#f5f5f5',
    oklch100: 'oklch(0.97 0.01 0)',
    200: '#e5e5e5',
    oklch200: 'oklch(0.92 0.01 0)',
    300: '#d4d4d4',
    oklch300: 'oklch(0.86 0.01 0)',
    400: '#a3a3a3',
    oklch400: 'oklch(0.70 0.01 0)',
    500: '#737373',
    oklch500: 'oklch(0.58 0.01 0)',
    600: '#525252',
    oklch600: 'oklch(0.43 0.01 0)',
    700: '#404040',
    oklch700: 'oklch(0.36 0.01 0)',
    800: '#262626',
    oklch800: 'oklch(0.22 0.01 0)',
    900: '#171717',
    oklch900: 'oklch(0.15 0.01 0)',
    950: '#0a0a0a',
    oklch950: 'oklch(0.10 0.01 0)',
  },

  // Semantic colors
  success: {
    light: '#4ade80',
    oklchLight: 'oklch(0.80 0.19 145)',
    DEFAULT: '#22c55e',
    oklch: 'oklch(0.74 0.19 145)',
    dark: '#16a34a',
    oklchDark: 'oklch(0.62 0.19 145)',
  },
  warning: {
    light: '#fde68a',
    oklchLight: 'oklch(0.85 0.15 85)',
    DEFAULT: '#f59e0b',
    oklch: 'oklch(0.75 0.18 85)',
    dark: '#d97706',
    oklchDark: 'oklch(0.65 0.20 85)',
  },
  error: {
    light: '#f87171',
    oklchLight: 'oklch(0.75 0.20 25)',
    DEFAULT: '#ef4444',
    oklch: 'oklch(0.65 0.25 25)',
    dark: '#dc2626',
    oklchDark: 'oklch(0.55 0.25 25)',
  },
  info: {
    light: '#93c5fd',
    oklchLight: 'oklch(0.75 0.15 250)',
    DEFAULT: '#3b82f6',
    oklch: 'oklch(0.65 0.18 250)',
    dark: '#2563eb',
    oklchDark: 'oklch(0.55 0.18 250)',
  },
};

// Typography definitions
export const typography = {
  fontFamily: {
    heading: 'var(--font-montserrat)',
    body: 'var(--font-inter)',
    accent: 'var(--font-pacifico)',
    cursive: 'var(--font-satisfy)',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing system
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Circle
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  // Colored shadows for v4.1.5 features
  redGlow: '0 0 15px rgba(214, 40, 40, 0.3)',
  redGlowHover: '0 0 25px rgba(214, 40, 40, 0.5)',
  blueGlow: '0 0 15px rgba(59, 130, 246, 0.3)',
  blueGlowHover: '0 0 25px rgba(59, 130, 246, 0.5)',
};

// Z-index
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  modal: '1300',
  popover: '1000',
  tooltip: '1500',
};

// Transitions
export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Backdrop filters (new in v4.1.5)
export const backdropFilters = {
  none: 'none',
  sm: 'blur(4px)',
  DEFAULT: 'blur(8px)',
  md: 'blur(12px)',
  lg: 'blur(16px)',
  xl: 'blur(24px)',
  '2xl': 'blur(40px)',
  '3xl': 'blur(64px)',
};

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  backdropFilters,
};

export default tokens;
