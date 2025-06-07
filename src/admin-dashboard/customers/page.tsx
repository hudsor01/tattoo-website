/**
 * Admin Customers Page
 * 
 * Purpose: View and manage customer database
 * Rendering: Server Component with Client Components for interactivity
 */

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { Users, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CustomersList from '@/components/admin/customers/CustomersList';
import CustomerStatsCards from '@/components/admin/customers/CustomerStatsCards';

// Loading component for customers table
function CustomersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-4">
        <Skeleton className="h-10 flex-1 bg-muted/50" />
        <Skeleton className="h-10 w-32 bg-muted/50" />
      </div>
      
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 bg-muted/50" />
            ))}
          </div>
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-muted/50" />
                <Skeleton className="h-3 w-48 bg-muted/50" />
              </div>
              <Skeleton className="h-4 w-16 bg-muted/50" />
              <Skeleton className="h-4 w-20 bg-muted/50" />
              <Skeleton className="h-6 w-16 bg-muted/50 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="text-muted-foreground">Manage your customer database and relationships</p>
            </div>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>

          {/* Customer Stats Overview */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 bg-muted/50" />
                      <Skeleton className="h-4 w-24 bg-muted/50" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-muted/50 mb-2" />
                    <Skeleton className="h-3 w-32 bg-muted/50" />
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <CustomerStatsCards />
          </Suspense>

          {/* Customers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Directory
              </CardTitle>
              <CardDescription>View and manage all customer information</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<CustomersLoading />}>
                <CustomersList />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}