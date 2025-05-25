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
      case 'session.created':
        await handleSessionCreated(evt.data)
        break
      case 'session.ended':
        await handleSessionEnded(evt.data)
        break
      default:
        console.log(`Unhandled session event type: ${eventType}`)
    }

    logger.info(`Processed session webhook: ${eventType}`, { sessionId: id, eventType })
    return Response.json({ success: true })
    
  } catch (error) {
    logger.error('Error processing session webhook', { error, sessionId: id, eventType })
    return Response.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleSessionCreated(sessionData: any) {
  const { 
    id, 
    user_id, 
    client_id, 
    created_at,
    last_active_at,
    status 
  } = sessionData
  
  // Log admin login activity
  logger.info('Admin session created', {
    sessionId: id,
    userId: user_id,
    clientId: client_id,
    createdAt: created_at,
    lastActiveAt: last_active_at,
    status,
    timestamp: new Date().toISOString()
  })
  
  console.log(`🔐 Admin login: User ${user_id} - Session ${id}`)
  
  // Optional: Store login activity in database
  // You could create a LoginActivity table to track admin logins
  /*
  await prisma.loginActivity.create({
    data: {
      sessionId: id,
      userId: user_id,
      loginTime: new Date(created_at),
      ipAddress: '', // Would need to extract from request
      userAgent: '', // Would need to extract from request
    }
  })
  */
}

async function handleSessionEnded(sessionData: any) {
  const { 
    id, 
    user_id, 
    ended_at,
    status 
  } = sessionData
  
  // Log admin logout activity
  logger.info('Admin session ended', {
    sessionId: id,
    userId: user_id,
    endedAt: ended_at,
    status,
    timestamp: new Date().toISOString()
  })
  
  console.log(`🚪 Admin logout: User ${user_id} - Session ${id}`)
  
  // Optional: Update session end time in database
  /*
  await prisma.loginActivity.updateMany({
    where: { sessionId: id },
    data: { 
      logoutTime: new Date(ended_at),
      status: 'ended'
    }
  })
  */
}