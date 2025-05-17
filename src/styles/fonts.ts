import {
  Inter,
  Montserrat,
  Pacifico,
  Satisfy,
} from 'next/font/google';

// Inter font for body text - Main text font
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Montserrat for modern sans-serif - Used in components
export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Pacifico for cursive text - Used for decorative elements
export const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
  preload: true,
  fallback: ['cursive'],
});

// Satisfy for logo and stylized text - Used for branding
export const satisfy = Satisfy({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-satisfy',
  preload: true,
  fallback: ['cursive'],
});