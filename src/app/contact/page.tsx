import type { Metadata } from 'next';
import ContactClient from '@/components/contact/ContactClient';

// Enable static generation with revalidation every 24 hours  
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Contact | Ink 37 Tattoos',
  description: 'Get in touch with Ink 37 Tattoos for consultations, questions, or to book your next tattoo session. Located in the Dallas/Fort Worth area.',
  keywords: ['tattoo contact', 'tattoo consultation', 'Dallas tattoo', 'Fort Worth tattoo', 'Fernando Govea'],
  openGraph: {
    title: 'Contact Ink 37 Tattoos',
    description: 'Get in touch with us for consultations, questions, or to book your next tattoo session. Located in the Dallas/Fort Worth area.',
    images: ['/images/contact-banner.jpg'],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}