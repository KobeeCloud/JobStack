import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { updateDiagramSchema, uuidSchema } from '@/lib/validation/schemas'
import { ApiError } from '@/lib/api-error'
import { logger, log } from '@/lib/logger'

async function verifyDiagramAccess(
  supabase: any,
  diagramId: string,
  userId: string,
  requireEdit: boolean = false
): Promise<{ diagram: any; project: any }> {
  const { data: diagram, error: diagramError } = await supabase
    .from('diagrams')
    .select('*, project:projects(*)')
    .eq('id', diagramId)
    .single()

  if (diagramError || !diagram || !diagram.project) {
    throw new ApiError(404, 'Diagram not found', 'DIAGRAM_NOT_FOUND')
  }

  const project = diagram.project

  // Check if user owns the project
  if (project.user_id === userId) {
    return { diagram, project }
  }

  // Check for shared access
  const { data: { user } } = await supabase.auth.getUser()
  const { data: share } = await supabase
    .from('project_shares')
    .select('permission')
    .eq('project_id', project.id)
    .eq('shared_with_email', user?.email)
    .single()

  if (!share) {
    throw new ApiError(403, 'Forbidden - You do not have access to this diagram', 'FORBIDDEN')
  }

  // For PUT/DELETE, require edit permission
  if (requireEdit && share.permission !== 'edit') {
    throw new ApiError(403, 'Forbidden - You do not have edit permission for this diagram', 'FORBIDDEN')
  }

  return { diagram, project }
}

export const GET = createApiHandler(
  async (request: NextRequest, { auth }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const diagramId = uuidSchema.parse(params.id)

    const { diagram } = await verifyDiagramAccess(auth.supabase, diagramId, auth.user.id, false)

    // Return with data wrapper for compatibility
    const responseData = {
      ...diagram,
      data: { nodes: diagram.nodes || [], edges: diagram.edges || [] }
    }

    return NextResponse.json(responseData)
  },
  { requireAuth: true, method: 'GET' }
)

export const PUT = createApiHandler(
  async (request: NextRequest, { auth, body }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const diagramId = uuidSchema.parse(params.id)

    await verifyDiagramAccess(auth.supabase, diagramId, auth.user.id, true)

    // Check payload size (max 10MB)
    if (body && body.data) {
      const payloadSize = JSON.stringify(body.data).length
      if (payloadSize > 10 * 1024 * 1024) {
        throw new ApiError(413, 'Payload too large - maximum 10MB', 'PAYLOAD_TOO_LARGE')
      }
    }

    // Database has separate nodes/edges columns, not a single data column
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body?.name) {
      updateData.name = body.name
    }
    if (body?.data) {
      updateData.nodes = body.data.nodes || []
      updateData.edges = body.data.edges || []
    }

    const { data: diagram, error } = await auth.supabase
      .from('diagrams')
      .update(updateData)
      .eq('id', diagramId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update diagram', error, { diagramId, userId: auth.user.id })
      throw error
    }

    if (!diagram) {
      throw new ApiError(404, 'Diagram not found', 'DIAGRAM_NOT_FOUND')
    }

    // Return with data wrapper for compatibility
    const responseData = {
      ...diagram,
      data: { nodes: diagram.nodes || [], edges: diagram.edges || [] }
    }

    log.info('Diagram updated', { diagramId, userId: auth.user.id })

    return NextResponse.json(responseData)
  },
  {
    requireAuth: true,
    validateBody: updateDiagramSchema,
    method: 'PUT',
  }
)

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const diagramId = uuidSchema.parse(params.id)

    await verifyDiagramAccess(auth.supabase, diagramId, auth.user.id, true)

    const { error } = await auth.supabase.from('diagrams').delete().eq('id', diagramId)

    if (error) {
      logger.error('Failed to delete diagram', error, { diagramId, userId: auth.user.id })
      throw error
    }

    log.info('Diagram deleted', { diagramId, userId: auth.user.id })

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
