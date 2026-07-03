import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { updateProjectSchema, uuidSchema } from '@/lib/validation/schemas'
import { ApiError } from '@/lib/api-error'
import { log } from '@/lib/logger'

async function verifyProjectAccess(
  supabase: any,
  projectId: string,
  userId: string,
  userEmail: string
): Promise<void> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
  }

  // Check if user owns the project or has shared access
  if (project.user_id !== userId) {
    // Check shared access by user_id first, then by email
    const { data: shareById } = await supabase
      .from('project_shares')
      .select('id')
      .eq('project_id', projectId)
      .eq('shared_with_user_id', userId)
      .single()

    if (!shareById) {
      const { data: shareByEmail } = await supabase
        .from('project_shares')
        .select('id')
        .eq('project_id', projectId)
        .eq('shared_with_email', userEmail)
        .single()

      if (!shareByEmail) {
        throw new ApiError(403, 'Forbidden - You do not have access to this project', 'FORBIDDEN')
      }
    }
  }
}

export const GET = createApiHandler(
  async (request: NextRequest, { auth }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const projectId = uuidSchema.parse(params.id)

    await verifyProjectAccess(auth.supabase, projectId, auth.user.id, auth.user.email ?? '')

    const { data: project, error } = await auth.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      log.error('Failed to fetch project', error, { projectId, userId: auth.user.id })
      throw error
    }

    if (!project) {
      throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
    }

    return NextResponse.json(project)
  },
  { requireAuth: true, method: 'GET' }
)

export const PUT = createApiHandler(
  async (request: NextRequest, { auth, body }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const projectId = uuidSchema.parse(params.id)

    await verifyProjectAccess(auth.supabase, projectId, auth.user.id, auth.user.email ?? '')

    const { data: project, error } = await auth.supabase
      .from('projects')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      log.error('Failed to update project', error, { projectId, userId: auth.user.id })
      throw error
    }

    if (!project) {
      throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
    }

    log.info('Project updated', { projectId, userId: auth.user.id })

    return NextResponse.json(project)
  },
  {
    requireAuth: true,
    validateBody: updateProjectSchema,
    method: 'PUT',
  }
)

export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, context?: any) => {
    if (!context?.params) {
      throw new ApiError(400, 'Missing route parameters', 'MISSING_PARAMS')
    }

    const params = await context.params
    const projectId = uuidSchema.parse(params.id)

    await verifyProjectAccess(auth.supabase, projectId, auth.user.id, auth.user.email ?? '')

    const { error } = await auth.supabase.from('projects').delete().eq('id', projectId)

    if (error) {
      log.error('Failed to delete project', error, { projectId, userId: auth.user.id })
      throw error
    }

    log.info('Project deleted', { projectId, userId: auth.user.id })

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
