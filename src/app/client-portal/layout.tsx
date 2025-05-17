'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  MessageSquare,
  BellRing,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading'
  );

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error checking auth user:', error);
        setAuthStatus('unauthenticated');
        return;
      }

      if (data.user) {
        // We still need session data for tokens, etc.
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
        router.push('/client/login');
      }
    };

    checkUser();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSession(session);
        setAuthStatus('authenticated');
      } else {
        setSession(null);
        setAuthStatus('unauthenticated');
        router.push('/client/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Fetch client data and notification counts
  useEffect(() => {
    async function fetchClientData() {
      if (authStatus === 'authenticated' && session?.user?.email) {
        setLoading(true);

        try {
          const supabase = createClient();

          // Use user data from the session instead of querying clients table
          const userData = session.user;

          // Set user metadata with fallbacks
          setClientData({
            id: userData.id,
            email: userData.email,
            first_name: userData.user_metadata?.first_name || 'Client',
            last_name: userData.user_metadata?.last_name || '',
            portal_enabled: true,
          });

          // Set default counts for now
          setUnreadNotifications(0);
          setUnreadMessages(0);
        } catch (err) {
          console.error('Error fetching client data:', err);
        } finally {
          setLoading(false);
        }
      } else if (authStatus === 'unauthenticated') {
        router.push('/client/login');
      }
    }

    fetchClientData();
  }, [session, authStatus, router]);

  // Navigation items
  const navItems = [
    { name: 'Appointments', href: '/client/appointments', icon: <Calendar size={20} /> },
    { name: 'Upcoming Session', href: '/client/upcoming', icon: <Clock size={20} /> },
    { name: 'My Profile', href: '/client/profile', icon: <User size={20} /> },
    { name: 'My Designs', href: '/client/designs', icon: <FileText size={20} /> },
    { name: 'Payments', href: '/client/payments', icon: <CreditCard size={20} /> },
    {
      name: 'Messages',
      href: '/client/messages',
      icon: <MessageSquare size={20} />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      name: 'Notifications',
      href: '/client/notifications',
      icon: <BellRing size={20} />,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  // Animations for mobile menu
  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  // Handle logout
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setAuthStatus('unauthenticated');
    router.push('/client/login');
    router.refresh(); // Force refresh to update the auth state
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden bg-tattoo-black text-white p-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2" aria-label="Open menu">
          <Menu size={24} />
        </button>

        <Link href="/client" className="flex items-center">
          <img src="/logo.svg" alt="Ink 37 Logo" className="h-8 w-auto mr-2" />
          <span className="text-xs bg-tattoo-red px-2 py-1 rounded">Client Portal</span>
        </Link>

        <Link href="/client/notifications">
          <div className="relative">
            <BellRing size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-tattoo-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
        </Link>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <aside className="w-64 bg-tattoo-black text-white h-screen fixed left-0 top-0 z-10">
          <ScrollArea className="h-full">
            <div className="p-6">
              <Link href="/" className="flex flex-col items-center mb-10">
                <img
                  src="/logo.svg"
                  alt="Ink 37 Logo"
                  className="h-12 w-auto mb-2"
                />
                <span className="text-xs bg-tattoo-red px-2 py-1 rounded">Client Portal</span>
              </Link>

              {/* Client info */}
              <div className="mb-8">
                {loading ? (
                  <>
                    <Skeleton className="h-16 w-16 rounded-full mb-4 mx-auto" />
                    <Skeleton className="h-5 w-3/4 mb-2 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </>
                ) : clientData ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-gray-700 mb-4 mx-auto flex items-center justify-center">
                      {clientData.avatar?.src ? (
                        <Image
                          src={clientData.avatar.src}
                          alt={`${clientData.first_name} ${clientData.last_name}`}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-medium text-gray-300">
                          {clientData.first_name?.[0]}
                          {clientData.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <h2 className="text-center font-semibold">
                      {clientData.first_name} {clientData.last_name}
                    </h2>
                    <p className="text-center text-sm text-gray-400">{clientData.email}</p>
                  </>
                ) : null}
              </div>

              {/* Navigation */}
              <nav>
                <ul className="space-y-2">
                  {navItems.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                          pathname === item.href
                            ? 'bg-tattoo-red text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-tattoo-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Logout button */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Return to website */}
              <div className="mt-4">
                <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center">
                  <ChevronRight size={14} className="mr-1" />
                  Return to Website
                </Link>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-grow p-8">{children}</main>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />

            <motion.nav
              className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-tattoo-black text-white overflow-y-auto"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/client" className="flex items-center gap-2">
                    <img
                      src="/logo.svg"
                      alt="Ink 37 Logo"
                      className="h-10 w-auto"
                    />
                    <span className="text-xs bg-tattoo-red px-2 py-1 rounded">Client</span>
                  </Link>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Client info */}
                <div className="mb-6">
                  {loading ? (
                    <>
                      <Skeleton className="h-16 w-16 rounded-full mb-4 mx-auto" />
                      <Skeleton className="h-5 w-3/4 mb-2 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </>
                  ) : clientData ? (
                    <>
                      <div className="h-16 w-16 rounded-full bg-gray-700 mb-4 mx-auto flex items-center justify-center">
                        {clientData.avatar?.src ? (
                          <Image
                            src={clientData.avatar.src}
                            alt={`${clientData.first_name} ${clientData.last_name}`}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-medium text-gray-300">
                            {clientData.first_name?.[0]}
                            {clientData.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <h2 className="text-center font-semibold">
                        {clientData.first_name} {clientData.last_name}
                      </h2>
                      <p className="text-center text-sm text-gray-400">{clientData.email}</p>
                    </>
                  ) : null}
                </div>

                {/* Navigation */}
                <nav>
                  <ul className="space-y-2">
                    {navItems.map(item => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                            pathname === item.href
                              ? 'bg-tattoo-red text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-tattoo-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Logout button */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </div>

                {/* Return to website */}
                <div className="mt-4">
                  <Link
                    href="/"
                    className="text-sm text-gray-400 hover:text-white flex items-center"
                  >
                    <ChevronRight size={14} className="mr-1" />
                    Return to Website
                  </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile content */}
      <main className="lg:hidden p-4">{children}</main>
    </div>
  );
}
