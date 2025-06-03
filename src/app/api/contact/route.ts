import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { contactFormSchema } from '@/lib/validation-schemas';
import { prisma } from '@/lib/db/prisma';
import { sendEmail, generateSimpleAdminContactEmail, generateSimpleCustomerConfirmation } from '@/lib/email/email-service';
import { z } from 'zod';
import { sanitizeForPrisma } from '@/lib/utils/prisma-helper';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { getEnvSafe } from '@/lib/utils/env';

import { logger } from "@/lib/logger";
export const dynamic = 'force-dynamic';
// Increase the size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

/**
 * Parse a multipart form data request
 */
async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const formFields: Record<string, string | boolean> = {};
  const files: Record<string, File> = {};

  // Extract all form fields
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Store file objects separately
      files[key] = value;
    } else {
      // Convert string "true"/"false" to boolean
      if (value === 'true') formFields[key] = true;
      else if (value === 'false') formFields[key] = false;
      else formFields[key] = value;
    }
  }

  return { formFields, files };
}

/**
 * Save uploaded files to disk
 */
async function saveFiles(files: Record<string, File>, submissionId: string) {
  const fileUrls: string[] = [];
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contact', submissionId);

  try {
    // Create directory if it doesn't exist
    await fs.mkdir(uploadsDir, { recursive: true });

    // Process each file
    for (const [key, file] of Object.entries(files)) {
      if (!key.startsWith('file_')) continue;

      // Generate a unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Convert File to Buffer and save
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      // Store the relative URL for access
      const fileUrl = `/uploads/contact/${submissionId}/${uniqueFilename}`;
      void fileUrls.push(fileUrl);
    }

    return fileUrls;
  } catch (error) {
    void void logger.error('Error saving files:', error);
    throw new Error('Failed to save uploaded files');
  }
}

/**
 * Handle contact form submissions with file uploads
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting: 5 requests per minute for contact form
  const rateLimitResult = rateLimit(request, 5, 60000);
  const rateLimitErrorResponse = rateLimitResponse(rateLimitResult);
  if (rateLimitErrorResponse) {
    return rateLimitErrorResponse;
  }

  try {
    // Parse multipart form data
    const { formFields, files } = await parseFormData(request);

    // Validate form fields
    const validatedData = contactFormSchema.parse({
      ...formFields,
      // Convert string to boolean
      hasReference: formFields['hasReference'] === 'true',
      agreeToTerms: formFields['agreeToTerms'] === 'true',
    });

    // Create submission record first to get an ID
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
        hasReference: validatedData.hasReference,
        referenceImages: [], // Will update after saving files
        status: 'new',
        updatedAt: new Date(),
      }),
    });

    // Process files if they exist
    let fileUrls: string[] = [];
    if (formFields['hasFiles'] === 'true' && Object.keys(files).length > 0) {
      fileUrls = await saveFiles(files, contactSubmission.id.toString());

      // Update submission with file URLs
      await prisma.contact.update({
        where: { id: contactSubmission.id },
        data: sanitizeForPrisma({
          referenceImages: fileUrls,
          updatedAt: new Date(),
        }),
      });
    }

    // Send notification email to admin using template function
    const adminEmailData = generateSimpleAdminContactEmail({
      name: validatedData.name ?? '',
      email: validatedData.email ?? '',
      phone: validatedData.phone ?? undefined,
      subject: validatedData.subject ?? 'Website Contact Form',
      service: validatedData.service ?? undefined,
      message: validatedData.message ?? '',
      submissionId: contactSubmission.id,
      attachments: fileUrls.length > 0 ? fileUrls.length : undefined
    });

    await sendEmail({
      to: getEnvSafe('ADMIN_EMAIL', 'fennyg83@gmail.com'),
      subject: adminEmailData.subject,
      html: adminEmailData.html,
      text: adminEmailData.text
    });

    // Send confirmation email to user using template function
    const customerEmailData = generateSimpleCustomerConfirmation({
      name: validatedData.name ?? '',
      email: validatedData.email ?? '',
      message: validatedData.message ?? ''
    });

    await sendEmail({
      to: validatedData.email ?? '',
      subject: customerEmailData.subject,
      html: customerEmailData.html,
      text: customerEmailData.text
    });

    return NextResponse.json({
      success: true,
      id: contactSubmission.id,
      message: 'Your message has been sent successfully. I will get back to you soon.',
      filesUploaded: fileUrls.length,
    });
  } catch (error) {
    void void logger.error('Error processing contact form:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data. Please check your inputs and try again.',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
      },
      { status: 500 }
    );
  }
}
