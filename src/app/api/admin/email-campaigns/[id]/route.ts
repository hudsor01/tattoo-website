import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/email-campaigns/[id]
 * Get a specific email campaign by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get campaign with recipients and template
    const campaign = await prisma.emailCampaigns.findUnique({
      where: {
        id,
      },
      include: {
        template: true,
        recipients: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Email campaign not found' }, { status: 404 });
    }

    // Get statistics for the campaign
    const stats = await prisma.$queryRaw`
      SELECT
        SUM(CASE WHEN "opened" = true THEN 1 ELSE 0 END) as "openCount",
        SUM(CASE WHEN "clicked" = true THEN 1 ELSE 0 END) as "clickCount",
        COUNT(*) as "sentCount"
      FROM "EmailRecipient"
      WHERE "campaignId" = ${id}
    `;

    const campaignStats = stats[0] || { openCount: 0, clickCount: 0, sentCount: 0 };

    // Format recipients
    const formattedRecipients = campaign.recipients.map(recipient => ({
      id: recipient.id,
      clientId: recipient.clientId,
      clientName: recipient.client.name,
      clientEmail: recipient.client.email,
      status: recipient.status,
      sent: recipient.sent,
      sentAt: recipient.sentAt,
      opened: recipient.opened,
      openedAt: recipient.openedAt,
      clicked: recipient.clicked,
      clickedAt: recipient.clickedAt,
    }));

    // Format response
    const formattedCampaign = {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      description: campaign.description,
      status: campaign.status,
      scheduledFor: campaign.scheduledFor,
      sentAt: campaign.sentAt,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      template: {
        id: campaign.template.id,
        name: campaign.template.name,
        content: campaign.template.content,
        type: campaign.template.type,
      },
      recipients: formattedRecipients,
      recipientCount: campaign._count.recipients,
      stats: {
        sentCount: Number(campaignStats.sentCount) || 0,
        openCount: Number(campaignStats.openCount) || 0,
        clickCount: Number(campaignStats.clickCount) || 0,
        openRate:
          campaignStats.sentCount > 0
            ? (Number(campaignStats.openCount) / Number(campaignStats.sentCount)) * 100
            : 0,
        clickRate:
          campaignStats.sentCount > 0
            ? (Number(campaignStats.clickCount) / Number(campaignStats.sentCount)) * 100
            : 0,
      },
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error(`Error fetching email campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch email campaign' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/email-campaigns/[id]
 * Update a specific email campaign
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json();

    // Check if campaign exists
    const existingCampaign = await prisma.emailCampaign.findUnique({
      where: {
        id,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Email campaign not found' }, { status: 404 });
    }

    // If changing template, verify new template exists
    if (data.templateId && data.templateId !== existingCampaign.templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: {
          id: data.templateId,
        },
      });

      if (!template) {
        return NextResponse.json({ error: 'Email template not found' }, { status: 400 });
      }
    }

    // Update campaign
    const updateData: unknown = {
      name: data.name,
      subject: data.subject,
      description: data.description,
      status: data.status,
      templateId: data.templateId,
      updatedAt: new Date(),
    };

    if (data.scheduledFor !== undefined) {
      updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
    }

    // If status is being changed to 'sent', update sentAt
    if (data.status === 'sent' && existingCampaign.status !== 'sent') {
      updateData.sentAt = new Date();
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    // If recipients are provided, update them
    if (data.recipients && Array.isArray(data.recipients)) {
      // First delete existing recipients
      await prisma.emailRecipient.deleteMany({
        where: {
          campaignId: id,
        },
      });

      // Then add new recipients
      if (data.recipients.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < data.recipients.length; i += chunkSize) {
          const chunk = data.recipients.slice(i, i + chunkSize);
          await prisma.emailRecipient.createMany({
            data: chunk.map((recipientId: string) => ({
              campaignId: id,
              clientId: recipientId,
              status: 'pending',
              opened: false,
              clicked: false,
            })),
          });
        }
      }
    }

    // Get updated count of recipients
    const updatedCount = await prisma.emailRecipient.count({
      where: {
        campaignId: id,
      },
    });

    // Format response
    const formattedCampaign = {
      id: updatedCampaign.id,
      name: updatedCampaign.name,
      subject: updatedCampaign.subject,
      description: updatedCampaign.description,
      status: updatedCampaign.status,
      scheduledFor: updatedCampaign.scheduledFor,
      sentAt: updatedCampaign.sentAt,
      templateId: updatedCampaign.templateId,
      templateName: updatedCampaign.template?.name,
      recipientCount: updatedCount,
      createdAt: updatedCampaign.createdAt,
      updatedAt: updatedCampaign.updatedAt,
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error(`Error updating email campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update email campaign' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/email-campaigns/[id]
 * Delete a specific email campaign
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Check if campaign exists
    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Email campaign not found' }, { status: 404 });
    }

    // First delete all recipients
    await prisma.emailRecipient.deleteMany({
      where: {
        campaignId: id,
      },
    });

    // Then delete the campaign
    await prisma.emailCampaign.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Email campaign deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting email campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete email campaign' }, { status: 500 });
  }
}
