import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: 'Missing required headers' }, { status: 400 })
  }

  // Get the body
  const payload = await req.text()

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return Response.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'organizationMembership.created':
        await handleMembershipCreated(evt.data)
        break
      case 'organizationMembership.updated':
        await handleMembershipUpdated(evt.data)
        break
      case 'organizationMembership.deleted':
        await handleMembershipDeleted(evt.data)
        break
      default:
        console.log(`Unhandled organization event type: ${eventType}`)
    }

    logger.info(`Processed organization webhook: ${eventType}`, { membershipId: id, eventType })
    return Response.json({ success: true })
    
  } catch (error) {
    logger.error('Error processing organization webhook', { error, membershipId: id, eventType })
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleMembershipCreated(membershipData: any) {
  const { 
    id, 
    organization_id, 
    user_id,
    role,
    created_at 
  } = membershipData
  
  // Log organization membership creation
  logger.info('Organization membership created', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    role,
    createdAt: created_at,
    timestamp: new Date().toISOString()
  })
  
  console.log(`👥 New org member: User ${user_id} added to org ${organization_id} as ${role}`)
  
  // Optional: Update user permissions based on org role
  if (role === 'admin' || role === 'org:admin') {
    console.log(`🔑 User ${user_id} granted admin access via organization`)
  }
}

async function handleMembershipUpdated(membershipData: any) {
  const { 
    id, 
    organization_id, 
    user_id,
    role,
    updated_at 
  } = membershipData
  
  // Log organization membership update
  logger.info('Organization membership updated', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    role,
    updatedAt: updated_at,
    timestamp: new Date().toISOString()
  })
  
  console.log(`🔄 Org role updated: User ${user_id} role changed to ${role}`)
  
  // Optional: Update user permissions based on new role
  if (role === 'admin' || role === 'org:admin') {
    console.log(`⬆️ User ${user_id} promoted to admin via organization`)
  } else {
    console.log(`⬇️ User ${user_id} role changed to ${role}`)
  }
}

async function handleMembershipDeleted(membershipData: any) {
  const { 
    id, 
    organization_id, 
    user_id,
    deleted_at 
  } = membershipData
  
  // Log organization membership deletion
  logger.info('Organization membership deleted', {
    membershipId: id,
    organizationId: organization_id,
    userId: user_id,
    deletedAt: deleted_at,
    timestamp: new Date().toISOString()
  })
  
  console.log(`❌ Org member removed: User ${user_id} removed from org ${organization_id}`)
  
  // Optional: Revoke permissions if this was their only admin access
  console.log(`🔒 Check if User ${user_id} should lose admin access`)
}