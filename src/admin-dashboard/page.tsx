/**
 * Admin Dashboard Home Page
 * 
 * Purpose: Main dashboard overview with key metrics and quick actions
 * Rendering: Server Component with Client Components for real-time data
 */

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardStatsCards from '@/components/admin/dashboard/DashboardStatsCards';
import RecentActivityCard from '@/components/admin/dashboard/RecentActivityCard';
import QuickActionsCard from '@/components/admin/dashboard/QuickActionsCard';

// Loading component for dashboard stats
function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 bg-muted/50" />
            <Skeleton className="h-4 w-4 bg-muted/50" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-muted/50 mb-2" />
            <Skeleton className="h-3 w-32 bg-muted/50" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening at Ink 37.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Key Metrics Cards */}
          <Suspense fallback={<DashboardLoading />}>
            <DashboardStatsCards />
          </Suspense>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest bookings, payments, and system activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-48 bg-muted/50" />
                            <Skeleton className="h-3 w-32 bg-muted/50" />
                          </div>
                          <Skeleton className="h-3 w-16 bg-muted/50" />
                        </div>
                      ))}
                    </div>
                  }>
                    <RecentActivityCard />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActionsCard />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}