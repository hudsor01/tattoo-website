'use server';

import { revalidateTag } from 'next/cache';
import { contactFormSchema } from '@/lib/validation-schemas';
import { prisma } from '@/lib/db/prisma';
import { ContactStatus } from '@prisma/client';
import { sendEmail, generateAdminContactEmail, generateCustomerContactConfirmation } from '@/lib/email/email-service';
import { sanitizeForPrisma } from '@/lib/utils/prisma-helper';
import { getEnvVar, createSafeUrl } from '@/lib/utils/env';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import type { ContactFormState } from '@/lib/prisma-types';

import { logger } from "@/lib/logger";
/**
 * Server Action for contact form submission
 * Uses React 19 Server Actions for better SEO and progressive enhancement
 */
export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    // Extract form data
    const rawFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      referralSource: formData.get('referralSource') as string,
      preferredTime: formData.get('preferredTime') as string,
      budget: formData.get('budget') as string,
      hasReference: formData.get('hasReference') === 'true',
      agreeToTerms: formData.get('agreeToTerms') === 'true',
    };

    // Validate form data with Zod
    const validationResult = contactFormSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      return {
        status: 'error',
        success: false,
        message: 'Please check your form data and try again.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Implement server-side rate limiting
    // Create a fake NextRequest to use with checkRateLimit
    const headersList = await headers();
    // Extract header values safely
    const userAgent = headersList.get('user-agent') ?? '';
    const xForwardedFor = headersList.get('x-forwarded-for') ?? '';
    const host = headersList.get('host') ?? '';
    
    // Create a proper request object with the required properties for rate limiting
    const request: NextRequest = {
      headers: new Headers({
        'user-agent': userAgent,
        'x-forwarded-for': xForwardedFor,
        'host': host
      }),
      nextUrl: createSafeUrl('/api/contact') ?? new URL('/api/contact', 'https://ink37tattoos.com'),
    } as NextRequest;
    
    // Use the rate limiter with our properly constructed request object
    // Since checkRateLimit is now async, we need to await it
    const rateLimitResult = await checkRateLimit(request);

    // If rate limit exceeded, return error response with additional rate limit information
    if (!rateLimitResult.allowed) {
      const timeRemaining = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      
      return {
        status: 'error',
        success: false,
        message: `Rate limit exceeded. You can try again in ${timeRemaining} seconds.`,
        rateLimitInfo: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.resetTime,
          retryAfter: timeRemaining,
          timeRemaining: timeRemaining
        }
      };
    }

    // Create submission record in database
    const contactSubmission = await prisma.contact.create({
      data: sanitizeForPrisma({
        name: validatedData.name ?? '',
        email: validatedData.email ?? '',
        phone: validatedData.phone ?? null,
        message: validatedData.message ?? '',
        status: ContactStatus.NEW,
      }),
    });

    // Send notification email to admin
    try {
      // Use the contact form data with the contact ID for admin email
      const adminEmailData = {
        name: validatedData.name ?? '',
        email: validatedData.email ?? '',
        subject: validatedData.subject ?? '',
        message: validatedData.message ?? '',
        contactId: contactSubmission.id,
        phone: validatedData.phone,
        service: validatedData.service,
        referralSource: validatedData.referralSource,
        preferredTime: validatedData.preferredTime,
        budget: validatedData.budget,
        hasReference: validatedData.hasReference,
        agreeToTerms: validatedData.agreeToTerms,
        preferredContactMethod: validatedData.preferredContactMethod ?? 'email'
      };
      
      const adminEmail = generateAdminContactEmail(adminEmailData);
      
      // Get contact email from environment
      const contactEmail = getEnvVar('CONTACT_EMAIL', getEnvVar('NEXT_PUBLIC_CONTACT_EMAIL', 'contact@ink37tattoos.com'));
      
      await sendEmail({
        to: contactEmail,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      });

      // Send confirmation email to user
      const customerEmailData = {
        name: validatedData.name ?? '',
        email: validatedData.email ?? '',
        subject: validatedData.subject ?? '',
        message: validatedData.message ?? ''
      };
      const customerEmail = generateCustomerContactConfirmation(customerEmailData);
      await sendEmail({
        to: validatedData.email ?? '',
        subject: customerEmail.subject,
        html: customerEmail.html,
        text: customerEmail.text,
      });
    } catch (emailError) {
      void logger.error('Failed to send emails:', emailError);
      // Continue execution - don't fail the entire submission if email fails
    }

    // Revalidate any cached data that might display contact submissions
    revalidateTag('contact-submissions');
    revalidateTag('admin-dashboard');

    return {
      status: 'success',
      success: true,
      message:
        'Your message has been sent successfully! I will get back to you within 24-48 hours.',
    };
  } catch (error) {
    void logger.error('Contact form submission error:', error);

    return {
      status: 'error',
      success: false,
      message:
        'Sorry, there was an error sending your message. Please try again or contact me directly.',
    };
  }
}

/**
 * Server Action for file upload handling (for reference images)
 * This would be used separately for file uploads in the contact form
 */
export async function uploadContactFilesAction(): Promise<{
  success: boolean;
  fileUrls?: string[];
  error?: string;
}> {
  // File upload logic would go here
  // This is a placeholder for when file uploads are needed
  return {
    success: true,
    fileUrls: [],
  };
}
