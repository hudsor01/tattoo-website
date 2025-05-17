import { createClient } from '@/lib/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Basic validation
    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase.auth.updateUser({
      password,
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred during password update' },
      { status: 500 }
    )
  }
}