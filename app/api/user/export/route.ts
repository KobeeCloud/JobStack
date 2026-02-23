import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const user = auth.user

    // Fetch full Supabase user for metadata fields
    const { data: { user: fullUser } } = await auth.supabase.auth.getUser()

    // 1. Profile data
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const profileExport = {
      id: user.id,
      email: user.email,
      email_verified: fullUser?.email_confirmed_at != null,
      created_at: fullUser?.created_at,
      last_sign_in: fullUser?.last_sign_in_at,
      user_metadata: fullUser?.user_metadata,
      profile: profile || null,
    }

    // 2. Projects with diagrams — single JOIN query
    const { data: projectsWithDiagrams } = await auth.supabase
      .from('projects')
      .select('*, diagrams(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    // 3. Organization memberships
    const { data: memberships } = await auth.supabase
      .from('organization_members')
      .select(`
        role,
        joined_at,
        organizations (
          id,
          name,
          slug,
          created_at
        )
      `)
      .eq('user_id', user.id)

    // 4. Invitations sent/received
    // MEDIUM-009: Sanitize email for PostgREST filter to prevent injection
    const safeEmail = (user.email ?? '').replace(/[,()]/g, '')
    const { data: invites } = await auth.supabase
      .from('organization_invites')
      .select('*')
      .or(`invited_by.eq.${user.id},email.eq.${safeEmail}`)

    // Compose the full export
    const exportData = {
      _meta: {
        exported_at: new Date().toISOString(),
        format_version: '1.0',
        application: 'JobStack',
        description: 'Complete data export (GDPR Art. 20)',
      },
      profile: profileExport,
      projects: projectsWithDiagrams || [],
      organizations: memberships || [],
      invitations: invites || [],
    }

    // Return as downloadable JSON
    const json = JSON.stringify(exportData, null, 2)
    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jobstack-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  },
  { requireAuth: true, method: 'GET' }
)
