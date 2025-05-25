export async function GET() {
  return Response.json({ 
    status: 'Clerk webhooks are configured',
    endpoints: [
      '/api/webhooks/clerk/user',
      '/api/webhooks/clerk/session', 
      '/api/webhooks/clerk/organization'
    ],
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return Response.json({ 
    message: 'Webhook test endpoint - use specific webhook URLs for actual events',
    timestamp: new Date().toISOString()
  })
}