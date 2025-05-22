import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/clients
 * Get all clients with optional filtering
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filters
    const where: unknown = {};

    if (search) {
      (where as any).OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: Customer model doesn't have status field
    // if (status && status !== 'all') {
    //   (where as any).status = status;
    // }

    // Get clients with count
    const [clients, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: where as any,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          Appointment: {
            select: {
              id: true,
              startDate: true,
              status: true,
            },
            orderBy: {
              startDate: 'desc',
            },
            take: 1,
          },
          tags: true,
        },
      }),
      prisma.customer.count({ where: where as any }),
    ]);

    // Format response
    const formattedClients = clients.map(client => {
      // Combine first and last name to maintain client compatibility
      const name = `${client.firstName} ${client.lastName}`.trim();

      // Extract tattoo style preference from notes if available
      const tattooStyle = client.notes?.includes('tattoo style') ? 
        client.notes.split('tattoo style preference:')[1]?.trim() || '' : '';

      // Determine status based on tags (default to 'new')
      const status = client.tags.length > 0 ? 'active' : 'new';

      // Determine last contact from appointments
      const lastContact = client.Appointment[0]?.startDate || null;

      return {
        id: client.id,
        name,
        email: client.email,
        phone: client.phone || '',
        status,
        tattooStyle,
        notes: client.notes || '',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        lastContact,
      };
    });

    return NextResponse.json({
      clients: formattedClients,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if client with this email already exists
    const existingClient = await prisma.customer.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 },
      );
    }

    // Create new client
    // Split name into firstName and lastName
    let firstName = data.name;
    let lastName = '';

    if (data.name && data.name.includes(' ')) {
      const nameParts = data.name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    const client = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone || '',
        notes: data.notes || (data.tattooStyle ? `Tattoo style preference: ${data.tattooStyle}` : ''),
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
