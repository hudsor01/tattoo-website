'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, Calendar, CheckCircle, MessageSquare } from 'lucide-react';

/**
 * Admin Dashboard Page
 *
 * Central hub for admin functionality with stats, recent activity,
 * and quick access to common actions
 */
export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingBookings: 0,
    completedAppointments: 0,
    recentMessages: 0,
  });

  // Load dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      if (!user || !isAdmin) return;

      try {
        setIsLoading(true);

        // Load stats from Supabase
        // In a real implementation, this would fetch actual data
        // For now, we\'ll use placeholder values

        // Allow some time to simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));

        setStats({
          totalCustomers: 128,
          pendingBookings: 12,
          completedAppointments: 457,
          recentMessages: 8,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user, isAdmin]);

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Recent Messages',
      value: stats.recentMessages,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest bookings and customer interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                New booking from John Doe - Traditional sleeve
              </p>
              <p className="text-sm text-muted-foreground">
                Message from Jane Smith regarding appointment
              </p>
              <p className="text-sm text-muted-foreground">
                Payment received from Mike Johnson - $500
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}