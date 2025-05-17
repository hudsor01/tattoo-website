import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils';

/**
 * GET /api/admin/email-templates/[id]
 * Get a specific email template by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get template with campaign count
    const template = await prisma.emailTemplate.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 });
    }

    // Format response
    const formattedTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
      campaignCount: template._count.campaigns,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error(`Error fetching email template ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch email template' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/email-templates/[id]
 * Update a specific email template
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

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: {
        id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 });
    }

    // Update template
    const updatedTemplate = await prisma.emailTemplate.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.content,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    // Format response
    const formattedTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      type: updatedTemplate.type,
      content: updatedTemplate.content,
      campaignCount: updatedTemplate._count.campaigns,
      createdAt: updatedTemplate.createdAt,
      updatedAt: updatedTemplate.updatedAt,
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error(`Error updating email template ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/email-templates/[id]
 * Delete a specific email template
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 });
    }

    // Check if template is being used by campaigns
    if (template._count.campaigns > 0) {
      // Get campaigns using this template
      const campaigns = await prisma.emailCampaign.findMany({
        where: {
          templateId: id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return NextResponse.json(
        {
          error: 'Cannot delete template that is being used by campaigns',
          campaigns: campaigns.map(c => ({ id: c.id, name: c.name })),
        },
        { status: 400 }
      );
    }

    // Delete template
    await prisma.emailTemplate.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting email template ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 });
  }
}
