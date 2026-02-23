import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { z } from 'zod'

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

const emailPrefsSchema = z.object({
  org_invites: z.boolean(),
  project_shares: z.boolean(),
  account_alerts: z.boolean(),
  weekly_digest: z.boolean(),
})

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('settings')
      .eq('id', auth.user.id)
      .single()

    const prefs = {
      ...DEFAULT_PREFS,
      ...(profile?.settings?.email_preferences || {}),
    }

    return NextResponse.json(prefs)
  },
  { requireAuth: true, method: 'GET' }
)

export const PUT = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const parsed = emailPrefsSchema.parse(body)

    // Get current settings
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('settings')
      .eq('id', auth.user.id)
      .single()

    const currentSettings = profile?.settings || {}
    const updatedSettings = {
      ...currentSettings,
      email_preferences: {
        ...DEFAULT_PREFS,
        ...parsed,
      },
    }

    const { error } = await auth.supabase
      .from('profiles')
      .update({ settings: updatedSettings })
      .eq('id', auth.user.id)

    if (error) throw error

    return NextResponse.json(updatedSettings.email_preferences)
  },
  { requireAuth: true, method: 'PUT' }
)
