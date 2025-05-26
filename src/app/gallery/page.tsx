import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';

const GalleryClient = dynamicImport(() => import('@/components/gallery/GalleryClient'), {
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <div className="text-lg">Loading gallery...</div>
    </div>
  ),
});

// Force static generation with revalidation every 2 hours (new tattoos)
export const dynamic = 'force-static';
export const revalidate = 7200;

export const metadata: Metadata = {
  title: 'Gallery | Ink 37 Tattoos',
  description:
    "Explore our tattoo gallery showcasing Ink 37 Tattoos' custom designs, Japanese style, traditional, and realism tattoos. Get inspired for your next ink.",
  keywords: [
    'tattoo gallery',
    'custom tattoos',
    'Ink 37 Tattoos',
    'Dallas tattoo',
    'Fort Worth tattoo',
    'ink inspiration',
  ],
  openGraph: {
    title: 'Tattoo Gallery | Ink 37',
    description:
      'Browse our collection of custom tattoo artwork by Ink 37 Tattoos. Find inspiration for your next tattoo piece.',
    images: ['/images/gallery-banner.jpg'],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
