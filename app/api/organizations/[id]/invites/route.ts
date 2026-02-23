import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { sendEmail, organizationInviteEmail } from '@/lib/email'
import { log } from '@/lib/logger'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
})

export const GET = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    const id = params?.id
    if (!id) throw new ApiError(400, 'Organization ID is required', 'MISSING_ID')

    // Check if user is owner or admin of organization
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ApiError(403, 'Only owners and admins can view invites', 'FORBIDDEN')
    }

    // Get all pending invites — SECURITY: exclude secret token from response
    const { data: invites, error } = await auth.supabase
      .from('organization_invites')
      .select('id, organization_id, email, role, invited_by, expires_at, created_at')
      .eq('organization_id', id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ invites: invites || [] })
  },
  { requireAuth: true, method: 'GET' }
)

export const POST = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    const id = params?.id
    if (!id) throw new ApiError(400, 'Organization ID is required', 'MISSING_ID')

    const body = await request.json()
    const parsed = createInviteSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase()
    const role = parsed.data.role

    // Check if user is owner or admin
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ApiError(403, 'Only owners and admins can send invites', 'FORBIDDEN')
    }

    // Check organization member limit
    const { data: org } = await auth.supabase
      .from('organizations')
      .select('max_members, name')
      .eq('id', id)
      .single()

    if (org) {
      const { count: currentMemberCount } = await auth.supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', id)

      if ((currentMemberCount || 0) >= (org.max_members || 10)) {
        throw new ApiError(400, `Organization has reached the maximum member limit (${org.max_members})`, 'MEMBER_LIMIT_REACHED')
      }
    }

    // Check if the INVITED email is already a member
    const { data: inviteeProfile } = await auth.supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (inviteeProfile) {
      const { data: existingMember } = await auth.supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', id)
        .eq('user_id', inviteeProfile.id)
        .single()

      if (existingMember) {
        throw new ApiError(400, 'User is already a member of this organization', 'ALREADY_MEMBER')
      }
    }

    // Get inviter profile for email
    const { data: inviterProfile } = await auth.supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', auth.user.id)
      .single()

    // Create invite
    const { data: invite, error } = await auth.supabase
      .from('organization_invites')
      .insert({
        organization_id: id,
        email: normalizedEmail,
        role,
        invited_by: auth.user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new ApiError(400, 'An invite for this email already exists', 'DUPLICATE_INVITE')
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

    log.info('Organization invite sent', { orgId: id, invitedEmailHash: normalizedEmail.replace(/(.{2}).*@/, '$1***@'), invitedBy: auth.user.id })

    // SECURITY: Strip secret token from response — only sent via email
    const { token: _secret, ...safeInvite } = invite as Record<string, unknown>
    return NextResponse.json({ invite: safeInvite })
  },
  { requireAuth: true, method: 'POST' }
)
