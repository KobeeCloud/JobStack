import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { log } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ id: string; memberId: string }>
}

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const resolvedParams = await routeContext?.params
    const orgId = resolvedParams?.id
    const memberId = resolvedParams?.memberId

    if (!orgId || !memberId) {
      throw new ApiError(400, 'Organization ID and Member ID are required', 'MISSING_IDS')
    }

    // Check if user is owner or admin
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ApiError(403, 'Only owners and admins can remove members', 'FORBIDDEN')
    }

    // Get the member to be removed
    const { data: targetMember } = await auth.supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single()

    if (!targetMember) {
      throw new ApiError(404, 'Member not found', 'NOT_FOUND')
    }

    // Cannot remove owner
    if (targetMember.role === 'owner') {
      throw new ApiError(403, 'Cannot remove the organization owner', 'CANNOT_REMOVE_OWNER')
    }

    // Admin cannot remove other admins
    if (membership.role === 'admin' && targetMember.role === 'admin') {
      throw new ApiError(403, 'Admins cannot remove other admins', 'CANNOT_REMOVE_ADMIN')
    }

    // Remove the member
    const { error } = await auth.supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      log.error('Failed to remove member', error)
      throw new ApiError(500, 'Failed to remove member', 'REMOVE_FAILED')
    }

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
