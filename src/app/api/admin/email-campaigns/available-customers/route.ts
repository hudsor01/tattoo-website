import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils';
import { Prisma } from '@/prisma/client';

/**
 * GET /api/admin/email-campaigns/available-clients
 * Get all clients that can be added to email campaigns with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const campaignId = searchParams.get('campaignId');
    const onlyWithEmail = searchParams.get('onlyWithEmail') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Use 'any' type if 'ClientWhereInput' does not exist in Prisma
    const where: unknown = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Only include clients with email addresses if specified
    if (onlyWithEmail) {
      where.email = { not: null };
      where.emailOptOut = false; // Only include clients who haven't opted out
    }

    // Get clients with count
    const [customer, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailOptOut: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // If campaign ID provided, get already added client IDs
    let addedClientIds: string[] = [];
    if (campaignId) {
      const recipients = await prisma.emailRecipients.findMany({
        where: {
          campaignId,
        },
        select: {
          clientId: true,
        },
      });

      addedClientIds = recipients.map(r => r.clientId);
    }

    // Format response
    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      emailOptOut: client.emailOptOut,
      alreadyAdded: addedClientIds.includes(client.id),
    }));

    return NextResponse.json({
      clients: formattedClients,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching available clients:', error);
    return NextResponse.json({ error: 'Failed to fetch available clients' }, { status: 500 });
  }
}
