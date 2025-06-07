/**
 * Color System Configuration
 * 
 * Purpose: Centralized color management for consistent theming
 * Includes: Brand colors, semantic colors, gradients
 */

export const colors = {
  // Brand colors
  brand: {
    primary: '#FF3131', // Main red
    secondary: '#FF6800', // Orange accent
    tertiary: '#8B4513', // Brown accent
    black: '#000000',
    white: '#FFFFFF',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B', 
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(to right, #FF3131, #FF6800)',
    dark: 'linear-gradient(to bottom, #000000, #171717)',
    overlay: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    card: 'linear-gradient(135deg, rgba(255,49,49,0.1), rgba(255,104,0,0.05))',
  },
  
  // Component-specific colors
  components: {
    button: {
      primary: {
        bg: '#FF3131',
        hover: '#E02A2A',
        text: '#FFFFFF',
      },
      secondary: {
        bg: 'rgba(255,255,255,0.1)',
        hover: 'rgba(255,255,255,0.2)',
        text: '#FFFFFF',
      },
    },
    card: {
      bg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.1)',
      hover: 'rgba(255,255,255,0.08)',
    },
    input: {
      bg: 'rgba(0,0,0,0.5)',
      border: 'rgba(255,255,255,0.2)',
      focus: '#FF3131',
      text: '#FFFFFF',
      placeholder: 'rgba(255,255,255,0.5)',
    },
  },
} as const;

// CSS custom properties for runtime theming
export const cssVariables = `
  :root {
    /* Brand Colors */
    --color-primary: ${colors.brand.primary};
    --color-secondary: ${colors.brand.secondary};
    --color-tertiary: ${colors.brand.tertiary};
    
    /* Semantic Colors */
    --color-success: ${colors.semantic.success};
    --color-warning: ${colors.semantic.warning};
    --color-error: ${colors.semantic.error};
    --color-info: ${colors.semantic.info};
    
    /* Neutral Scale */
    --color-neutral-50: ${colors.neutral[50]};
    --color-neutral-100: ${colors.neutral[100]};
    --color-neutral-200: ${colors.neutral[200]};
    --color-neutral-300: ${colors.neutral[300]};
    --color-neutral-400: ${colors.neutral[400]};
    --color-neutral-500: ${colors.neutral[500]};
    --color-neutral-600: ${colors.neutral[600]};
    --color-neutral-700: ${colors.neutral[700]};
    --color-neutral-800: ${colors.neutral[800]};
    --color-neutral-900: ${colors.neutral[900]};
    --color-neutral-950: ${colors.neutral[950]};
    
    /* Component Tokens */
    --button-primary-bg: ${colors.components.button.primary.bg};
    --button-primary-hover: ${colors.components.button.primary.hover};
    --button-primary-text: ${colors.components.button.primary.text};
    
    --card-bg: ${colors.components.card.bg};
    --card-border: ${colors.components.card.border};
    --card-hover: ${colors.components.card.hover};
    
    --input-bg: ${colors.components.input.bg};
    --input-border: ${colors.components.input.border};
    --input-focus: ${colors.components.input.focus};
    --input-text: ${colors.components.input.text};
    --input-placeholder: ${colors.components.input.placeholder};
  }
`;

// Tailwind color classes
export const colorClasses = {
  text: {
    primary: 'text-[#FF3131]',
    secondary: 'text-[#FF6800]',
    tertiary: 'text-[#8B4513]',
    muted: 'text-neutral-400',
    inverse: 'text-white',
  },
  
  bg: {
    primary: 'bg-[#FF3131]',
    secondary: 'bg-[#FF6800]',
    tertiary: 'bg-[#8B4513]',
    dark: 'bg-black',
    card: 'bg-white/5',
    overlay: 'bg-black/80',
  },
  
  border: {
    default: 'border-white/10',
    hover: 'border-white/20',
    focus: 'border-[#FF3131]',
  },
  
  gradient: {
    primary: 'bg-gradient-to-r from-[#FF3131] to-[#FF6800]',
    dark: 'bg-gradient-to-b from-black to-neutral-900',
    card: 'bg-gradient-to-br from-red-600/5 to-orange-500/5',
  },
} as const;

// Utility function to apply color with opacity
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgb
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Contrast utilities
export function getContrastColor(bgColor: string): string {
  // Simple contrast calculation
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? colors.brand.black : colors.brand.white;
}

// Export theme object for use with libraries
export const theme = {
  colors,
  colorClasses,
  cssVariables,
  utils: {
    withOpacity,
    getContrastColor,
  },
} as const;
