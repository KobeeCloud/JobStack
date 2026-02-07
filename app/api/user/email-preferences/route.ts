import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface EmailPreferences {
  org_invites: boolean
  project_shares: boolean
  account_alerts: boolean
  weekly_digest: boolean
}

const DEFAULT_PREFS: EmailPreferences = {
  org_invites: true,
  project_shares: true,
  account_alerts: true,
  weekly_digest: false,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single()

    const prefs = {
      ...DEFAULT_PREFS,
      ...(profile?.settings?.email_preferences || {}),
    }

    return NextResponse.json(prefs)
  } catch (error) {
    console.error('Get email prefs error:', error)
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    // Get current settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single()

    const currentSettings = profile?.settings || {}
    const updatedSettings = {
      ...currentSettings,
      email_preferences: {
        ...DEFAULT_PREFS,
        org_invites: Boolean(body.org_invites),
        project_shares: Boolean(body.project_shares),
        account_alerts: Boolean(body.account_alerts),
        weekly_digest: Boolean(body.weekly_digest),
      },
    }

    const { error } = await supabase
      .from('profiles')
      .update({ settings: updatedSettings })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json(updatedSettings.email_preferences)
  } catch (error) {
    console.error('Update email prefs error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
