import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { Prisma, ContactStatus } from '@prisma/client';
import { getAdminEmails } from '@/lib/utils/env';
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rate-limiter';
import { verifyCSRFToken } from '@/lib/security/csrf';

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Add rate limiting check
    const rateLimitResult = await checkRateLimit(request);
    const limitResponse = rateLimitResponse(rateLimitResult);
    if (limitResponse) return limitResponse;

    // Verify CSRF token for API requests
    if (!verifyCSRFToken(request, { allowFormData: false })) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'CSRF verification failed' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = validationResult.data;

    // Create contact submission
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        message,
        status: 'NEW',
      },
    });

    // Send email notifications
    try {
      const { sendEmail, generateAdminContactEmail, generateCustomerContactConfirmation } = await import('@/lib/email/email-service');
      
      // Send admin notification email
      const adminEmail = generateAdminContactEmail({
        name,
        email,
        phone,
        message,
        subject: 'Website Contact Form',
        contactId: contact.id,
      });
      
      const adminEmails = getAdminEmails();
      await sendEmail({
      to: adminEmails[0]!, // Send to primary admin email
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
      });

      // Send customer confirmation email
      const customerEmail = generateCustomerContactConfirmation({
        name,
        email,
        phone,
        message,
        subject: 'Website Contact Form',
      });
      
      await sendEmail({
        to: email,
        subject: customerEmail.subject,
        html: customerEmail.html,
        text: customerEmail.text,
      });
    } catch (emailError) {
      // Log email errors but don't fail the contact form submission
      void logger.error('Failed to send email notifications:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      id: contact.id,
    });

  } catch (error) {
    void logger.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin-only endpoint to get contact submissions
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ContactWhereInput = {};
    if (status && status !== 'all') {
      where.status = status as ContactStatus;
    }

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    void logger.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}