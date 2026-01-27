import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, getAuthenticatedUser, applyRateLimit } from '@/lib/api-helpers'
import { createProjectSchema, paginationSchema } from '@/lib/validation/schemas'
import { handleApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })

    const { data: projects, error, count } = await auth.supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.user.id)
      .order('updated_at', { ascending: false })
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1)

    if (error) {
      logger.error('Failed to fetch projects', error)
      throw error
    }

    return NextResponse.json({
      data: projects || [],
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
    const { data: project, error } = await auth.supabase
      .from('projects')
      .insert({
        user_id: auth.user.id,
        name: body.name,
        description: body.description || null,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create project', error, { userId: auth.user.id })
      throw error
    }

    logger.info('Project created', { projectId: project.id, userId: auth.user.id })

    return NextResponse.json(project, { status: 201 })
  },
  {
    requireAuth: true,
    validateBody: createProjectSchema,
    method: 'POST',
  }
)
