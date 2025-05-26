import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { cookies } from 'next/headers';
import { inter, montserrat, pacifico, satisfy } from '../styles/fonts';
import Providers from './providers';
import NavigationSystem from '../components/layouts/NavigationSystem';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://ink37tattoos.com'),
  title: 'Ink 37 | Professional Tattoo Artist in Crowley, TX | Custom Tattoos DFW',
  description:
    'Professional tattoo artist in Crowley, TX serving Fort Worth, Arlington, Burleson & DFW area. Custom designs, cover-ups, fine line work, traditional tattoos. Book your consultation today!',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  keywords: [
    'tattoo artist Crowley TX',
    'custom tattoos Fort Worth',
    'tattoo shop DFW',
    'professional tattoo artist',
    'cover up tattoos',
    'fine line tattoos',
    'traditional tattoos',
    'tattoo consultation',
    'Ink 37',
    'Crowley tattoo',
    'Arlington tattoo',
    'Burleson tattoo',
    'Mansfield tattoo',
  ],
  creator: 'Ink 37',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ink37tattoos.com',
    title: 'Ink 37 | Professional Tattoo Artist in Crowley, TX | Custom Tattoos DFW',
    description:
      'Professional tattoo artist in Crowley, TX serving Fort Worth, Arlington, Burleson & DFW area. Custom designs, cover-ups, fine line work, traditional tattoos. Book your consultation today!',
    siteName: 'Ink 37',
    images: [
      {
        url: 'https://ink37tattoos.com/images/japanese.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional custom tattoo artwork by Ink 37 - Japanese style tattoo design',
        type: 'image/jpeg',
      },
      {
        url: 'https://ink37tattoos.com/images/traditional.jpg',
        width: 1200,
        height: 630,
        alt: 'Traditional style tattoo work by Ink 37 tattoo artist',
        type: 'image/jpeg',
      },
      {
        url: 'https://ink37tattoos.com/images/realism.jpg',
        width: 1200,
        height: 630,
        alt: 'Realistic tattoo artwork by professional tattoo artist Ink 37',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ink37tattoo',
    creator: '@ink37tattoo',
    title: 'Ink 37 | Professional Tattoo Artist in Crowley, TX | Custom Tattoos DFW',
    description:
      'Professional tattoo artist in Crowley, TX serving Fort Worth, Arlington, Burleson & DFW area. Custom designs, cover-ups, fine line work, traditional tattoos. Book your consultation today!',
    images: {
      url: 'https://ink37tattoos.com/images/japanese.jpg',
      alt: 'Professional custom tattoo artwork by Ink 37 - Japanese style tattoo design',
    },
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
  image: 'https://ink37tattoos.com/images/japanese.jpg',
  url: 'https://ink37tattoos.com',
  email: 'info@ink37tattoos.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Crowley',
    addressRegion: 'TX',
    addressCountry: 'US',
    postalCode: '76036',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Crowley',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Fort Worth',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Arlington',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Burleson',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Mansfield',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Forest Hill',
      containedInPlace: 'Texas',
    },
    {
      '@type': 'City',
      name: 'Grand Prairie',
      containedInPlace: 'Texas',
    },
  ],
  priceRange: '$$',
  description:
    'Professional tattoo artist in Crowley, TX specializing in custom tattoo designs, cover-ups, fine line work, and traditional tattoos. Serving the DFW metroplex including Fort Worth, Arlington, Burleson, Mansfield, Forest Hill, and Grand Prairie.',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    description: 'By appointment only',
  },
  serviceType: [
    'Custom Tattoo Design',
    'Cover-Up Tattoos',
    'Fine Line Tattoos',
    'Traditional Tattoos',
    'Realism Tattoos',
    'Japanese Style Tattoos',
    'Tattoo Consultation',
  ],
  sameAs: ['https://www.instagram.com/fennyg83/', 'https://www.tiktok.com/fennyg83/'],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get cookies for authentication
  const cookieStore = await cookies();
  const cookieEntries = Object.fromEntries(
    cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])
  );

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/admin"
      afterSignUpUrl="/admin"
      appearance={{
        variables: {
          colorPrimary: '#dc2626', // Red theme for tattoo branding
          colorBackground: '#000000',
          colorText: '#ffffff',
        },
        elements: {
          card: 'bg-zinc-900 border-zinc-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          socialButtonsBlockButton: 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700',
          formButtonPrimary: 'bg-red-600 hover:bg-red-700',
          footerActionLink: 'text-red-500 hover:text-red-400',
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} ${satisfy.variable}`}
        data-theme="dark"
        suppressHydrationWarning
      >
        <head>
          {/* Critical performance and SEO meta tags */}
          <meta name="emotion-insertion-point" content="" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#e53935" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="format-detection" content="telephone=no" />
          <link rel="canonical" href="https://ink37tattoos.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://qrcweallqlcgwiwzhqpb.supabase.co" />
          <link rel="dns-prefetch" href="https://js.clerk.com" />
          {/* Preload critical hero images */}
          <link rel="preload" href="/images/traditional.jpg" as="image" type="image/jpeg" />
          <link rel="preload" href="/images/japanese.jpg" as="image" type="image/jpeg" />
        </head>
        <body className="font-inter bg-black text-white antialiased">
          {/* Structured data for business */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
          />
          {/* Providers system */}
          <Providers cookies={cookieEntries}>
            <NavigationSystem />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
