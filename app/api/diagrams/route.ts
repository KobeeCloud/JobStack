import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, applyRateLimit } from '@/lib/api-helpers'
import { createDiagramSchema, uuidSchema, paginationSchema } from '@/lib/validation/schemas'
import { ApiError } from '@/lib/api-error'
import { logger, log } from '@/lib/logger'

async function verifyProjectAccess(supabase: any, projectId: string, userId: string): Promise<void> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
  }

  if (project.user_id !== userId) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: share } = await supabase
      .from('project_shares')
      .select('id')
      .eq('project_id', projectId)
      .eq('shared_with_email', user?.email)
      .single()

    if (!share) {
      throw new ApiError(403, 'Forbidden - You do not have access to this project', 'FORBIDDEN')
    }
  }
}

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const project_id = searchParams.get('project_id')

    if (!project_id) {
      throw new ApiError(400, 'project_id query parameter is required', 'MISSING_PROJECT_ID')
    }

    const projectId = uuidSchema.parse(project_id)
    await verifyProjectAccess(auth.supabase, projectId, auth.user.id)

    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })

    const { data: diagrams, error, count } = await auth.supabase
      .from('diagrams')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1)

    if (error) {
      logger.error('Failed to fetch diagrams', error, { projectId, userId: auth.user.id })
      throw error
    }

    return NextResponse.json({
      data: diagrams || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit),
      },
    })
  },
  { requireAuth: true, method: 'GET' }
)

export const POST = createApiHandler(
  async (request: NextRequest, { auth, body }) => {
    if (!body) {
      throw new ApiError(400, 'Missing request body', 'MISSING_BODY')
    }
    await verifyProjectAccess(auth.supabase, body.project_id, auth.user.id)

    // Check payload size (max 10MB for diagram data)
    const payloadSize = JSON.stringify(body.data).length
    if (payloadSize > 10 * 1024 * 1024) {
      throw new ApiError(413, 'Payload too large - maximum 10MB', 'PAYLOAD_TOO_LARGE')
    }

    const { data: diagram, error } = await auth.supabase
      .from('diagrams')
      .insert({
        project_id: body.project_id,
        name: body.name,
        data: body.data,
        thumbnail_url: body.thumbnail_url || null,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create diagram', error, { projectId: body.project_id, userId: auth.user.id })
      throw error
    }

    log.info('Diagram created', { diagramId: diagram.id, projectId: body.project_id, userId: auth.user.id })

    return NextResponse.json(diagram, { status: 201 })
  },
  {
    requireAuth: true,
    validateBody: createDiagramSchema,
    method: 'POST',
  }
)
