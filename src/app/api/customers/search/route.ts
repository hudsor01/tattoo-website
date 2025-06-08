import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';
import { z } from 'zod';

import { logger } from "@/lib/logger";
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(50).default(10),
});

/**
 * GET /api/customers/search
 * Protected endpoint for searching customers (requires admin access)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') ?? '10');

    // Validate query parameters
    const validationResult = searchQuerySchema.safeParse({
      q: query,
      limit,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { q, limit: validatedLimit } = validationResult.data;

    // Search customers with limited fields for privacy
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        // Customer model simplified - no complex relationships
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
    });

    // Format response with combined name
    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: customer.email,
      appointmentCount: 0, // Simplified - no appointment tracking
      createdAt: customer.createdAt,
    }));

    return NextResponse.json({
      customers: formattedCustomers,
      count: formattedCustomers.length,
    });
  } catch (error) {
    void void logger.error('Error searching customers:', error);
    return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 });
  }
}
