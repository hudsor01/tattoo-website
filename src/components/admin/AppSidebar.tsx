'use client'

import * as React from 'react'
import {
  Calendar,
  Command,
  GalleryVerticalEnd,
  Settings,
  LayoutDashboard,
  Users,
  CreditCard,
  Image,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react'

import { NavMain } from '@/components/admin/NavMain'
import { NavUser } from '@/components/admin/NavUser'
import { NavSecondary } from '@/components/admin/NavSecondary'
import { SidebarSearch } from '@/components/admin/SidebarSearch'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

const staticData = {
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
      icon: LayoutDashboard,
    },
    {
      title: 'Bookings',
      url: '/admin/bookings',
      icon: Calendar,
    },
    {
      title: 'Appointments',
      url: '/admin/appointments',
      icon: Calendar,
    },
    {
      title: 'Customers',
      url: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Gallery',
      url: '/admin/gallery',
      icon: Image,
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: CreditCard,
    },
  ],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  useSidebar()
  const [isFixed, setIsFixed] = React.useState(true)
  
  const userData = user ? {
    name: user.fullName ?? user.firstName ?? 'Admin',
    email: user.primaryEmailAddress?.emailAddress ?? 'admin@ink37.com',
    avatar: user.imageUrl ?? '/logo.png',
  } : {
    name: 'Admin',
    email: 'admin@ink37.com', 
    avatar: '/logo.png',
  }

  const settingsItem = {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  }

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible={isFixed ? "none" : "icon"} 
      className="border-r border-slate-800 bg-slate-900 shadow-lg h-screen flex flex-col" 
      {...props}
    >
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-tattoo-red text-sidebar-primary-foreground shadow-sm">
              <Command className="size-6" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-bold text-xl text-tattoo-red">Ink 37 Tattoos</span>
            </div>
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFixed(!isFixed)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2"
            title={isFixed ? "Switch to collapsible" : "Switch to fixed"}
          >
            {isFixed ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col h-full flex-1 overflow-hidden">
        <div className="px-4 py-3 flex-shrink-0">
          <SidebarSearch />
        </div>
        
        {/* Main Navigation - Takes up available space */}
        <div className="flex-1 overflow-y-auto px-2">
          <NavMain items={staticData.navMain} />
        </div>
        
        {/* Bottom section - Settings and User */}
        <div className="flex-shrink-0 px-2 pb-2 space-y-2">
          <NavSecondary items={[settingsItem]} />
        </div>
      </SidebarContent>
      
      <SidebarFooter className="flex-shrink-0 bg-slate-900 border-t border-slate-800">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
