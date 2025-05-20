import { NextRequest, NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';
import { sendEmail } from '@/lib/email/email';

/**
 * POST /api/admin/email-templates/preview
 * Send a preview email using a template
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
    if (!data.email || (!data.templateId && !data.templateContent)) {
      return NextResponse.json(
        { error: 'Email address and either templateId or templateContent are required' },
        { status: 400 }
      );
    }

    let templateContent = '';
    let templateName = 'Preview Template';

    // If template ID is provided, get template from database
    if (data.templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: {
          id: data.templateId,
        },
      });

      if (!template) {
        return NextResponse.json({ error: 'Email template not found' }, { status: 404 });
      }

      templateContent = template.content;
      templateName = template.name;
    } else {
      // Use the provided template content
      templateContent = data.templateContent;
    }

    // Replace template variables with sample data
    const sampleData = {
      client: {
        name: data.clientName || 'John Doe',
        email: data.email,
        phone: data.clientPhone || '555-123-4567',
      },
      appointment: {
        date: new Date().toLocaleDateString(),
        time: '10:00 AM',
        service: 'Tattoo Session',
        deposit: '$50',
      },
      studio: {
        name: 'Ink 37',
        address: '123 Tattoo Ave, Ink City, CA 90210',
        phone: '555-INK-0037',
        email: 'contact@ink37tattoos.com',
        website: 'www.ink37tattoos.com',
      },
    };

    // Process template content with variables
    let processedContent = templateContent;
    // Replace client variables
    processedContent = processedContent.replace(/\{\{client\.name\}\}/g, sampleData.client.name);
    processedContent = processedContent.replace(/\{\{client\.email\}\}/g, sampleData.client.email);
    processedContent = processedContent.replace(/\{\{client\.phone\}\}/g, sampleData.client.phone);

    // Replace appointment variables
    processedContent = processedContent.replace(
      /\{\{appointment\.date\}\}/g,
      sampleData.appointment.date
    );
    processedContent = processedContent.replace(
      /\{\{appointment\.time\}\}/g,
      sampleData.appointment.time
    );
    processedContent = processedContent.replace(
      /\{\{appointment\.service\}\}/g,
      sampleData.appointment.service
    );
    processedContent = processedContent.replace(
      /\{\{appointment\.deposit\}\}/g,
      sampleData.appointment.deposit
    );

    // Replace studio variables
    processedContent = processedContent.replace(/\{\{studio\.name\}\}/g, sampleData.studio.name);
    processedContent = processedContent.replace(
      /\{\{studio\.address\}\}/g,
      sampleData.studio.address
    );
    processedContent = processedContent.replace(/\{\{studio\.phone\}\}/g, sampleData.studio.phone);
    processedContent = processedContent.replace(/\{\{studio\.email\}\}/g, sampleData.studio.email);
    processedContent = processedContent.replace(
      /\{\{studio\.website\}\}/g,
      sampleData.studio.website
    );

    // Send email
    const subject = data.subject || `[PREVIEW] ${templateName}`;

    const emailResponse = await sendEmail({
      to: data.email,
      subject,
      html: processedContent,
      text: sanitizeHtml(processedContent, { allowedTags: [], allowedAttributes: {} }), // Strip all HTML tags for text version
    });

    return NextResponse.json({
      message: 'Preview email sent successfully',
      emailId: emailResponse.id,
      to: data.email,
      subject,
    });
  } catch (error) {
    console.error('Error sending preview email:', error);
    return NextResponse.json({ error: 'Failed to send preview email' }, { status: 500 });
  }
}
