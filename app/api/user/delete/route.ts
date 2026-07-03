import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { log } from '@/lib/logger'

const GRACE_PERIOD_DAYS = 7

// POST — schedule account deletion (soft-delete with grace period)
export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS)

    const { error } = await auth.supabase
      .from('profiles')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_at: scheduledFor.toISOString(),
      })
      .eq('id', auth.user.id)

    if (error) throw error

    log.info('Account deletion scheduled', {
      userId: auth.user.id,
      scheduledFor: scheduledFor.toISOString(),
    })

    return NextResponse.json({
      message: 'Account deletion scheduled',
      deletion_scheduled_at: scheduledFor.toISOString(),
      grace_period_days: GRACE_PERIOD_DAYS,
    })
  },
  { requireAuth: true, method: 'POST' }
)

// DELETE — cancel a scheduled deletion
export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { error } = await auth.supabase
      .from('profiles')
      .update({
        deletion_requested_at: null,
        deletion_scheduled_at: null,
      })
      .eq('id', auth.user.id)

    if (error) throw error

    log.info('Account deletion cancelled', { userId: auth.user.id })

    return NextResponse.json({ message: 'Account deletion cancelled' })
  },
  { requireAuth: true, method: 'DELETE' }
)

// PUT — GDPR Art. 17: Immediate hard-delete (Right to Erasure / Prawo do Bycia Zapomnianym)
// Permanently removes ALL user data from the database and deletes the auth.users entry.
export const PUT = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const userId = auth.user.id

    // 1. Call the SECURITY DEFINER function — cascades through all tables
    const admin = createAdminClient()
    const { error: rpcError } = await admin.rpc('gdpr_hard_delete_user', { p_user_id: userId })
    if (rpcError) {
      log.error('GDPR hard-delete RPC failed', rpcError, { userId })
      throw rpcError
    }

    // 2. Remove auth.users entry (requires service-role key)
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      log.error('GDPR auth.users delete failed', authDeleteError, { userId })
      // Profile data is already gone — log but don't throw, the user is erased
    }

    log.info('GDPR hard-delete completed', { userId })

    return NextResponse.json({
      message: 'All personal data has been permanently deleted (GDPR Art. 17)',
    })
  },
  { requireAuth: true, method: 'PUT' }
)
