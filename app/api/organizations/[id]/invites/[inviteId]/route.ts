import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'

interface RouteContext {
  params: Promise<{ id: string; inviteId: string }>
}

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id || !params?.inviteId) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const orgId = uuidSchema.parse(params.id)
    const inviteId = uuidSchema.parse(params.inviteId)

    // Check if user is owner or admin
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ApiError(403, 'Only owners and admins can delete invites', 'FORBIDDEN')
    }

    // Delete invite
    const { error } = await auth.supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId)
      .eq('organization_id', orgId)

    if (error) throw error

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
