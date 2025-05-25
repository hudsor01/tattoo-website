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
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    logger.info(`Processed user webhook: ${eventType}`, { userId: id, eventType })
    return Response.json({ success: true })
    
  } catch (error) {
    logger.error('Error processing user webhook', { error, userId: id, eventType })
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name } = userData
  
  const primaryEmail = email_addresses.find((email: any) => email.email_address)?.email_address
  
  // All users have admin access since sign-up is disabled
  logger.info('User created', {
    clerkId: id,
    email: primaryEmail,
    name: `${first_name} ${last_name}`.trim(),
  })
  
  console.log(`✅ User created: ${primaryEmail}`)
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name } = userData
  const primaryEmail = email_addresses.find((email: any) => email.email_address)?.email_address
  
  logger.info('User updated', {
    clerkId: id,
    email: primaryEmail,
    name: `${first_name} ${last_name}`.trim(),
  })
  
  console.log(`🔄 User updated: ${primaryEmail}`)
}

async function handleUserDeleted(userData: any) {
  const { id } = userData
  
  logger.info('User deleted', { clerkId: id })
  console.log(`🗑️ User deleted: ${id}`)
  
  // Optional: Clean up any related data in your database
}