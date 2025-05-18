'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLogo from './AdminLogo';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Mail, 
  CreditCard, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Menu items for the sidebar
const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin-dashboard',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: CalendarDays,
    href: '/admin-dashboard/appointments',
  },
  {
    id: 'cal-bookings',
    label: 'Cal.com Bookings',
    icon: CalendarDays,
    href: '/admin-dashboard/cal-bookings',
  },
  { 
    id: 'customers', 
    label: 'Customers', 
    icon: Users, 
    href: '/admin-dashboard/customers' 
  },
  {
    id: 'email-campaigns',
    label: 'Email Campaigns',
    icon: Mail,
    href: '/admin-dashboard/email-campaigns',
  },
  { 
    id: 'payments', 
    label: 'Payments', 
    icon: CreditCard, 
    href: '/admin-dashboard/payments' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    href: '/admin-dashboard/settings' 
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/admin-dashboard/auth/login');
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-3 p-4">
              <AdminLogo />
              <span className="text-lg font-semibold">Admin Portal</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin-dashboard/notifications')}
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <Avatar 
                className="cursor-pointer"
                onClick={() => router.push('/admin-dashboard/settings')}
              >
                <AvatarFallback>F</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}