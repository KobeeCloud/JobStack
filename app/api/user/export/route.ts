import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Collect all user data

    // 1. Profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const profileExport = {
      id: user.id,
      email: user.email,
      email_verified: user.email_confirmed_at != null,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
      user_metadata: user.user_metadata,
      profile: profile || null,
    }

    // 2. Projects with diagrams
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)

    const projectsWithDiagrams = []
    if (projects) {
      for (const project of projects) {
        const { data: diagrams } = await supabase
          .from('diagrams')
          .select('*')
          .eq('project_id', project.id)

        projectsWithDiagrams.push({
          ...project,
          diagrams: diagrams || [],
        })
      }
    }

    // 3. Organization memberships
    const { data: memberships } = await supabase
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
    const { data: invites } = await supabase
      .from('invitations')
      .select('*')
      .or(`invited_by.eq.${user.id},email.eq.${user.email}`)

    // Compose the full export
    const exportData = {
      _meta: {
        exported_at: new Date().toISOString(),
        format_version: '1.0',
        application: 'JobStack',
        description: 'Complete data export (GDPR Art. 20)',
      },
      profile: profileExport,
      projects: projectsWithDiagrams,
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
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
