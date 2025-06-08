import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/customers/[id]
 * Get a specific customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    void logger.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/customers/[id]
 * Update a specific customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, state, postalCode } = body;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    void logger.error('Error updating customer:', error);
    
    // Handle unique constraint errors
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a specific customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    void logger.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}