import type { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
  title: 'About Us | Ink 37 Tattoos',
  description:
    'Learn about Ink 37, a custom tattoo studio in Dallas/Fort Worth. Meet Fernando Govea, a passionate artist with over 10 years of experience.',
};

/**
 * About Page - Server Component that wraps the client component
 * This pattern separates server and client concerns for better performance
 * UpdateNote: AboutClient component will now use the SharedLayout for consistency
 */
export default function AboutPage() {
  return <AboutClient />;
}
