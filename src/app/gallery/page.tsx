import type { Metadata } from 'next';
import GalleryClient from '@/components/gallery/GalleryClient';

export const metadata: Metadata = {
  title: 'Gallery | Ink 37 Tattoos',
  description: 'Explore our tattoo gallery showcasing Fernando Govea\'s custom designs, Japanese style, traditional, and realism tattoos. Get inspired for your next ink.',
  keywords: ['tattoo gallery', 'custom tattoos', 'Fernando Govea', 'Dallas tattoo', 'Fort Worth tattoo', 'ink inspiration'],
  openGraph: {
    title: 'Tattoo Gallery | Ink 37',
    description: 'Browse our collection of custom tattoo artwork by Fernando Govea. Find inspiration for your next tattoo piece.',
    images: ['/images/gallery-banner.jpg'],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}