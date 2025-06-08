import type React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tattoo Gallery',
  description: 'A modern tattoo gallery showcasing our portfolio and process videos',
};

export default function AceternityLayoutGrid({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
