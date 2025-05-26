'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import HomeNavbar from './HomeNavbar';

export default function NavigationSystem() {
  const pathname = usePathname();

  // Determine which type of navigation to show
  const isHomePage = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/sign-in') ?? pathname.startsWith('/sign-up');

  // Admin routes use their own layout with navigation
  if (isAdminRoute) {
    return null;
  }

  // Auth routes (sign-in/sign-up) should not show navigation
  if (isAuthRoute) {
    return null;
  }

  // Home page has its own special navigation
  if (isHomePage) {
    return <HomeNavbar />;
  }

  // All other pages use the standard navigation
  return <Navbar />;
}
