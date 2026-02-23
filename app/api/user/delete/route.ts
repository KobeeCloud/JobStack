import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { log } from '@/lib/logger'

const GRACE_PERIOD_DAYS = 7

// POST — schedule account deletion
export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS)

    const { error } = await auth.supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_scheduled_for: scheduledFor.toISOString(),
      })
      .eq('id', auth.user.id)

    if (error) throw error

    log.info('Account deletion scheduled', { userId: auth.user.id, scheduledFor: scheduledFor.toISOString() })

    return NextResponse.json({
      message: 'Account deletion scheduled',
      deletion_scheduled_for: scheduledFor.toISOString(),
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
        deleted_at: null,
        deletion_scheduled_for: null,
      })
      .eq('id', auth.user.id)

    if (error) throw error

    log.info('Account deletion cancelled', { userId: auth.user.id })

    return NextResponse.json({ message: 'Account deletion cancelled' })
  },
  { requireAuth: true, method: 'DELETE' }
)
