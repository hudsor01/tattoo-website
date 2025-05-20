import { NextResponse } from 'next/server';
import { apiRoute } from '@/lib/validations/validation-api-utils';
import { contactFormSchema } from '@/lib/validations/validation-contact';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/email';

export const dynamic = 'force-dynamic';

/**
 * Handle contact form submissions
 */
export const POST = apiRoute({
  POST: {
    bodySchema: contactFormSchema,
    handler: async (body) => {
      try {
        const {
          name,
          email,
          phone,
          message,
          subject,
          service,
          referralSource,
          preferredTime,
          budget,
          hasReference,
          referenceImages,
        } = body;

        // Store contact submission in database
        const contactSubmission = await prisma.contactSubmission.create({
          data: {
            name,
            email,
            phone,
            message,
            subject: subject || 'Website Contact Form',
            service,
            referralSource,
            preferredTime,
            budget,
            hasReference,
            referenceImages: referenceImages || [],
            status: 'new',
          },
        });

        // Send notification email to admin
        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: `New Contact Form Submission: ${subject || 'Website Inquiry'}`,
          templateName: 'contact-form',
          templateData: {
            name,
            email,
            phone,
            message,
            subject: subject || 'Website Contact Form',
            service,
            referralSource,
            submissionId: contactSubmission.id,
          },
        });

        // Send confirmation email to user
        await sendEmail({
          to: email,
          subject: 'Thank you for contacting us',
          templateName: 'contact-confirmation',
          templateData: {
            name,
            message,
          },
        });

        return NextResponse.json({
          success: true,
          id: contactSubmission.id,
          message: 'Your message has been sent successfully. We will get back to you soon.',
        });
      } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to submit contact form. Please try again later.',
          },
          { status: 500 }
        );
      }
    },
  },
});
