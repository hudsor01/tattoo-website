import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Ink 37',
  description:
    'Explore the tattoo portfolio of Fernando Govea at Ink 37. Browse custom designs, portraits, fine line work, and cover-ups.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
