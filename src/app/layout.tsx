// Import polyfills at the very top for SSR
import '../utils/polyfills';

import type { Metadata } from 'next';
import { inter, montserrat, pacifico, satisfy } from '../styles/fonts';
import Providers from '@/app/providers';
import NavigationSystem from '@/components/layouts/NavigationSystem';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_BASE_URL'] || 'https://ink37tattoos.com'),
  title: 'Ink 37 | Dallas/Fort Worth',
  description:
    'Ink 37 is a premier tattoo artist in the Dallas/Fort Worth metroplex specializing in custom designs. Book your consultation today and bring your vision to life.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  keywords: [
    'tattoo',
    'Dallas tattoo',
    'Fort Worth tattoo',
    'custom tattoos',
    'tattoo artist',
    'Ink 37',
    'Fernando Govea',
  ],
  creator: 'Fernando Govea',
  openGraph: {
    type: 'website',
    url: 'https://ink37tattoos.com',
    title: 'Ink 37 | Custom Tattoos in Dallas/Fort Worth',
    description:
      'Premier tattoo artist in the Dallas/Fort Worth metroplex specializing in custom designs. Schedule your consultation today.',
    siteName: 'Ink 37',
    images: [
      {
        url: '/images/japanese.jpg',
        width: 1200,
        height: 630,
        alt: 'Ink 37',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ink 37 | Custom Tattoos in Dallas/Fort Worth',
    description:
      'Premier tattoo artist in the Dallas/Fort Worth metroplex specializing in custom designs. Schedule your consultation today.',
    images: ['/images/japanese.jpg'],
    creator: '@ink37tattoo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Schema.org JSON-LD script for business info
const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'TattooParlorService',
  name: 'Ink 37',
  image: '/images/japanese.jpg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dallas/Fort Worth',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  priceRange: '$',
  description: 'Custom tattoos in the Dallas/Fort Worth metroplex',
  telephone: 'By appointment only',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '18:00',
  },
  sameAs: ['https://www.instagram.com/fennyg83/', 'https://www.facebook.com/fennyg83/'],
};

import type { RootLayoutProps } from '@/types/component-types';

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} ${satisfy.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Add an emotion insertion point to control CSS order */}
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className="font-inter bg-black text-white antialiased">
        {/* Structured data for business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        {/* Providers system */}
        <Providers>
          <NavigationSystem />
          {children}
        </Providers>
      </body>
    </html>
  );
}