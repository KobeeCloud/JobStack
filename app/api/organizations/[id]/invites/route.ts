import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, organizationInviteEmail } from '@/lib/email'
import { log } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or admin of organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all pending invites
    const { data: invites, error } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('organization_id', id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // FIX BUG#2: Return correct key 'invites' (frontend reads invitesData.invites)
    return NextResponse.json({ invites: invites || [] })
  } catch (error: any) {
    log.error('Failed to fetch invites', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check organization member limit
    const { data: org } = await supabase
      .from('organizations')
      .select('max_members, name')
      .eq('id', id)
      .single()

    if (org) {
      const { count: currentMemberCount } = await supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', id)

      if ((currentMemberCount || 0) >= (org.max_members || 10)) {
        return NextResponse.json(
          { error: `Organization has reached the maximum member limit (${org.max_members})` },
          { status: 400 }
        )
      }
    }

    // FIX BUG#1: Check if the INVITED email is already a member (not the inviting user)
    const { data: inviteeProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (inviteeProfile) {
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', id)
        .eq('user_id', inviteeProfile.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
      }
    }

    // Get inviter profile for email
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Create invite
    const { data: invite, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: id,
        email: normalizedEmail,
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An invite for this email already exists' }, { status: 400 })
      }
      throw error
    }

    // Send invite email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jobstack.app'
    const inviteUrl = `${appUrl}/invites/accept/${invite.token}`
    const orgName = org?.name || 'the organization'
    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'A team member'

    const emailContent = organizationInviteEmail({ orgName, inviterName, inviteUrl })
    await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    log.info('Organization invite sent', { orgId: id, invitedEmail: normalizedEmail, invitedBy: user.id })

    // FIX BUG#2: Return key 'invite' (frontend reads data.invite)
    return NextResponse.json({ invite })
  } catch (error: any) {
    log.error('Failed to create invite', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
