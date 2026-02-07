import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST — restore a specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Get the version
    const { data: version, error: versionError } = await supabase
      .from('diagram_versions')
      .select('diagram_id, nodes, edges, viewport')
      .eq('id', id)
      .single()

    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Update the diagram with the version's state
    const { error: updateError } = await supabase
      .from('diagrams')
      .update({
        nodes: version.nodes,
        edges: version.edges,
        viewport: version.viewport,
      })
      .eq('id', version.diagram_id)

    if (updateError) throw updateError

    return NextResponse.json({ message: 'Version restored', diagram_id: version.diagram_id })
  } catch (error) {
    console.error('Restore version error:', error)
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 })
  }
}
