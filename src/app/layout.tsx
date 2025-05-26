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
  sameAs: ['https://www.instagram.com/fennyg83/', 'https://www.tiktok.com/fennyg83/'],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get cookies for authentication
  const cookieStore = await cookies();
  const cookieEntries = Object.fromEntries(
    cookieStore.getAll().map(cookie => [cookie.name, cookie.value])
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