'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarClientWrapper() {
  const pathname = usePathname();
  
  // Skip navbar on home page (it has custom content)
  const isHomePage = pathname === '/';
  
  // Skip navbar on admin dashboard (it uses its own layout)
  const isAdminPage = pathname.startsWith('/admin-dashboard');
  
  if (isHomePage) {
    return null;
  }
  
  return <Navbar />;
}