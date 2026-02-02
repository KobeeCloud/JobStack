import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get invite
    const { data: invite, error: inviteError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    }

    // Check if email matches
    if (invite.email !== user.email) {
      return NextResponse.json({ error: 'Invite is for different email' }, { status: 400 })
    }

    // Ensure profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })

      if (createProfileError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role,
      })

    if (memberError) {
      if (memberError.code === '23505') {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 })
      }
      throw memberError
    }

    // Delete invite
    await supabase
      .from('organization_invites')
      .delete()
      .eq('token', token)

    return NextResponse.json({ success: true, organization_id: invite.organization_id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
