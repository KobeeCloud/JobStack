import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { log } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const resolvedParams = await routeContext?.params
    const orgId = resolvedParams?.id

    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required', 'MISSING_ID')
    }

    // Get organization details
    const { data: org, error: orgError } = await auth.supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      throw new ApiError(404, 'Organization not found', 'NOT_FOUND')
    }

    // Check if user is a member
    const { data: membership, error: memberError } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', auth.user.id)
      .single()

    if (memberError || !membership) {
      throw new ApiError(403, 'You are not a member of this organization', 'FORBIDDEN')
    }

    // Get all members with their profiles
    const { data: members, error: membersError } = await auth.supabase
      .from('organization_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('organization_id', orgId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      log.error('Failed to fetch members', membersError)
    }

    return NextResponse.json({
      organization: org,
      members: members || [],
      userRole: membership.role,
    })
  },
  { requireAuth: true, method: 'GET' }
)

export const PUT = createApiHandler(
  async (request: NextRequest, { auth, body }, routeContext?: RouteContext) => {
    const resolvedParams = await routeContext?.params
    const orgId = resolvedParams?.id

    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required', 'MISSING_ID')
    }

    // Check if user is owner or admin
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ApiError(403, 'Only owners and admins can update organization', 'FORBIDDEN')
    }

    const updateBody = body as { name?: string; description?: string }

    const { data: org, error } = await auth.supabase
      .from('organizations')
      .update({
        name: updateBody.name,
        description: updateBody.description,
      })
      .eq('id', orgId)
      .select()
      .single()

    if (error) {
      log.error('Failed to update organization', error)
      throw new ApiError(500, 'Failed to update organization', 'UPDATE_FAILED')
    }

    return NextResponse.json({ organization: org })
  },
  { requireAuth: true, method: 'PUT' }
)

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const resolvedParams = await routeContext?.params
    const orgId = resolvedParams?.id

    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required', 'MISSING_ID')
    }

    // Check if user is owner
    const { data: membership } = await auth.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', auth.user.id)
      .single()

    if (!membership || membership.role !== 'owner') {
      throw new ApiError(403, 'Only owners can delete organization', 'FORBIDDEN')
    }

    const { error } = await auth.supabase
      .from('organizations')
      .delete()
      .eq('id', orgId)

    if (error) {
      log.error('Failed to delete organization', error)
      throw new ApiError(500, 'Failed to delete organization', 'DELETE_FAILED')
    }

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
