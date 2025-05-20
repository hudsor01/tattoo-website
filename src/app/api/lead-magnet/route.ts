import { NextResponse } from 'next/server';
import { apiRoute, leadMagnetSchema } from '@/lib/validations/validation-api-utils';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/email';

/**
 * Handle lead magnet requests
 */
export const POST = apiRoute({
  POST: {
    bodySchema: leadMagnetSchema,
    handler: async (body) => {
      try {
        const { name, email, phone, magnet, sourceInfo } = body;

        // Store lead in database
        const lead = await prisma.lead.create({
          data: {
            name,
            email,
            phone,
            type: 'lead_magnet',
            source: sourceInfo?.source || 'website',
            campaign: sourceInfo?.campaign,
            medium: sourceInfo?.medium,
            term: sourceInfo?.term,
            content: sourceInfo?.content,
            referrer: sourceInfo?.referrer,
            ip: sourceInfo?.ip,
            userAgent: sourceInfo?.userAgent,
            status: 'new',
            metadata: {
              magnet,
            },
          },
        });

        // Find the lead magnet details
        const leadMagnetDetails = await prisma.leadMagnet.findUnique({
          where: { id: magnet },
        });

        if (!leadMagnetDetails) {
          return NextResponse.json(
            {
              success: false,
              message: 'The requested resource was not found.',
            },
            { status: 404 }
          );
        }

        // Send lead magnet email
        await sendEmail({
          to: email,
          subject: `Your ${leadMagnetDetails.title} download`,
          templateName: 'lead-magnet',
          templateData: {
            name,
            title: leadMagnetDetails.title,
            description: leadMagnetDetails.description,
            downloadUrl: leadMagnetDetails.fileUrl,
          },
        });

        // Send notification to admin
        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: `New Lead Magnet Request: ${leadMagnetDetails.title}`,
          templateName: 'lead-notification',
          templateData: {
            name,
            email,
            phone,
            magnet: leadMagnetDetails.title,
            leadId: lead.id,
            source: sourceInfo?.source || 'website',
          },
        });

        return NextResponse.json({
          success: true,
          id: lead.id,
          downloadUrl: leadMagnetDetails.fileUrl,
          message: 'Thank you! We have sent the download link to your email.',
        });
      } catch (error) {
        console.error('Error processing lead magnet request:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to process your request. Please try again later.',
          },
          { status: 500 }
        );
      }
    },
  },
});
