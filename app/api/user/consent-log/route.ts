import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

/**
 * POST /api/user/consent-log
 * Persist cookie consent choice server-side for GDPR audit trail.
 * Accepts: { choice: 'all' | 'necessary', timestamp: string }
 * Works for both authenticated and anonymous users.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const choice = body?.choice
    const timestamp = body?.timestamp || new Date().toISOString()

    if (!choice || !['all', 'necessary'].includes(choice)) {
      return NextResponse.json({ error: 'Invalid consent choice' }, { status: 400 })
    }

    // Try to get authenticated user (optional — anonymous visitors can also consent)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // Not authenticated — that's fine
    }

    // Log for GDPR audit trail
    log.info('Cookie consent recorded', {
      userId: userId ?? 'anonymous',
      choice,
      timestamp,
      userAgent: request.headers.get('user-agent') ?? 'unknown',
    })

    // If user is authenticated, persist to their profile
    if (userId) {
      try {
        const supabase = await createClient()
        await supabase
          .from('profiles')
          .update({
            cookie_consent: choice,
            cookie_consent_at: timestamp,
          })
          .eq('id', userId)
      } catch {
        // Non-blocking — the structured log is the primary audit trail
        log.warn('Failed to persist cookie consent to profile', { userId })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
