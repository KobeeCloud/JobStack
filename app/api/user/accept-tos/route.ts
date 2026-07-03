import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { log } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/user/accept-tos
 * Records explicit consent for Terms of Service and Privacy Policy.
 * Sets `tos_accepted_at` and `privacy_accepted_at` on the user's profile.
 */
export const POST = createApiHandler(
  async (_request: NextRequest, { auth }) => {
    const now = new Date().toISOString()

    const { data: updatedProfile, error } = await auth.supabase
      .from('profiles')
      .update({
        tos_accepted_at: now,
        privacy_accepted_at: now,
      })
      .eq('id', auth.user.id)
      .select('id')
      .maybeSingle()

    if (error) {
      log.error('Failed to record ToS consent', error, { userId: auth.user.id })
      return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 })
    }

    if (!updatedProfile) {
      try {
        const admin = createAdminClient()
        const { error: upsertError } = await admin.from('profiles').upsert(
          {
            id: auth.user.id,
            email: auth.user.email,
            tos_accepted_at: now,
            privacy_accepted_at: now,
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )

        if (upsertError) {
          log.error('Failed to create missing profile while recording ToS consent', upsertError, {
            userId: auth.user.id,
          })
          return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 })
        }
      } catch (adminError) {
        log.error('Admin client unavailable while recording ToS consent', adminError as Error, {
          userId: auth.user.id,
        })
        return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 })
      }
    }

    log.info('User accepted ToS and Privacy Policy', { userId: auth.user.id })

    const response = NextResponse.json({ accepted: true, accepted_at: now })
    // Clear profile cache so middleware fetches fresh ToS status and lets user into dashboard
    response.cookies.delete('__js_profile_cache')

    return response
  },
  { requireAuth: true, method: 'POST' }
)
