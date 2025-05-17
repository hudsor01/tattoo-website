import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils';

/**
 * GET /api/admin/email-campaigns/[id]/recipients
 * Get recipients of a specific email campaign
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get recipients with client data
    const recipients = await prisma.emailRecipient.findMany({
      where: {
        campaignId: id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedRecipients = recipients.map(recipient => ({
      id: recipient.id,
      clientId: recipient.clientId,
      clientName: recipient.client.name,
      clientEmail: recipient.client.email,
      clientPhone: recipient.client.phone,
      status: recipient.status,
      sent: recipient.sent,
      sentAt: recipient.sentAt,
      opened: recipient.opened,
      openedAt: recipient.openedAt,
      clicked: recipient.clicked,
      clickedAt: recipient.clickedAt,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }));

    return NextResponse.json({
      recipients: formattedRecipients,
      count: formattedRecipients.length,
    });
  } catch (error) {
    console.error(`Error fetching recipients for campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}

/**
 * POST /api/admin/email-campaigns/[id]/recipients
 * Add recipients to a campaign
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json();

    // Validate required fields
    if (!data.clientIds || !Array.isArray(data.clientIds) || data.clientIds.length === 0) {
      return NextResponse.json({ error: 'Client IDs are required' }, { status: 400 });
    }

    // Check if campaign exists
    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Email campaign not found' }, { status: 404 });
    }

    // Get existing recipients to avoid duplicates
    const existingRecipients = await prisma.emailRecipient.findMany({
      where: {
        campaignId: id,
        clientId: {
          in: data.clientIds,
        },
      },
      select: {
        clientId: true,
      },
    });

    const existingClientIds = existingRecipients.map(r => r.clientId);
    const newClientIds = data.clientIds.filter(
      (clientId: string) => !existingClientIds.includes(clientId)
    );

    if (newClientIds.length === 0) {
      return NextResponse.json({
        message: 'All clients are already added to this campaign',
        added: 0,
        skipped: data.clientIds.length,
      });
    }

    // Add new recipients
    const recipients = await prisma.emailRecipient.createMany({
      data: newClientIds.map((clientId: string) => ({
        campaignId: id,
        clientId,
        status: 'pending',
        opened: false,
        clicked: false,
      })),
    });

    return NextResponse.json({
      message: `${recipients.count} recipients added to campaign`,
      added: recipients.count,
      skipped: data.clientIds.length - recipients.count,
    });
  } catch (error) {
    console.error(`Error adding recipients to campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to add recipients' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/email-campaigns/[id]/recipients
 * Remove recipients from a campaign
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get query parameters or request body depending on how IDs are sent
    const url = request.nextUrl;
    let clientIds: string[] = [];

    // Check if IDs are in query parameters
    const clientIdsParam = url.searchParams.get('clientIds');
    if (clientIdsParam) {
      clientIds = clientIdsParam.split(',');
    } else {
      // Check if IDs are in request body
      const data = await request.json();
      if (!data.clientIds || !Array.isArray(data.clientIds) || data.clientIds.length === 0) {
        return NextResponse.json({ error: 'Client IDs are required' }, { status: 400 });
      }
      clientIds = data.clientIds;
    }

    // Remove recipients
    const deleteResult = await prisma.emailRecipient.deleteMany({
      where: {
        campaignId: id,
        clientId: {
          in: clientIds,
        },
      },
    });

    return NextResponse.json({
      message: `${deleteResult.count} recipients removed from campaign`,
      removed: deleteResult.count,
    });
  } catch (error) {
    console.error(`Error removing recipients from campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to remove recipients' }, { status: 500 });
  }
}
