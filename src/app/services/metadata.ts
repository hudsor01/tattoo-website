import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/seo-config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Tattoo Services | Custom Designs, Cover-ups & Fine Line Work',
  description: 'Professional tattoo services in Crowley, TX including custom tattoo designs, cover-ups, fine line work, traditional tattoos, realism, and Japanese styles. Expert consultation and booking available.',
  keywords: [
    'tattoo services Crowley TX',
    'custom tattoo design',
    'cover-up tattoos',
    'fine line tattoos',
    'traditional tattoos',
    'realism tattoos',
    'japanese style tattoos',
    'tattoo consultation',
    'professional tattoo artist',
    'DFW tattoo services'
  ],
  canonical: 'https://ink37tattoos.com/services',
  ogImage: '/images/traditional.jpg',
});
