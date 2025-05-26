import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { logger } from '@/lib/logger';
import type {
  ClerkWebhookEvent,
  ClerkOrganizationMembershipWebhookData,
} from '@/types/clerk-types';

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
  const membershipData = evt.data as unknown as ClerkOrganizationMembershipWebhookData;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'organizationMembership.created':
        await handleMembershipCreated(membershipData);
        break;
      case 'organizationMembership.updated':
        await handleMembershipUpdated(membershipData);
        break;
      case 'organizationMembership.deleted':
        await handleMembershipDeleted(membershipData);
        break;
      default:
        void console.warn(`Unhandled organization event type: ${eventType}`);
    }

    void logger.info(`Processed organization webhook: ${eventType}`, {
      membershipId: membershipData.id,
      eventType,
    });
    return Response.json({ success: true });
  } catch (error) {
    void logger.error('Error processing organization webhook', {
      error,
      membershipId: membershipData.id,
      eventType,
    });
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleMembershipCreated(membershipData: ClerkOrganizationMembershipWebhookData) {
  const { id, organization_id, user_id, role, created_at } = membershipData;

  // Log organization membership creation
  void logger.info('Organization membership created', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    role,
    createdAt: created_at,
    timestamp: new Date().toISOString(),
  });

  void console.warn(
    `👥 New org member: User ${user_id} added to org ${organization_id} as ${role}`
  );

  // Optional: Update user permissions based on org role
  if (role === 'admin' || role === 'org:admin') {
    void console.warn(`🔑 User ${user_id} granted admin access via organization`);
  }
}

async function handleMembershipUpdated(membershipData: ClerkOrganizationMembershipWebhookData) {
  const { id, organization_id, user_id, role, updated_at } = membershipData;

  // Log organization membership update
  void logger.info('Organization membership updated', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    role,
    updatedAt: updated_at,
    timestamp: new Date().toISOString(),
  });

  void console.warn(`🔄 Org role updated: User ${user_id} role changed to ${role}`);

  // Optional: Update user permissions based on new role
  if (role === 'admin' || role === 'org:admin') {
    void console.warn(`⬆️ User ${user_id} promoted to admin via organization`);
  } else {
    void console.warn(`⬇️ User ${user_id} role changed to ${role}`);
  }
}

async function handleMembershipDeleted(membershipData: ClerkOrganizationMembershipWebhookData) {
  const { id, organization_id, user_id, deleted_at } = membershipData;

  // Log organization membership deletion
  void logger.info('Organization membership deleted', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    deletedAt: deleted_at,
    timestamp: new Date().toISOString(),
  });

  void console.warn(`❌ Org member removed: User ${user_id} removed from org ${organization_id}`);

  // Optional: Revoke permissions if this was their only admin access
  void console.warn(`🔒 Check if User ${user_id} should lose admin access`);
}
