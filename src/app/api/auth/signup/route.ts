import { createClient } from '@/lib/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Create a new user 
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/confirm`,
      },
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Check if user needs to verify their email
    if (data?.user?.identities?.length === 0) {
      return NextResponse.json(
        { message: 'Email already exists. Please sign in instead.' },
        { status: 409 }
      )
    }
    
    return NextResponse.json({ 
      user: data.user,
      session: data.session,
      message: 'Check your email for a confirmation link'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred during signup' },
      { status: 500 }
    )
  }
}