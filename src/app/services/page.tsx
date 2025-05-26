import type { Metadata } from 'next';
import ServicesClient from '@/components/services/ServicesClient';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'Services | Ink 37 Tattoos',
  description: 'Explore our range of tattoo services including custom designs, cover-ups, portrait work, and Japanese style tattoos. Book your consultation today.',
  keywords: ['tattoo services', 'custom tattoos', 'Fernando Govea', 'Dallas tattoo', 'Fort Worth tattoo'],
  openGraph: {
    title: 'Tattoo Services | Ink 37',
    description: 'Explore our range of premium tattoo services tailored to your vision. From custom designs to cover-ups, we bring your ideas to life.',
    images: ['/images/traditional.jpg'],
  },
};

/**
 * Services Page
 * 
 * Server Component that provides SEO metadata and wraps the client component.
 */
export default function ServicesPage() {
  return <ServicesClient />;
}