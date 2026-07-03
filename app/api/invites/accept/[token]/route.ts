import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { log } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ token: string }>
}

export const POST = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    const token = params?.token
    if (!token) throw new ApiError(400, 'Token is required', 'MISSING_TOKEN')

    // Get invite
    const { data: invite, error: inviteError } = await auth.supabase
      .from('organization_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      throw new ApiError(404, 'Invalid invite', 'INVITE_NOT_FOUND')
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      throw new ApiError(400, 'Invite expired', 'INVITE_EXPIRED')
    }

    // Check if email matches
    if (invite.email !== auth.user.email) {
      throw new ApiError(403, 'Invite is for a different email', 'EMAIL_MISMATCH')
    }

    // Ensure profile exists
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('id')
      .eq('id', auth.user.id)
      .single()

    if (!profile) {
      // Fetch full user object for metadata
      const {
        data: { user: fullUser },
      } = await auth.supabase.auth.getUser()
      const { error: createProfileError } = await auth.supabase.from('profiles').insert({
        id: auth.user.id,
        email: auth.user.email!,
        full_name: fullUser?.user_metadata?.full_name || null,
        avatar_url: fullUser?.user_metadata?.avatar_url || null,
      })

      if (createProfileError) {
        throw new ApiError(500, 'Failed to create profile', 'PROFILE_CREATE_FAILED')
      }
    }

    // Add user to organization
    const { error: memberError } = await auth.supabase.from('organization_members').insert({
      organization_id: invite.organization_id,
      user_id: auth.user.id,
      role: invite.role,
    })

    if (memberError) {
      if (memberError.code === '23505') {
        throw new ApiError(400, 'Already a member', 'ALREADY_MEMBER')
      }
      throw memberError
    }

    // Delete invite
    await auth.supabase.from('organization_invites').delete().eq('token', token)

    log.info('Invite accepted', { orgId: invite.organization_id, userId: auth.user.id })

    return NextResponse.json({ success: true, organization_id: invite.organization_id })
  },
  { requireAuth: true, method: 'POST' }
)
