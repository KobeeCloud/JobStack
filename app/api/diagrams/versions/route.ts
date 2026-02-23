import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'
import { log } from '@/lib/logger'

const MAX_RETRIES = 3

// GET — list versions for a diagram
export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const diagramId = searchParams.get('diagramId')
    if (!diagramId) {
      throw new ApiError(400, 'diagramId is required', 'MISSING_DIAGRAM_ID')
    }

    const parsedId = uuidSchema.parse(diagramId)

    // Verify access to the diagram's project (RLS handles org membership)
    const { data: diagram } = await auth.supabase
      .from('diagrams')
      .select('id, project_id')
      .eq('id', parsedId)
      .single()

    if (!diagram) {
      throw new ApiError(404, 'Diagram not found', 'DIAGRAM_NOT_FOUND')
    }

    const { data: versions, error } = await auth.supabase
      .from('diagram_versions')
      .select('id, version_number, message, created_by, created_at')
      .eq('diagram_id', parsedId)
      .order('version_number', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(versions || [])
  },
  { requireAuth: true, method: 'GET' }
)

// POST — create a new version (atomic version numbering with retry on conflict)
export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const { diagramId, message } = body

    if (!diagramId) {
      throw new ApiError(400, 'diagramId is required', 'MISSING_DIAGRAM_ID')
    }

    const parsedId = uuidSchema.parse(diagramId)

    // Get current diagram state (RLS verifies access)
    const { data: diagram, error: diagramError } = await auth.supabase
      .from('diagrams')
      .select('nodes, edges, viewport')
      .eq('id', parsedId)
      .single()

    if (diagramError || !diagram) {
      throw new ApiError(404, 'Diagram not found', 'DIAGRAM_NOT_FOUND')
    }

    // HIGH-005: Retry loop to handle TOCTOU race on version_number
    let lastError: unknown = null
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data: latest } = await auth.supabase
        .from('diagram_versions')
        .select('version_number')
        .eq('diagram_id', parsedId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (latest?.version_number || 0) + 1

      const { data: version, error: insertError } = await auth.supabase
        .from('diagram_versions')
        .insert({
          diagram_id: parsedId,
          version_number: nextVersion,
          message: message || `Version ${nextVersion}`,
          nodes: diagram.nodes,
          edges: diagram.edges,
          viewport: diagram.viewport,
          created_by: auth.user.id,
        })
        .select()
        .single()

      if (!insertError) {
        log.info('Diagram version created', { diagramId: parsedId, version: nextVersion, userId: auth.user.id })
        return NextResponse.json(version, { status: 201 })
      }

      // 23505 = unique_violation — another request won the race
      if (insertError.code === '23505') {
        lastError = insertError
        continue
      }

      // Any other error — don't retry
      throw insertError
    }

    log.error('Version creation failed after retries', lastError, { diagramId: parsedId })
    throw new ApiError(409, 'Failed to create version — concurrent conflict. Please retry.', 'VERSION_CONFLICT')
  },
  { requireAuth: true, method: 'POST' }
)
