import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/', origin), {
      status: 302,
    })
  } catch (error) {
    log.error('Sign out error', error as Error)
    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/', origin), {
      status: 302,
    })
  }
}
