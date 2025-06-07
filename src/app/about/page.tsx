import AboutClient from '@/components/AboutClient';
import { metadata } from './metadata';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

// Export metadata from metadata.ts file
export { metadata };

/**
 * About Page - Server Component that wraps the client component
 * This pattern separates server and client concerns for better performance
 * UpdateNote: AboutClient component will now use the SharedLayout for consistency
 */
export default function AboutPage() {
  return <AboutClient />;
}
