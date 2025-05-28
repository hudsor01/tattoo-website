/**
 * Push Notification Unsubscribe API
 *
 * Handles unsubscription from push notifications.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for unsubscription
const unsubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
  }),
});

// Import subscriptions from subscribe endpoint (in real app, use shared database)
interface StoredPushSubscription {
  subscription: {
    endpoint: string;
    keys?: {
      p256dh: string;
      auth: string;
    };
  };
}

let subscriptions: Array<StoredPushSubscription> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    // Find and remove subscription
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(
      (sub) => sub.subscription.endpoint !== validatedData.subscription.endpoint
    );

    const removed = initialLength > subscriptions.length;

    if (removed) {
      void console.error('Push subscription removed');

      // In production, remove from database:
      // await prisma.pushSubscription.delete({
      //   where: { endpoint: validatedData.subscription.endpoint },
      // });
    }

    return NextResponse.json({
      success: true,
      removed,
      remainingSubscriptions: subscriptions.length,
    });
  } catch (error) {
    void console.error('Error processing unsubscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid unsubscription format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
