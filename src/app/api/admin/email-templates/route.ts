import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils';

/**
 * GET /api/admin/email-templates
 * Get all email templates with optional filtering
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
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filters
    const where: unknown = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    // Get templates with count
    const [templates, totalCount] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    // Format response
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
      campaignCount: template._count.campaigns,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return NextResponse.json({
      templates: formattedTemplates,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
  }
}

/**
 * POST /api/admin/email-templates
 * Create a new email template
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
    if (!data.name || !data.content || !data.type) {
      return NextResponse.json({ error: 'Name, content, and type are required' }, { status: 400 });
    }

    // Create template
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        description: data.description || '',
        type: data.type,
        content: data.content,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/email-templates
 * Batch delete email templates
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
        return NextResponse.json({ error: 'Template IDs are required' }, { status: 400 });
      }
      ids = data.ids;
    }

    // Check if any templates are being used by campaigns
    const usedTemplates = await prisma.emailCampaign.findMany({
      where: {
        templateId: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        templateId: true,
      },
    });

    if (usedTemplates.length > 0) {
      // Get the template names
      const templateIds = usedTemplates.map(campaign => campaign.templateId);
      const templates = await prisma.emailTemplate.findMany({
        where: {
          id: {
            in: templateIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Create a map of template names
      const templateNames = templates.reduce(
        (map, template) => {
          map[template.id] = template.name;
          return map;
        },
        {} as Record<string, string>,
      );

      // Format used templates for error message
      const usageInfo = usedTemplates.map(campaign => ({
        campaignName: campaign.name,
        templateName: templateNames[campaign.templateId] || 'Unknown template',
      }));

      return NextResponse.json(
        {
          error: 'Cannot delete templates that are being used by campaigns',
          usedTemplates: usageInfo,
        },
        { status: 400 },
      );
    }

    // Delete templates
    const deleteCount = await prisma.emailTemplate.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${deleteCount.count} templates deleted successfully`,
      count: deleteCount.count,
    });
  } catch (error) {
    console.error('Error deleting email templates:', error);
    return NextResponse.json({ error: 'Failed to delete email templates' }, { status: 500 });
  }
}
