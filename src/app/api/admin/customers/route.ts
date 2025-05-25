import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';
import type { Prisma } from '@prisma/client';

/**
 * GET /api/admin/customers
 * Get all customers with optional filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get customers with count
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
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
          address: true,
          city: true,
          state: true,
          postalCode: true,
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
      prisma.customer.count({ where }),
    ]);

    // Format response to maintain compatibility
    const formattedCustomers = customers.map(customer => {
      // Combine first and last name to maintain client compatibility
      const name = `${customer.firstName} ${customer.lastName}`.trim();

      // Extract tattoo style preference from notes if available
      const tattooStyle = customer.notes?.includes('tattoo style') ? 
        customer.notes.split('tattoo style preference:')[1]?.trim() || '' : '';

      // Determine status based on tags (default to 'new')
      const status = customer.tags.length > 0 ? 'active' : 'new';

      // Determine last contact from appointments
      const lastContact = customer.Appointment[0]?.startDate || null;

      return {
        id: customer.id,
        name,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postalCode: customer.postalCode || '',
        status,
        tattooStyle,
        notes: customer.notes || '',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        lastContact,
      };
    });

    return NextResponse.json({
      clients: formattedCustomers,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

/**
 * POST /api/admin/customers
 * Create a new customer
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
    console.log('Creating customer with data:', data);

    // Support both name-based and firstName/lastName-based input
    let firstName: string;
    let lastName: string;

    if (data.firstName && data.lastName) {
      // New format: separate firstName and lastName
      firstName = data.firstName.trim();
      lastName = data.lastName.trim();
    } else if (data.name) {
      // Legacy format: combined name
      if (data.name.includes(' ')) {
        const nameParts = data.name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = data.name.trim();
        lastName = '';
      }
    } else {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Validate required fields
    if (!firstName || !data.email) {
      return NextResponse.json({ error: 'First name and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if customer with this email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: data.email.toLowerCase().trim(),
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 },
      );
    }

    // Create new customer with all supported fields
    const customerData: Prisma.CustomerCreateInput = {
      firstName,
      lastName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      postalCode: data.postalCode?.trim() || null,
      notes: data.notes?.trim() || null,
    };

    const customer = await prisma.customer.create({
      data: customerData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Customer created successfully:', customer);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
