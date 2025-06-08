'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavigationSystem() {
  const pathname = usePathname();

  // Admin and dashboard routes use their own layout - no navigation needed
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null;
  }

  // Auth routes should not show navigation
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/auth')) {
    return null;
  }

  // Home page uses navigation from HomeClient component - no navigation needed here
  if (pathname === '/') {
    return null;
  }

  // All other pages use standard navigation
  return <Navbar />;
}
