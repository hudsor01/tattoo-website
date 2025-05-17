import { createClient } from '@/lib/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      session: data.session,
      user: data.session?.user || null
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred while retrieving session' },
      { status: 500 }
    )
  }
}