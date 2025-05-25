'use client'

import { AppSidebar } from '@/components/admin/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import '../../globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const sidebarDefaultOpen = true

  return (
    <div className="min-h-screen bg-black text-white dark">
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>
        <AppSidebar />
        <SidebarInset className="min-h-screen bg-black text-white">
          <main className="flex-1 p-6 space-y-6 bg-black text-white">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}