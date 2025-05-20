import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/clients/[id]
 * Get a specific client
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get client
    const client = await prisma.customer.findUnique({
      where: {
        id: params.id,
      },
      include: {
        appointments: {
          orderBy: {
            startTime: 'desc',
          },
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            depositPaid: true,
            depositAmount: true,
            price: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            description: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id]
 * Update a client
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get request body
    const data = await request.json();

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: {
          email: data.email,
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update client
    const client = await prisma.client.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        tattooStyle: data.tattooStyle,
        notes: data.notes,
        lastContact: data.lastContact || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/clients/[id]
 * Delete a client
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: {
        id: params.id,
      },
      include: {
        appointments: {
          select: { id: true },
        },
        payments: {
          select: { id: true },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client has appointments or payments
    if (existingClient.appointments.length > 0 || existingClient.payments.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete client with existing appointments or payments. Consider changing their status instead.',
        },
        { status: 400 }
      );
    }

    // Delete client
    await prisma.client.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
