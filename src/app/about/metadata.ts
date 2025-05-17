import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Fernando Govea | Professional Tattoo Artist',
  description: 'Meet Fernando Govea, a professional tattoo artist with over 10 years of experience in custom tattoo design. Located in the Dallas/Fort Worth metroplex.',
  keywords: 'fernando govea, tattoo artist biography, professional tattoo artist, dallas fort worth tattoo artist story, experienced tattoo artist',
  openGraph: {
    title: 'About Fernando Govea - Professional Tattoo Artist',
    description: 'Learn about Fernando Govea\'s journey as a professional tattoo artist with over 10 years of experience in custom designs.',
    url: '/about',
    siteName: 'Fernando Govea Tattoo',
    images: [
      {
        url: '/images/fernando-artist.jpg',
        width: 1200,
        height: 630,
        alt: 'Fernando Govea - Professional Tattoo Artist',
      },
    ],
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Fernando Govea - Professional Tattoo Artist',
    description: 'Learn about Fernando Govea\'s journey and experience in tattoo artistry.',
    images: ['/images/fernando-artist.jpg'],
  },
  alternates: {
    canonical: '/about',
  },
};