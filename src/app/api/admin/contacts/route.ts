import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email';

/**
 * GET endpoint for retrieving contact form submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Optional query parameters for filtering
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');
    const page = Number(searchParams.get('page') || '1');

    // Validate parameters
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const validatedPage = Math.max(1, page);
    const skip = (validatedPage - 1) * validatedLimit;

    // Get total count for pagination
    const totalCount = await prisma.contact.count();

    // Get contacts from database
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
      skip,
    });

    return NextResponse.json({
      contacts,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
        perPage: validatedLimit,
      },
    });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    return NextResponse.json({ error: 'Failed to retrieve contacts' }, { status: 500 });
  }
}

/**
 * POST endpoint for sending a reply to a contact form submission
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.contactId || !body.replyMessage) {
      return NextResponse.json(
        { error: 'Contact ID and reply message are required' },
        { status: 400 }
      );
    }

    const contactId = parseInt(body.contactId, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    // Find the contact in the database
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Send reply email
    const emailResult = await sendEmail({
      to: { email: contact.email, name: contact.name },
      subject: `Re: ${contact.subject || 'Your Message to Ink 37'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e63946;">Ink 37 Tattoo Studio</h2>
          <p>Hello ${contact.name},</p>
          <p>Thank you for reaching out to us. Here's a response to your message:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e63946; margin: 20px 0;">
            <p style="margin-top: 0;">${body.replyMessage.replace(/\n/g, '<br>')}</p>
          </div>
          <p>For reference, your original message was:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #333; margin: 20px 0; color: #666;">
            <p style="margin-top: 0; font-style: italic;">${contact.message.replace(/\n/g, '<br>')}</p>
          </div>
          <p>If you have any more questions, feel free to reply to this email.</p>
          <p>Best regards,<br>Fernando Govea<br>Ink 37 Tattoo Studio</p>
        </div>
      `,
      text: `
Hello ${contact.name},

Thank you for reaching out to us. Here's a response to your message:

${body.replyMessage}

For reference, your original message was:

"${contact.message}"

If you have any more questions, feel free to reply to this email.

Best regards,
Fernando Govea
Ink 37 Tattoo Studio
      `,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send reply email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}

/**
 * DELETE endpoint for removing a contact submission
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Delete the contact
    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
