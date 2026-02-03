import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { createProjectSchema, paginationSchema } from '@/lib/validation/schemas'
import { log } from '@/lib/logger'

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
      log.error('Failed to fetch projects', error)
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
    if (!body) {
      throw new Error('Missing request body')
    }

    // Build settings object with project types
    const settings: Record<string, unknown> = {}
    if (body.project_types && Array.isArray(body.project_types)) {
      settings.project_types = body.project_types
    }

    const { data: project, error } = await auth.supabase
      .from('projects')
      .insert({
        user_id: auth.user.id,
        name: body.name,
        description: body.description || null,
        cloud_provider: body.cloud_provider || 'azure',
        settings: settings,
      })
      .select()
      .single()

    if (error) {
      log.error('Failed to create project', error, { userId: auth.user.id, body });
      return NextResponse.json({ error: error.message || 'Failed to create project', details: error.details || error }, { status: 500 });
    }

    log.info('Project created', { projectId: project.id, userId: auth.user.id })

    return NextResponse.json(project, { status: 201 })
  },
  {
    requireAuth: true,
    validateBody: createProjectSchema,
    method: 'POST',
  }
)
