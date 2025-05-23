'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  CreditCard,
} from 'lucide-react'

import { NavMain } from '@/components/admin/NavMain'
import { NavUser } from '@/components/admin/NavUser'
import { NavSecondary } from '@/components/admin/NavSecondary'
import { NavDocuments } from '@/components/admin/NavDocuments'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Admin',
    email: 'admin@ink37.com',
    avatar: '/logo.png', // Use the existing logo instead
  },
  teams: [
    {
      name: 'Ink 37 Admin',
      logo: GalleryVerticalEnd,
      plan: 'Admin Panel',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/admin',
        },
        {
          title: 'Analytics',
          url: '/admin/analytics',
        },
      ],
    },
    {
      title: 'Bookings',
      url: '/admin/bookings',
      icon: Calendar,
      items: [
        {
          title: 'All Bookings',
          url: '/admin/bookings',
        },
        {
          title: 'Cal.com Bookings',
          url: '/admin/cal-bookings',
        },
        {
          title: 'Appointments',
          url: '/admin/appointments',
        },
      ],
    },
    {
      title: 'Customers',
      url: '/admin/customers',
      icon: Users,
      items: [
        {
          title: 'All Customers',
          url: '/admin/customers',
        },
        {
          title: 'Customer Management',
          url: '/admin/customers/manage',
        },
      ],
    },
    {
      title: 'Gallery',
      url: '/admin/gallery',
      icon: GalleryVerticalEnd,
      items: [
        {
          title: 'Manage Gallery',
          url: '/admin/gallery',
        },
        {
          title: 'Upload Images',
          url: '/admin/gallery/upload',
        },
      ],
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: CreditCard,
      items: [
        {
          title: 'All Payments',
          url: '/admin/payments',
        },
        {
          title: 'Payment Reports',
          url: '/admin/payments/reports',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings2,
    },
    {
      title: 'Setup',
      url: '/admin/setup',
      icon: Bot,
    },
  ],
  documents: [
    {
      name: 'Booking Guide',
      url: '/docs/booking-guide',
      icon: Frame,
    },
    {
      name: 'API Docs',
      url: '/docs/api',
      icon: PieChart,
    },
    {
      name: 'System Manual',
      url: '/docs/manual',
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-tattoo-red text-sidebar-primary-foreground">
            <Command className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-tattoo-red">Ink 37 Admin</span>
            <span className="truncate text-xs text-muted-foreground">Tattoo Studio</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}