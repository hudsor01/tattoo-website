import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { logger } from '@/lib/logger';
import type { ClerkWebhookEvent, ClerkUserWebhookData } from '@/types/clerk-types';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET ?? '');

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    void console.error('Error verifying webhook:', err);
    return Response.json({ error: 'Verification failed' }, { status: 400 });
  }

  // Handle the webhook
  const userData = evt.data as unknown as ClerkUserWebhookData;
  const { id } = userData;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(userData);
        break;
      case 'user.updated':
        await handleUserUpdated(userData);
        break;
      case 'user.deleted':
        await handleUserDeleted(userData);
        break;
      default:
        void console.warn(`Unhandled event type: ${eventType}`);
    }

    void logger.info(`Processed user webhook: ${eventType}`, { userId: id, eventType });
    return Response.json({ success: true });
  } catch (error) {
    void logger.error('Error processing user webhook', { error, userId: id, eventType });
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleUserCreated(userData: ClerkUserWebhookData) {
  const { id, email_addresses, first_name, last_name } = userData;

  const primaryEmail = email_addresses?.find((email) => email.email_address)?.email_address;

  // All users have admin access since sign-up is disabled
  void logger.info('User created', {
    clerkId: id,
    email: primaryEmail,
    name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
  });

  void console.warn(`✅ User created: ${primaryEmail}`);
}

async function handleUserUpdated(userData: ClerkUserWebhookData) {
  const { id, email_addresses, first_name, last_name } = userData;
  const primaryEmail = email_addresses?.find((email) => email.email_address)?.email_address;

  void logger.info('User updated', {
    clerkId: id,
    email: primaryEmail,
    name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
  });

  void console.warn(`🔄 User updated: ${primaryEmail}`);
}

async function handleUserDeleted(userData: ClerkUserWebhookData) {
  const { id } = userData;

  void logger.info('User deleted', { clerkId: id });
  void console.warn(`🗑️ User deleted: ${id}`);

  // Optional: Clean up any related data in your database
}
