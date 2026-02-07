import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/', origin), {
      status: 302,
    })
  } catch (error) {
    console.error('Sign out error:', error)
    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/', origin), {
      status: 302,
    })
  }
}
