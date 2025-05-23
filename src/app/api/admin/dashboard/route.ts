import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics and overview data for the admin dashboard
 */
export async function GET() {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Execute all database queries in parallel for better performance
    const [
      totalClients,
      newClientsThisMonth,
      newClientsPrevMonth,
      upcomingAppointments,
      upcomingAppointmentsCount,
      recentMessages,
      unreadMessagesCount,
      currentMonthPayments,
      prevMonthPayments,
      todayAppointments,
    ] = await Promise.all([
      // Total clients
      prisma.customer.count(),

      // New clients this month
      prisma.customer.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: today,
          },
        },
      }),

      // New clients previous month
      prisma.customer.count({
        where: {
          createdAt: {
            gte: startOfPrevMonth,
            lte: endOfPrevMonth,
          },
        },
      }),

      // Upcoming appointments
      prisma.appointment.findMany({
        where: {
          startDate: {
            gte: today,
          },
          status: {
            in: ['scheduled', 'confirmed'],
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        take: 5,
        include: {
          Customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),

      // Total upcoming appointments count
      prisma.appointment.count({
        where: {
          startDate: {
            gte: today,
          },
          status: {
            in: ['scheduled', 'confirmed'],
          },
        },
      }),

      // Recent messages (interactions)
      prisma.interaction.findMany({
        where: {
          type: 'message',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          Customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      // Unread messages count
      prisma.interaction.count({
        where: {
          type: 'message',
          direction: 'incoming',
          // No completedAt means not read yet
          completedAt: null,
        },
      }),

      // Monthly revenue
      prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: today,
          },
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),

      // Previous month revenue
      prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: startOfPrevMonth,
            lte: endOfPrevMonth,
          },
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),

      // Today's appointments
      prisma.appointment.findMany({
        where: {
          startDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        include: {
          Customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Format upcoming appointments for frontend
    const formattedUpcomingAppointments = upcomingAppointments.map((appointment: typeof upcomingAppointments[number]) => ({
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.startDate,
      endTime: appointment.endDate,
      status: appointment.status,
      client: `${appointment.Customer.firstName} ${appointment.Customer.lastName}`,
      clientId: appointment.Customer.id,
      deposit: appointment.deposit || 0,
      depositPaid: appointment.deposit ? true : false,
      service: appointment.description || appointment.title,
    }));

    // Calculate percentage change in clients
    const clientsPercentChange =
      newClientsPrevMonth > 0
        ? Math.round(((newClientsThisMonth - newClientsPrevMonth) / newClientsPrevMonth) * 100)
        : newClientsThisMonth > 0
          ? 100
          : 0;

    // Calculate percentage change in revenue
    const currentMonthRevenue = currentMonthPayments._sum.amount || 0;
    const prevMonthRevenue = prevMonthPayments._sum.amount || 0;
    const revenuePercentChange =
      prevMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : currentMonthRevenue > 0
          ? 100
          : 0;

    // Compile stats for frontend
    const stats = [
      {
        title: 'Total Clients',
        value: totalClients,
        description: 'Active clients in your studio',
        icon: 'PersonIcon',
        color: '#3b82f6',
        change: `${clientsPercentChange > 0 ? '+' : ''}${clientsPercentChange}%`,
        link: '/admin/dashboard/customers',
      },
      {
        title: 'Upcoming Sessions',
        value: upcomingAppointmentsCount,
        description: 'Scheduled in next 30 days',
        icon: 'EventIcon',
        color: '#d62828',
        change: 'Current',
        link: '/admin/dashboard/appointments',
      },
      {
        title: 'New Messages',
        value: unreadMessagesCount,
        description: 'Unread inquiries and requests',
        icon: 'MessageIcon',
        color: '#10b981',
        change: unreadMessagesCount > 0 ? 'New' : 'None',
        link: '/admin/dashboard/messages',
      },
      {
        title: 'Monthly Revenue',
        value: `$${currentMonthRevenue.toFixed(2)}`,
        description: 'Total payments this month',
        icon: 'PaymentIcon',
        color: '#9c27b0',
        change: `${revenuePercentChange > 0 ? '+' : ''}${revenuePercentChange}%`,
        link: '/admin/dashboard/payments',
      },
    ];

    return NextResponse.json({
      stats,
      upcomingAppointments: formattedUpcomingAppointments,
      recentMessages,
      todayAppointments,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
