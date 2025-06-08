import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/seo-config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Tattoo Gallery | Custom Tattoo Designs & Artwork',
  description: 'Explore our professional tattoo gallery featuring custom designs, cover-ups, traditional, realism, and Japanese style tattoos. See quality artwork from our Crowley, TX tattoos.',
  keywords: [
    'tattoo gallery',
    'custom tattoo designs',
    'tattoo artwork',
    'cover up tattoos',
    'traditional tattoos',
    'realism tattoos',
    'japanese tattoos',
    'tattoo portfolio',
    'Crowley TX tattoo work',
    'DFW tattoo gallery'
  ],
  canonical: 'https://ink37tattoos.com/gallery',
  ogImage: '/images/japanese.jpg',
});
