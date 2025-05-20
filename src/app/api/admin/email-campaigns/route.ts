import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/email-campaigns
 * Get all email campaigns with optional filtering
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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get campaigns with count
    const [campaigns, totalCount] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
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
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    // Get stats for each campaign
    const campaignWithStats = await Promise.all(
      campaigns.map(async campaign => {
        const stats = await prisma.$queryRaw`
          SELECT 
            SUM(CASE WHEN "opened" = true THEN 1 ELSE 0 END) as "openCount",
            SUM(CASE WHEN "clicked" = true THEN 1 ELSE 0 END) as "clickCount",
            COUNT(*) as "sentCount"
          FROM "EmailRecipient"
          WHERE "campaignId" = ${campaign.id}
        `;

        // The stats will be an array with one object
        const campaignStats = stats[0] || { openCount: 0, clickCount: 0, sentCount: 0 };

        return {
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          description: campaign.description,
          status: campaign.status,
          scheduledFor: campaign.scheduledFor,
          sentAt: campaign.sentAt,
          templateId: campaign.templateId,
          templateName: campaign.template?.name,
          recipientCount: campaign._count.recipients,
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
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        };
      }),
    );

    return NextResponse.json({
      campaigns: campaignWithStats,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch email campaigns' }, { status: 500 });
  }
}

/**
 * POST /api/admin/email-campaigns
 * Create a new email campaign
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
    if (!data.name || !data.subject || !data.templateId) {
      return NextResponse.json(
        { error: 'Name, subject, and template are required' },
        { status: 400 },
      );
    }

    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: {
        id: data.templateId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 400 });
    }

    // Create campaign first
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        description: data.description || '',
        status: data.status || 'draft',
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        templateId: data.templateId,
      },
    });

    // If recipients are provided, add them
    if (data.recipients && Array.isArray(data.recipients) && data.recipients.length > 0) {
      // Create recipients in chunks to avoid too many queries
      const chunkSize = 100;
      for (let i = 0; i < data.recipients.length; i += chunkSize) {
        const chunk = data.recipients.slice(i, i + chunkSize);
        await prisma.emailRecipient.createMany({
          data: chunk.map((recipientId: string) => ({
            campaignId: campaign.id,
            clientId: recipientId,
            status: 'pending',
            opened: false,
            clicked: false,
          })),
        });
      }
    }

    // Get the complete campaign with recipients count
    const completeNewCampaign = await prisma.emailCampaign.findUnique({
      where: {
        id: campaign.id,
      },
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

    return NextResponse.json(
      {
        ...completeNewCampaign,
        templateName: completeNewCampaign?.template?.name,
        recipientCount: completeNewCampaign?._count.recipients,
        template: undefined,
        _count: undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json({ error: 'Failed to create email campaign' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/email-campaigns
 * Batch update email campaigns status
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get request body
    const data = await request.json();

    if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
      return NextResponse.json({ error: 'Campaign IDs are required' }, { status: 400 });
    }

    if (!data.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update campaigns
    const updateData: unknown = {
      status: data.status,
      updatedAt: new Date(),
    };

    // If status is 'sent', update sentAt
    if (data.status === 'sent') {
      updateData.sentAt = new Date();
    }

    const updateCount = await prisma.emailCampaign.updateMany({
      where: {
        id: {
          in: data.ids,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `${updateCount.count} campaigns updated successfully`,
      count: updateCount.count,
    });
  } catch (error) {
    console.error('Error updating email campaigns:', error);
    return NextResponse.json({ error: 'Failed to update email campaigns' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/email-campaigns
 * Batch delete email campaigns
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters or request body depending on how IDs are sent
    const url = request.nextUrl;
    let ids: string[] = [];

    // Check if IDs are in query parameters
    const idParam = url.searchParams.get('ids');
    if (idParam) {
      ids = idParam.split(',');
    } else {
      // Check if IDs are in request body
      const data = await request.json();
      if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
        return NextResponse.json({ error: 'Campaign IDs are required' }, { status: 400 });
      }
      ids = data.ids;
    }

    // First delete all recipients associated with these campaigns
    await prisma.emailRecipient.deleteMany({
      where: {
        campaignId: {
          in: ids,
        },
      },
    });

    // Then delete the campaigns
    const deleteCount = await prisma.emailCampaign.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${deleteCount.count} campaigns deleted successfully`,
      count: deleteCount.count,
    });
  } catch (error) {
    console.error('Error deleting email campaigns:', error);
    return NextResponse.json({ error: 'Failed to delete email campaigns' }, { status: 500 });
  }
}
