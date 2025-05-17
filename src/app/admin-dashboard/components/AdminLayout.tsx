'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  MonitorSmartphone,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { useAnalyticsContext } from '../../../components/providers/AnalyticsProvider';
import { AnalyticsNotifier } from '@/app/admin/analytics/components/AnalyticsNotifier';

interface AdminLayoutProps {
  children: ReactNode;
}

// Navigation items with analytics tracking
const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
  },
  {
    name: 'Gallery',
    href: '/admin/gallery',
    icon: ImageIcon,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Client Portal',
    href: '/admin/client-portal',
    icon: MonitorSmartphone,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: LineChart,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { trackInteraction } = useAnalyticsContext();

  // Track navigation item clicks
  const handleNavClick = (itemName: string) => {
    trackInteraction({
      action: 'click',
      label: `admin_nav_${itemName.toLowerCase().replace(/\s+/g, '_')}`,
      elementType: 'navigation',
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center justify-center h-14">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold tracking-tight">Ink37 Admin</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex-1 space-y-1">
              {NAVIGATION_ITEMS.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.name} href={item.href} onClick={() => handleNavClick(item.name)}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive ? 'bg-primary text-primary-foreground' : '',
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">admin@ink37.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold tracking-tight">Ink37 Admin</span>
            </Link>
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Main content area with error boundary */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <ErrorBoundary componentName="AdminContent">{children}</ErrorBoundary>
        </main>
      </div>

      {/* Toaster for notifications */}
      <Toaster position="top-right" />

      {/* Analytics real-time notifier */}
      <AnalyticsNotifier />
    </div>
  );
}
