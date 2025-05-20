'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import HomeNavbar from './HomeNavbar';

export default function NavigationSystem() {
  const pathname = usePathname();
  
  // Determine which type of navigation to show
  const isHomePage = pathname === '/';
  const isAdminDashboard = pathname.startsWith('/admin-dashboard');
  
  // Admin dashboard uses its own layout with navigation
  if (isAdminDashboard) {
    return null;
  }
  
  // Home page has its own special navigation
  if (isHomePage) {
    return <HomeNavbar />;
  }
  
  // All other pages use the standard navigation
  return <Navbar />;
}