import type { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';

export const metadata: Metadata = {
  title: 'Ink 37 | Custom Tattoos in Dallas/Fort Worth',
  description: 'Premier tattoo artist in the Dallas/Fort Worth metroplex specializing in custom designs. Schedule your consultation today.',
  keywords: ['tattoo', 'Dallas tattoo', 'Fort Worth tattoo', 'custom tattoos', 'tattoo artist', 'Ink 37', 'Fernando Govea'],
  openGraph: {
    title: 'Ink 37 Tattoos | Custom Designs by Fernando Govea',
    description: 'Experience exceptional custom tattoo artistry in the Dallas/Fort Worth area. Book a consultation and bring your vision to life.',
    images: ['/images/japanese.jpg'],
  },
};

export default function HomePage() {
  return <HomeClient />;
}