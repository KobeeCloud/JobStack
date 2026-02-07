import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const GRACE_PERIOD_DAYS = 7

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + GRACE_PERIOD_DAYS)

    const { error } = await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_scheduled_for: scheduledFor.toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({
      message: 'Account deletion scheduled',
      deletion_scheduled_for: scheduledFor.toISOString(),
      grace_period_days: GRACE_PERIOD_DAYS,
    })
  } catch (error) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule account deletion' },
      { status: 500 }
    )
  }
}

// Cancel a scheduled deletion
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        deleted_at: null,
        deletion_scheduled_for: null,
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Account deletion cancelled' })
  } catch (error) {
    console.error('Cancel deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel account deletion' },
      { status: 500 }
    )
  }
}
