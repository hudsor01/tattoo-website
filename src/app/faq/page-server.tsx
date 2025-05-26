import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'FAQ | Ink 37 Tattoos',
  description:
    'Frequently asked questions about getting a tattoo at Ink 37. Learn about our process, policies, pricing, and aftercare.',
  keywords: [
    'tattoo FAQ',
    'tattoo questions',
    'Ink 37 Tattoos',
    'Dallas tattoo',
    'Fort Worth tattoo',
  ],
};

// Dynamically import the client component
const FAQClient = nextDynamic(() => import('./page'), {
  ssr: true,
});

export default function FAQPage() {
  return <FAQClient />;
}
