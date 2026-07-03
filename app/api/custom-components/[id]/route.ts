import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'

interface RouteContext {
  params: Promise<{ id: string }>
}

const allowedFields = [
  'name',
  'description',
  'category',
  'icon',
  'color',
  'provider',
  'default_config',
  'connection_rules',
  'is_shared',
] as const

async function verifyComponentAccess(
  supabase: any,
  componentId: string,
  userId: string,
  requireAdmin: boolean = false
) {
  const { data: component } = await supabase
    .from('custom_components')
    .select('organization_id')
    .eq('id', componentId)
    .single()

  if (!component) {
    throw new ApiError(404, 'Component not found', 'NOT_FOUND')
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', component.organization_id)
    .eq('user_id', userId)
    .single()

  if (!membership) {
    throw new ApiError(403, 'Not a member of this organization', 'FORBIDDEN')
  }

  if (requireAdmin && !['owner', 'admin'].includes(membership.role)) {
    throw new ApiError(
      403,
      'Only organization owners and admins can modify components',
      'FORBIDDEN'
    )
  }

  return component
}

export const GET = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing component ID', 'MISSING_ID')
    const id = uuidSchema.parse(params.id)

    // Verify membership (read access)
    await verifyComponentAccess(auth.supabase, id, auth.user.id, false)

    const { data, error } = await auth.supabase
      .from('custom_components')
      .select('*, profiles:created_by(full_name, avatar_url)')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new ApiError(404, 'Component not found', 'NOT_FOUND')
    }

    return NextResponse.json(data)
  },
  { requireAuth: true, method: 'GET' }
)

export const PATCH = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing component ID', 'MISSING_ID')
    const id = uuidSchema.parse(params.id)

    // Verify admin access
    await verifyComponentAccess(auth.supabase, id, auth.user.id, true)

    const body = await request.json()

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid fields to update', 'EMPTY_UPDATE')
    }

    // Validate name if provided
    if (updates.name) {
      const nameStr = updates.name as string
      const namePattern = /^[a-zA-Z0-9][a-zA-Z0-9\s\-_]{0,62}[a-zA-Z0-9]$/
      if (nameStr.length < 2 || !namePattern.test(nameStr)) {
        throw new ApiError(400, 'Invalid component name format', 'INVALID_NAME')
      }
      updates.name = nameStr.trim()
    }

    // Validate color if provided
    if (updates.color && !/^#[0-9a-fA-F]{6}$/.test(updates.color as string)) {
      throw new ApiError(400, 'Color must be a valid hex color (e.g., #6366f1)', 'INVALID_COLOR')
    }

    const { data, error } = await auth.supabase
      .from('custom_components')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new ApiError(
          409,
          'A component with this name already exists in this organization',
          'DUPLICATE_NAME'
        )
      }
      throw error
    }

    return NextResponse.json(data)
  },
  { requireAuth: true, method: 'PATCH' }
)

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing component ID', 'MISSING_ID')
    const id = uuidSchema.parse(params.id)

    // Verify admin access
    await verifyComponentAccess(auth.supabase, id, auth.user.id, true)

    const { error } = await auth.supabase.from('custom_components').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
