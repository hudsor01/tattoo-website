/**
 * Admin Dashboard Home Page - Shadcn/ui Dashboard 01 Implementation
 * 
 * Purpose: Main dashboard overview with key metrics and quick actions
 * Based on: https://ui.shadcn.com/blocks - Dashboard 01
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { SiteHeader } from '@/components/admin/layout/Header';
import { SectionCards } from '@/components/admin/dashboard/SectionCards';
import { ChartAreaInteractive } from '@/components/admin/dashboard/ChartAreaInteractive';
import { DataTable } from '@/components/admin/dashboard/DataTable';


export default async function AdminDashboardPage() {
  try {
    // Use the API route approach that was working
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // Call our session check API route
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://ink37tattoos.com' 
      : 'http://localhost:3000';
    
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session-check`, {
      headers: {
        'cookie': cookieString,
      },
      cache: 'no-store'
    });
    
    const { user, isAuthenticated, isAdmin } = await sessionResponse.json();

    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
      console.warn('Not authenticated, redirecting to unauthorized');
      redirect('/unauthorized');
    }

    // Check if user is admin
    if (!isAdmin) {
      console.warn('Not admin, redirecting to unauthorized');
      redirect('/unauthorized');
    }

    console.warn('Admin access granted for user:', user.email);

    // Shadcn/ui Dashboard 01 exact structure
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <SectionCards />
              <ChartAreaInteractive />
              <DataTable />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  } catch (error) {
    console.error('Admin page authentication error:', error);
    // If there's any auth error, redirect to unauthorized
    redirect('/unauthorized');
  }
}