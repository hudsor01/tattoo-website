import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/seo-config';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Fernando Govea | Professional Tattoo Artist with 10+ Years Experience',
  description: 'Meet Fernando Govea, a professional tattoo artist with over 10 years of experience in custom tattoo design. Specializing in traditional, realism, and Japanese styles in Crowley, TX and the Dallas-Fort Worth metroplex.',
  keywords: [
    'Fernando Govea tattoo artist',
    'experienced tattoo artist Crowley TX',
    'professional tattoo artist bio',
    'Dallas Fort Worth tattoo artist',
    'custom tattoo specialist',
    '10+ years tattoo experience',
    'traditional tattoo artist',
    'realism tattoo specialist'
  ],
  canonical: 'https://ink37tattoos.com/about',
  ogImage: '/images/japanese.jpg',
});
