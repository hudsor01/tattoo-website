/**
 * Push Notification Subscription API
 *
 * Handles subscription registration and management for push notifications.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for push subscription
const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
  timestamp: z.number(),
  userAgent: z.string(),
});

// In-memory storage for development (use database in production)
const subscriptions: Array<z.infer<typeof subscriptionSchema> & { id: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);

    // Check if subscription already exists
    const existingIndex = subscriptions.findIndex(
      (sub) => sub.subscription.endpoint === validatedData.subscription.endpoint
    );

    const subscriptionData = {
      ...validatedData,
      id: crypto.randomUUID(),
    };

    if (existingIndex >= 0) {
      // Update existing subscription
      subscriptions[existingIndex] = subscriptionData;
      void console.error('Updated existing push subscription');
    } else {
      // Add new subscription
      subscriptions.push(subscriptionData);
      void console.error('Added new push subscription');
    }

    // In production, store in database:
    // await prisma.pushSubscription.upsert({
    //   where: { endpoint: validatedData.subscription.endpoint },
    //   update: {
    //     p256dhKey: validatedData.subscription.keys.p256dh,
    //     authKey: validatedData.subscription.keys.auth,
    //     userAgent: validatedData.userAgent,
    //     updatedAt: new Date(),
    //   },
    //   create: {
    //     endpoint: validatedData.subscription.endpoint,
    //     p256dhKey: validatedData.subscription.keys.p256dh,
    //     authKey: validatedData.subscription.keys.auth,
    //     userAgent: validatedData.userAgent,
    //   },
    // });

    return NextResponse.json({
      success: true,
      id: subscriptionData.id,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    void console.error('Error processing push subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subscription format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      totalSubscriptions: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        endpoint: sub.subscription.endpoint,
        timestamp: sub.timestamp,
        userAgent: sub.userAgent,
      })),
    });
  } catch (error) {
    void console.error('Error retrieving subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
