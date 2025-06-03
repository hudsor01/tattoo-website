/**
 * Admin Dashboard API - Cal.com Integration
 * 
 * Purpose: Fetch real-time booking and analytics data for admin dashboard
 * Dependencies: Cal.com webhooks, Prisma database, analytics services
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { User } from '@prisma/client';

import { logger } from "@/lib/logger";
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as User;
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch dashboard metrics
    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      totalCustomers,
      recentAppointments
    ] = await Promise.all([
      // Total appointments
      prisma.appointment.count(),
      
      // Pending appointments
      prisma.appointment.count({
        where: { status: "PENDING" }
      }),
      
      // Confirmed appointments
      prisma.appointment.count({
        where: { status: "CONFIRMED" }
      }),
      
      // Cancelled appointments
      prisma.appointment.count({
        where: { status: "CANCELLED" }
      }),
      
      // Total customers
      prisma.customer.count(),
      
      // Recent appointments with customer info
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ]);

    // Calculate revenue metrics
    const revenueData = await prisma.appointment.aggregate({
      _sum: {
        totalPrice: true
      },
      _avg: {
        totalPrice: true
      },
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      }
    });

    // Calculate customer metrics (simplified for now)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Format recent bookings
    const recentBookings = recentAppointments.map(appointment => ({
      id: appointment.id,
      customerName: appointment.customer 
        ? `${appointment.customer.firstName} ${appointment.customer.lastName}`.trim()
        : 'Unknown Customer',
      service: getServiceName(appointment.serviceId),
      date: appointment.startTime.toLocaleDateString(),
      status: appointment.status.toLowerCase() as 'pending' | 'confirmed' | 'cancelled',
      amount: appointment.totalPrice ?? 0
    }));

    // Cal.com webhook status (mock for now - you can track this in a separate table)
    const calStatus = {
      lastReceived: recentAppointments.length > 0 
        ? recentAppointments[0].createdAt.toISOString()
        : null,
      isConnected: recentAppointments.length > 0,
      totalWebhooks: totalAppointments // Simplified - you might want to track actual webhook events
    };

    const dashboardData = {
      metrics: {
        totalBookings: totalAppointments,
        pendingBookings: pendingAppointments,
        confirmedBookings: confirmedAppointments,
        cancelledBookings: cancelledAppointments,
        totalRevenue: revenueData._sum.totalPrice ?? 0,
        avgBookingValue: Math.round(revenueData._avg.totalPrice ?? 0),
        newCustomers,
        returningCustomers: totalCustomers - newCustomers,
      },
      recentBookings,
      calStatus,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    void logger.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get service name from service ID
function getServiceName(serviceId: string): string {
  const serviceMap: Record<string, string> = {
    'consultation': 'Consultation',
    'small_tattoo': 'Small Tattoo',
    'medium_tattoo': 'Medium Tattoo',
    'large_tattoo': 'Large Tattoo',
    'touch_up': 'Touch Up',
    'default_service': 'General Service'
  };
  
  return serviceMap[serviceId] ?? 'Unknown Service';
}
