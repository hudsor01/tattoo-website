import { Inter, Montserrat, Pacifico, Satisfy } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});

export const satisfy = Satisfy({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-satisfy',
});