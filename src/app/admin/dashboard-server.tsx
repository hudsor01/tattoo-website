import { cache } from 'react';
import 'server-only';
import type { Client } from '@/types/customer-types';
import type { Booking } from '@/types/booking-types';

// Cached data fetching functions for Server Components
export const getCustomersData = cache(async () => {
  'use server';

  try {
    // Using fetch with proper caching for production
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/customers`, {
      cache: 'no-store', // Always fresh data for admin dashboard
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    const data = await response.json();
    return data.clients ?? [];
  } catch (error) {
    void console.error('Error fetching customers:', error);
    return [];
  }
});

export const getBookingsData = cache(async () => {
  'use server';

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/bookings`, {
      cache: 'no-store', // Always fresh data for admin dashboard
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();
    return data.bookings ?? [];
  } catch (error) {
    void console.error('Error fetching bookings:', error);
    return [];
  }
});

export const getDashboardStats = cache(async () => {
  'use server';

  // Fetch data in parallel for better performance
  const [customers, bookings] = await Promise.all([getCustomersData(), getBookingsData()]);

  // Calculate metrics on the server
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const customersThisMonth = customers.filter(
    (c: Client) => new Date(c.createdAt) >= thisMonth
  ).length;

  const customersLastMonth = customers.filter(
    (c: Client) => new Date(c.createdAt) >= lastMonth && new Date(c.createdAt) <= endLastMonth
  ).length;

  const customerGrowth =
    customersLastMonth > 0
      ? Math.round(((customersThisMonth - customersLastMonth) / customersLastMonth) * 100)
      : customersThisMonth > 0
        ? 100
        : 0;

  const completedBookings = bookings.filter((b: Booking) => b.status === 'completed').length;

  const upcomingBookings = bookings.filter(
    (b: Booking) => b.status === 'scheduled' && b.preferredDate && new Date(b.preferredDate) > now
  ).length;

  const totalBookings = bookings.length;
  const completionRate =
    totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const totalRevenue = completedBookings * 350; // Estimated revenue per session
  const revenueGrowth = completedBookings > 0 ? 8 : 0;

  return {
    totalCustomers: customers.length,
    newCustomersThisMonth: customersThisMonth,
    customerGrowth,
    totalBookings,
    completedBookings,
    upcomingBookings,
    bookingGrowth: completedBookings > 0 ? 5 : 0,
    totalRevenue,
    revenueGrowth,
    completionRate,
  };
});

export const getRecentActivity = cache(async () => {
  'use server';

  const [customers, bookings] = await Promise.all([getCustomersData(), getBookingsData()]);

  const activity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'customer' | 'booking';
  }> = [];

  // Add recent customer activity
  customers.slice(0, 2).forEach((customer: Client) => {
    activity.push({
      id: `customer-${customer.id}`,
      message: 'New customer registered',
      timestamp: new Date(customer.createdAt).toISOString(),
      type: 'customer',
    });
  });

  // Add recent booking activity
  bookings.slice(0, 2).forEach((booking: Booking) => {
    const date = booking.preferredDate
      ? new Date(booking.preferredDate).toLocaleDateString()
      : 'TBD';
    activity.push({
      id: `booking-${booking.id}`,
      message: `${booking.status === 'completed' ? 'Completed' : 'Scheduled'} appointment for ${date}`,
      timestamp: new Date(booking.createdAt).toISOString(),
      type: 'booking',
    });
  });

  // Sort by timestamp
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activity.slice(0, 5);
});

// Preload functions for better performance
export const preloadDashboardData = () => {
  void getDashboardStats();
  void getRecentActivity();
};
