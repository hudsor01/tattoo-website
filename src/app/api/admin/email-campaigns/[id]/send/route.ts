import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/admin/email-campaigns/[id]/send
 * Send an email campaign immediately or schedule it
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json();

    // Check if sending now or scheduling
    const sendNow = data.sendNow === true;
    let scheduledTime = null;

    if (!sendNow) {
      if (!data.scheduledTime) {
        return NextResponse.json(
          { error: 'Scheduled time is required when not sending immediately' },
          { status: 400 }
        );
      }
      scheduledTime = new Date(data.scheduledTime);

      // Ensure scheduled time is in the future
      if (scheduledTime <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
    }

    // Get campaign with template and recipients
    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id,
      },
      include: {
        template: true,
        recipients: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Email campaign not found' }, { status: 404 });
    }

    // Check if campaign already sent
    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign has already been sent' }, { status: 400 });
    }

    // Check if campaign has recipients
    if (campaign.recipients.length === 0) {
      return NextResponse.json({ error: 'Campaign has no recipients' }, { status: 400 });
    }

    if (sendNow) {
      // Send campaign immediately

      // Update campaign status
      await prisma.emailCampaign.update({
        where: {
          id,
        },
        data: {
          status: 'sending',
          sentAt: new Date(),
        },
      });

      // Process each recipient
      const emailPromises = campaign.recipients.map(async recipient => {
        if (!recipient.client.email) {
          return {
            clientId: recipient.clientId,
            success: false,
            error: 'Client has no email address',
          };
        }

        try {
          // Process template content with variables for this client
          let processedContent = campaign.template.content;

          // Replace client variables
          processedContent = processedContent.replace(
            /\{\{client\.name\}\}/g,
            recipient.client.name || ''
          );
          processedContent = processedContent.replace(
            /\{\{client\.email\}\}/g,
            recipient.client.email || ''
          );
          processedContent = processedContent.replace(
            /\{\{client\.phone\}\}/g,
            recipient.client.phone || ''
          );

          // Replace studio variables (hardcoded for now, could be fetched from settings)
          const studioInfo = {
            name: 'Ink 37',
            address: '123 Tattoo Ave, Ink City, CA 90210',
            phone: '555-INK-0037',
            email: 'contact@ink37tattoos.com',
            website: 'www.ink37tattoos.com',
          };

          processedContent = processedContent.replace(/\{\{studio\.name\}\}/g, studioInfo.name);
          processedContent = processedContent.replace(
            /\{\{studio\.address\}\}/g,
            studioInfo.address
          );
          processedContent = processedContent.replace(/\{\{studio\.phone\}\}/g, studioInfo.phone);
          processedContent = processedContent.replace(/\{\{studio\.email\}\}/g, studioInfo.email);
          processedContent = processedContent.replace(
            /\{\{studio\.website\}\}/g,
            studioInfo.website
          );

          // Add tracking pixels and click tracking (simplified)
          const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/email/track?rid=${recipient.id}" width="1" height="1" />`;
          processedContent += trackingPixel;

          // Send email
          const emailResponse = await sendEmail({
            to: recipient.client.email,
            subject: campaign.subject,
            html: processedContent,
            text: processedContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          });

          // Update recipient status
          await prisma.emailRecipient.update({
            where: {
              id: recipient.id,
            },
            data: {
              status: 'sent',
              sent: true,
              sentAt: new Date(),
            },
          });

          return {
            clientId: recipient.clientId,
            success: true,
            emailId: emailResponse.id,
          };
        } catch (error) {
          console.error(`Error sending email to ${recipient.client.email}:`, error);

          // Update recipient status
          await prisma.emailRecipient.update({
            where: {
              id: recipient.id,
            },
            data: {
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          return {
            clientId: recipient.clientId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      // Wait for all emails to be processed
      const results = await Promise.all(emailPromises);

      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Update campaign status
      await prisma.emailCampaign.update({
        where: {
          id,
        },
        data: {
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Campaign sent',
        total: campaign.recipients.length,
        successful: successCount,
        failed: failureCount,
        details: results,
      });
    } else {
      // Schedule campaign for later

      // Update campaign status and schedule time
      await prisma.emailCampaign.update({
        where: {
          id,
        },
        data: {
          status: 'scheduled',
          scheduledFor: scheduledTime,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Campaign scheduled',
        scheduledFor: scheduledTime,
      });
    }
  } catch (error) {
    console.error(`Error sending email campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to send email campaign' }, { status: 500 });
  }
}
