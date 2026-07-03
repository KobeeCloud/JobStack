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

    const {
      data: projects,
      error,
      count,
    } = await auth.supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${auth.user.id},organization_id.not.is.null`)
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

    // Build settings object with project types, region, and environment
    const settings: Record<string, unknown> = {}
    if (body.project_types && Array.isArray(body.project_types)) {
      settings.project_types = body.project_types
    }
    if (body.region) {
      settings.region = body.region
    }
    if (body.environment) {
      settings.environment = body.environment
    }

    // Build insert payload — include organization_id if provided
    const insertPayload: Record<string, unknown> = {
      user_id: auth.user.id,
      name: body.name,
      description: body.description || null,
      cloud_provider: body.cloud_provider || 'azure',
      settings,
    }
    if (body.organization_id) {
      insertPayload.organization_id = body.organization_id
    }

    const { data: project, error } = await auth.supabase
      .from('projects')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      log.error('Failed to create project', error, {
        userId: auth.user.id,
        projectName: body?.name,
      })
      return NextResponse.json(
        { error: error.message || 'Failed to create project', details: error.details || error },
        { status: 500 }
      )
    }

    log.info('Project created', {
      projectId: project.id,
      userId: auth.user.id,
      organization_id: body.organization_id ?? null,
    })

    // If a template was selected, load it and create an initial diagram
    if (body.templateId) {
      const { data: template } = await auth.supabase
        .from('templates')
        .select('nodes, edges, name')
        .eq('id', body.templateId)
        .single()

      if (template) {
        const { error: diagramError } = await auth.supabase.from('diagrams').insert({
          project_id: project.id,
          name: template.name ?? 'Main Diagram',
          nodes: template.nodes ?? [],
          edges: template.edges ?? [],
        })

        if (diagramError) {
          log.error('Failed to create initial diagram from template', diagramError, {
            projectId: project.id,
            templateId: body.templateId,
          })
          // Non-fatal — project was created, diagram creation failed
        } else {
          log.info('Initial diagram created from template', {
            projectId: project.id,
            templateId: body.templateId,
          })
        }
      }
    }

    return NextResponse.json(project, { status: 201 })
  },
  {
    requireAuth: true,
    validateBody: createProjectSchema,
    method: 'POST',
  }
)
