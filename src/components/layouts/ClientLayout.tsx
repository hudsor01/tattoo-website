'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from './DashboardLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Special layouts for admin or client portal
  if (pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (pathname.startsWith('/customer')) {
    return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
  }

  // Default layout for public pages
  return <MainLayout>{children}</MainLayout>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/gallery', label: 'Gallery', active: pathname === '/gallery' },
    { href: '/services', label: 'Services', active: pathname === '/services' },
    { href: '/booking', label: 'Booking', active: pathname === '/booking' },
    { href: '/about', label: 'About', active: pathname === '/about' },
    { href: '/contact', label: 'Contact', active: pathname === '/contact' },
    { href: '/customer/login', label: 'Client Portal', active: pathname === '/customer/login' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-satisfy text-3xl text-red-500 hover:text-red-600 transition">
            Ink 37
          </Link>
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" active={pathname === '/'}>Home</NavLink>
            <NavLink href="/gallery" active={pathname === '/gallery'}>Gallery</NavLink>
            <NavLink href="/services" active={pathname === '/services'}>Services</NavLink>
            <NavLink href="/booking" active={pathname === '/booking'}>Booking</NavLink>
            <NavLink href="/about" active={pathname === '/about'}>About</NavLink>
            <NavLink href="/contact" active={pathname === '/contact'}>Contact</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/customer/login" className="hidden md:inline-block text-white hover:text-red-500 transition text-sm">
              Client Portal
            </Link>
            <MobileMenuButton onClick={toggleMobileMenu} />
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
        links={navLinks} 
      />

      <main className="flex-grow">{children}</main>

      <footer className="bg-black text-white border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-satisfy text-2xl text-red-500 mb-4">Ink 37</h3>
              <p className="text-gray-400">Premium tattoo artistry in the Dallas/Fort Worth area. Custom designs, exceptional quality.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/gallery" className="text-gray-400 hover:text-white transition">Gallery</Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-white transition">Services</Link></li>
                <li><Link href="/booking" className="text-gray-400 hover:text-white transition">Book Now</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Monday-Friday: 10AM-7PM</li>
                <li className="text-gray-400">Saturday: 10AM-5PM</li>
                <li className="text-gray-400">Sunday: Closed</li>
                <li className="text-gray-400 italic mt-4">By appointment only</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              <div className="mt-6">
                <Link href="/customer/login" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Client Login</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Ink 37. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const CustomerPortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const portalLinks = [
    { href: '/customer', label: 'Dashboard', active: pathname === '/customer' },
    { href: '/customer/appointments', label: 'Appointments', active: pathname === '/customer/appointments' },
    { href: '/customer/designs', label: 'Designs', active: pathname === '/customer/designs' },
    { href: '/', label: 'Exit Portal', active: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <header className="bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/customer" className="font-satisfy text-2xl text-red-500 hover:text-red-600 transition">
            Ink 37 Client Portal
          </Link>
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/customer" active={pathname === '/customer'}>Dashboard</NavLink>
            <NavLink href="/customer/appointments" active={pathname === '/customer/appointments'}>Appointments</NavLink>
            <NavLink href="/customer/designs" active={pathname === '/customer/designs'}>Designs</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/" className="hidden md:inline-block text-white hover:text-red-500 transition text-sm">
              Exit Portal
            </Link>
            <MobileMenuButton onClick={toggleMobileMenu} />
          </div>
        </div>
      </header>

      {/* Mobile menu for client portal */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu} 
        links={portalLinks} 
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-black text-white border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Ink 37. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper components
const NavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({ href, active, children }) => {
  return (
    <Link
      href={href}
      className={`${
        active ? 'text-red-500' : 'text-white hover:text-red-500'
      } transition`}
    >
      {children}
    </Link>
  );
};

const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button 
      className="md:hidden text-white focus:outline-none" 
      onClick={onClick}
      aria-label="Toggle mobile menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

const MobileMenu: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  links: { href: string; label: string; active: boolean }[];
}> = ({ isOpen, onClose, links }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 md:hidden">
      <div className="h-full w-64 bg-gray-900 p-4 shadow-lg transform transition-transform">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-red-500">Menu</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav>
          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block py-2 ${
                    link.active ? 'text-red-500' : 'text-white hover:text-red-500'
                  } transition`}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the existing DashboardLayout component for admin pages
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ClientLayout;