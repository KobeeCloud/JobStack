import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'
import { log } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST — restore a specific version (MEDIUM-008: proper access verification)
export const POST = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing version ID', 'MISSING_PARAMS')

    const versionId = uuidSchema.parse(params.id)

    // Get the version
    const { data: version, error: versionError } = await auth.supabase
      .from('diagram_versions')
      .select('diagram_id, nodes, edges, viewport')
      .eq('id', versionId)
      .single()

    if (versionError || !version) {
      throw new ApiError(404, 'Version not found', 'VERSION_NOT_FOUND')
    }

    // Verify the user has access to the diagram (RLS on diagrams checks ownership/org membership)
    const { data: diagram } = await auth.supabase
      .from('diagrams')
      .select('id')
      .eq('id', version.diagram_id)
      .single()

    if (!diagram) {
      throw new ApiError(403, 'You do not have access to this diagram', 'FORBIDDEN')
    }

    // Update the diagram with the version's state
    const { error: updateError } = await auth.supabase
      .from('diagrams')
      .update({
        nodes: version.nodes,
        edges: version.edges,
        viewport: version.viewport,
      })
      .eq('id', version.diagram_id)

    if (updateError) {
      log.error('Failed to restore version', updateError, { versionId, diagramId: version.diagram_id })
      throw updateError
    }

    log.info('Version restored', { versionId, diagramId: version.diagram_id, userId: auth.user.id })
    return NextResponse.json({ message: 'Version restored', diagram_id: version.diagram_id })
  },
  { requireAuth: true, method: 'POST' }
)
