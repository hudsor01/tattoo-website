import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

// Lead magnet type mapping
const leadMagnetTitles: Record<string, string> = {
  'tattoo-guide': "First-Timer's Tattoo Guide",
  'aftercare-checklist': 'Tattoo Aftercare Checklist',
  'design-ideas': '101 Tattoo Design Ideas',
};

/**
 * GET endpoint for retrieving all leads (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const supabaseClient = await supabase;
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.['role'] === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Optional query parameters for filtering
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');
    const page = Number(searchParams.get('page') || '1');
    const leadType = searchParams.get('type'); // Filter by lead magnet type

    // Validate parameters
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const validatedPage = Math.max(1, page);
    const skip = (validatedPage - 1) * validatedLimit;

    // Build filter based on query parameters
    const filter: Prisma.LeadWhereInput = {};

    if (leadType) {
      filter.leadMagnetType = leadType;
    }

    // Get total count for pagination
    const totalCount = await prisma.lead.count({
      where: filter,
    });

    // Get leads from database
    const leads = await prisma.lead.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
      skip,
    });

    // Transform the leads to include magnet title
    const formattedLeads = leads.map(lead => ({
      ...lead,
      leadMagnetTitle: leadMagnetTitles[lead.leadMagnetType] || lead.leadMagnetType,
    }));

    // Get counts by type for summary
    const leadCounts = await prisma.lead.groupBy({
      by: ['leadMagnetType'],
      _count: {
        id: true,
      },
    });

    const typeCounts = leadCounts.map(count => ({
      type: count.leadMagnetType,
      title: leadMagnetTitles[count.leadMagnetType] || count.leadMagnetType,
      count: count._count.id,
    }));

    return NextResponse.json({
      leads: formattedLeads,
      summary: {
        total: totalCount,
        byType: typeCounts,
      },
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
        perPage: validatedLimit,
      },
    });
  } catch (error) {
    console.error('Error retrieving leads:', error);
    return NextResponse.json({ error: 'Failed to retrieve leads' }, { status: 500 });
  }
}

/**
 * DELETE endpoint for removing a lead
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const supabaseClient = await supabase;
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.['role'] === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Delete the lead
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
