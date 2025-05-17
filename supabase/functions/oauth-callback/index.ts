
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    // Get URL and code from the request
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const provider = url.searchParams.get('provider') || 'google'
    
    if (!code) {
      return new Response('Missing authorization code', { status: 400 })
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Process based on the provider
    let result
    
    switch (provider) {
      case 'google':
        result = await processGoogleOAuth(code, state)
        break
      
      case 'instagram':
        result = await processInstagramOAuth(code, state)
        break
      
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
    
    // Store the tokens
    await supabaseClient
      .from('OAuthTokens')
      .upsert({
        provider,
        user_id: result.userId,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        token_data: result.tokenData,
        expires_at: result.expiresAt,
        scope: result.scope
      })
    
    // Redirect to success page
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/oauth-success?provider=${provider}`, 302)
  } catch (error) {
    console.error('OAuth callback error:', error)
    
    // Redirect to error page
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/oauth-error?error=${encodeURIComponent(error.message)}`, 302)
  }
})

// Process Google OAuth
async function processGoogleOAuth(code: string, state: string | null) {
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      redirect_uri: `${Deno.env.get('SUPABASE_URL') || ''}/functions/v1/oauth-callback?provider=google`,
      grant_type: 'authorization_code'
    })
  })
  
  if (!tokenResponse.ok) {
    throw new Error(`Failed to exchange code: ${await tokenResponse.text()}`)
  }
  
  const tokenData = await tokenResponse.json()
  
  // Get user info
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  })
  
  if (!userInfoResponse.ok) {
    throw new Error('Failed to get user info')
  }
  
  const userInfo = await userInfoResponse.json()
  
  // Parse userId from state or use email as fallback
  const userId = state || userInfo.email
  
  return {
    userId,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    tokenData,
    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    scope: tokenData.scope
  }
}

// Process Instagram OAuth
async function processInstagramOAuth(code: string, state: string | null) {
  // Exchange code for token
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: Deno.env.get('INSTAGRAM_CLIENT_ID') || '',
      client_secret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') || '',
      grant_type: 'authorization_code',
      redirect_uri: `${Deno.env.get('SUPABASE_URL') || ''}/functions/v1/oauth-callback?provider=instagram`,
      code
    })
  })
  
  if (!tokenResponse.ok) {
    throw new Error(`Failed to exchange code: ${await tokenResponse.text()}`)
  }
  
  const tokenData = await tokenResponse.json()
  
  // Get long-lived token
  const longLivedTokenResponse = await fetch(
    `https://graph.instagram.com/access_token?` +
    `grant_type=ig_exchange_token&` +
    `client_secret=${Deno.env.get('INSTAGRAM_CLIENT_SECRET') || ''}&` +
    `access_token=${tokenData.access_token}`
  )
  
  if (!longLivedTokenResponse.ok) {
    throw new Error('Failed to get long-lived token')
  }
  
  const longLivedTokenData = await longLivedTokenResponse.json()
  
  // Parse userId from state or use instagram user_id as fallback
  const userId = state || tokenData.user_id
  
  return {
    userId,
    accessToken: longLivedTokenData.access_token,
    refreshToken: null,
    tokenData: {
      ...tokenData,
      ...longLivedTokenData
    },
    expiresAt: new Date(Date.now() + longLivedTokenData.expires_in * 1000).toISOString(),
    scope: 'instagram_basic'
  }
}
