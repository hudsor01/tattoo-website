'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Users,
  LayoutDashboard,
  Palette,
  Bell,
} from 'lucide-react';

const drawerWidth = 240;

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/admin-dashboard',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: <Calendar className="h-5 w-5" />,
    href: '/admin-dashboard/appointments',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users className="h-5 w-5" />,
    href: '/admin-dashboard/customers',
  },
  {
    id: 'emails',
    label: 'Email Campaigns',
    icon: <Mail className="h-5 w-5" />,
    href: '/admin-dashboard/emails',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/admin-dashboard/payments',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: <Palette className="h-5 w-5" />,
    href: '/admin-dashboard/gallery',
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem('adminToken');
    router.push('/admin-dashboard/auth/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/avatar-placeholder.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex mt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-muted/50 border-r transition-all duration-300",
            sidebarOpen ? "w-60" : "w-0 overflow-hidden"
          )}
        >
          <div className="p-4">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/admin-dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-primary">FGT</span>
                <span className="ml-2 text-sm text-muted-foreground">Admin</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <Link
                href="/admin-dashboard/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "ml-60" : "ml-0"
          )}
        >
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}