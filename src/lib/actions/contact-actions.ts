'use server';

import { revalidateTag } from 'next/cache';
import { contactFormSchema } from '@/lib/validation-schemas';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/email';
import { sanitizeForPrisma } from '@/lib/utils/prisma-helper';
import type { ContactFormState } from '@/types/component-types';

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
        message: 'Please check your form data and try again.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Basic server-side rate limiting would go here
    // Note: In a real app, you'd use a more sophisticated rate limiting solution

    // Create submission record in database
    const contactSubmission = await prisma.contact.create({
      data: sanitizeForPrisma({
        name: validatedData.name ?? '',
        email: validatedData.email ?? '',
        phone: validatedData.phone ?? '',
        message: validatedData.message ?? '',
        subject: validatedData.subject ?? 'Website Contact Form',
        service: validatedData.service ?? '',
        referralSource: validatedData.referralSource ?? '',
        preferredTime: validatedData.preferredTime ?? '',
        budget: validatedData.budget ?? '',
        hasReference: validatedData.hasReference ?? false,
        referenceImages: [], // File uploads would need separate handling in Server Actions
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });

    // Send notification email to admin
    try {
      await sendEmail({
        to: (process.env['ARTIST_EMAIL'] ?? 'fennyg83@gmail.com') as string,
        subject: `New Contact Form Submission: ${validatedData.subject ?? 'Website Inquiry'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Phone:</strong> ${validatedData.phone ?? 'Not provided'}</p>
          <p><strong>Subject:</strong> ${validatedData.subject ?? 'Website Contact Form'}</p>
          <p><strong>Service:</strong> ${validatedData.service ?? 'Not specified'}</p>
          <p><strong>Message:</strong> ${validatedData.message}</p>
          <p><strong>Submission ID:</strong> ${contactSubmission.id}</p>
        `,
        text: `New Contact Form Submission\n\nName: ${validatedData.name}\nEmail: ${validatedData.email}\nPhone: ${validatedData.phone ?? 'Not provided'}\nSubject: ${validatedData.subject ?? 'Website Contact Form'}\nService: ${validatedData.service ?? 'Not specified'}\nMessage: ${validatedData.message}\nSubmission ID: ${contactSubmission.id}`,
      });

      // Send confirmation email to user
      await sendEmail({
        to: validatedData.email ?? '',
        subject: 'Thank you for contacting Ink 37 Tattoos',
        html: `
          <h2>Thank you for contacting Ink 37 Tattoos</h2>
          <p>Hi ${validatedData.name},</p>
          <p>Thank you for reaching out about your tattoo. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
          <p><strong>Your message:</strong></p>
          <p>${validatedData.message}</p>
          <p>Best regards,<br>Fernando<br>Ink 37 Tattoos</p>
        `,
        text: `Thank you for contacting Ink 37 Tattoos\n\nHi ${validatedData.name},\n\nThank you for reaching out about your tattoo. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.\n\nYour message: ${validatedData.message}\n\nBest regards,\nFernando\nInk 37 Tattoos`,
      });
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      // Continue execution - don't fail the entire submission if email fails
    }

    // Revalidate any cached data that might display contact submissions
    revalidateTag('contact-submissions');
    revalidateTag('admin-dashboard');

    return {
      status: 'success',
      message:
        'Your message has been sent successfully! I will get back to you within 24-48 hours.',
      submissionId: contactSubmission.id.toString(),
    };
  } catch (error) {
    console.error('Contact form submission error:', error);

    return {
      status: 'error',
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
