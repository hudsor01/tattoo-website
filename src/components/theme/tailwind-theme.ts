import tokens from './tokens';

/**
 * Tailwind CSS theme configuration
 * This extends the existing Tailwind config with our design tokens
 */
export const tailwindTheme = {
  // Extend the existing Tailwind theme with our custom colors
  extend: {
    colors: {
      // Add our brand colors to Tailwind
      tattoo: {
        black: tokens.colors.tattoo.black,
        red: {
          DEFAULT: tokens.colors.tattoo.red.DEFAULT,
          dark: tokens.colors.tattoo.red.dark,
          light: tokens.colors.tattoo.red.light,
        },
        blue: {
          DEFAULT: tokens.colors.tattoo.blue.DEFAULT,
          dark: tokens.colors.tattoo.blue.dark,
          light: tokens.colors.tattoo.blue.light,
        },
        white: tokens.colors.tattoo.white,
        green: tokens.colors.tattoo.green,
      },

      // Add semantic colors
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
      info: tokens.colors.info,

      // Replace the default neutral palette with ours
      neutral: tokens.colors.neutral,

      // Add css variables for light/dark mode theming with shadcn
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },

    // Add our border radius tokens
    borderRadius: tokens.borderRadius,

    // Add our typography tokens
    fontFamily: {
      display: [tokens.typography.fontFamily.display, 'sans-serif'],
      heading: [tokens.typography.fontFamily.heading, 'sans-serif'],
      body: [tokens.typography.fontFamily.body, 'sans-serif'],
      accent: [tokens.typography.fontFamily.accent, 'cursive'],
      cursive: [tokens.typography.fontFamily.cursive, 'cursive'],
      mono: tokens.typography.fontFamily.mono,
    },

    // Add our spacing tokens
    spacing: tokens.spacing,

    // Add our shadow tokens
    boxShadow: tokens.shadows,

    // Add custom keyframes for animations
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(1rem)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-1rem)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },

    // Add custom animation utilities
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
      fadeIn: 'fadeIn 0.5s ease-out',
      slideUp: 'slideUp 0.5s ease-out',
      slideDown: 'slideDown 0.5s ease-out',
    },
  },
};

/**
 * CSS variables for light mode and dark mode
 * These are used by shadcn components
 */
export const lightModeColors = {
  '--background': '0 0% 100%',
  '--foreground': '12 10% 10%',
  '--card': '0 0% 100%',
  '--card-foreground': '12 10% 10%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '12 10% 10%',
  '--primary': '4 82% 50%', // tattoo-red
  '--primary-foreground': '0 0% 100%',
  '--secondary': '214 100% 60%', // tattoo-blue
  '--secondary-foreground': '0 0% 100%',
  '--muted': '12 5% 92%',
  '--muted-foreground': '12 5% 40%',
  '--accent': '12 8% 92%',
  '--accent-foreground': '12 40% 20%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '12 5% 88%',
  '--input': '12 5% 88%',
  '--ring': '214 100% 60%', // tattoo-blue
  '--radius': '0.5rem',
};

export const darkModeColors = {
  '--background': '12 10% 4%', // tattoo-black
  '--foreground': '0 0% 100%',
  '--card': '12 10% 5%',
  '--card-foreground': '0 0% 100%',
  '--popover': '12 10% 5%',
  '--popover-foreground': '0 0% 100%',
  '--primary': '4 82% 50%', // tattoo-red
  '--primary-foreground': '0 0% 100%',
  '--secondary': '214 100% 60%', // tattoo-blue
  '--secondary-foreground': '0 0% 100%',
  '--muted': '12 5% 15%',
  '--muted-foreground': '12 5% 65%',
  '--accent': '12 8% 15%',
  '--accent-foreground': '0 0% 100%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 100%',
  '--border': '12 5% 15%',
  '--input': '12 5% 15%',
  '--ring': '214 100% 60%', // tattoo-blue
  '--radius': '0.5rem',
};

export default tailwindTheme;
