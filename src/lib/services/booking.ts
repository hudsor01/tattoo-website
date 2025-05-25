import { prisma } from '@/lib/db/prisma';

/**
 * Booking Service - Admin Functions Only
 * 
 * This service handles admin/read-only operations for bookings.
 * All customer booking creation is handled by Cal.com webhooks.
 */

/**
 * Get a booking by ID (Admin function)
 */
export async function getBookingById(id: string) {
  try {
    return await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        Customer: true,
        Artist: true,
        Payment: true,
      },
    });
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    throw new Error('Failed to get booking');
  }
}

/**
 * Get all bookings with pagination (Admin function)
 */
export async function getBookings(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  try {
    const { page = 1, limit = 20, status, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.calStatus = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tattooType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          Customer: true,
          Artist: true,
          Payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw new Error('Failed to get bookings');
  }
}

/**
 * Update booking status (Admin function)
 */
export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    return await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        calStatus: status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
}

/**
 * Get booking statistics (Admin function)
 */
export async function getBookingStats() {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { calStatus: 'pending' } }),
      prisma.booking.count({ where: { calStatus: 'confirmed' } }),
      prisma.booking.count({ where: { calStatus: 'completed' } }),
      prisma.booking.count({ where: { calStatus: 'cancelled' } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  } catch (error) {
    console.error('Error getting booking stats:', error);
    throw new Error('Failed to get booking stats');
  }
}

/**
 * Get recent bookings (Admin dashboard)
 */
export async function getRecentBookings(limit: number = 5) {
  try {
    return await prisma.booking.findMany({
      include: {
        Customer: true,
        Artist: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting recent bookings:', error);
    throw new Error('Failed to get recent bookings');
  }
}