import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify Cal.com configuration
 */
export async function GET() {
  try {
    // Verify environment variables are set
    const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME;
    const calWebhookSecret = process.env.CAL_WEBHOOK_SECRET;

    if (!calUsername || !calWebhookSecret) {
      return NextResponse.json({
        error: 'Missing Cal.com configuration',
        details: {
          usernameSet: !!calUsername,
          webhookSecretSet: !!calWebhookSecret,
        }
      }, { status: 500 });
    }

    // Return success with configuration info (without exposing secrets)
    return NextResponse.json({
      success: true,
      config: {
        username: calUsername,
        webhookSecretConfigured: true,
      }
    });
  } catch (error) {
    console.error('Error testing Cal.com connection:', error);
    return NextResponse.json({ error: 'Failed to test Cal.com connection' }, { status: 500 });
  }
}