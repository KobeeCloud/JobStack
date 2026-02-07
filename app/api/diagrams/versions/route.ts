import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — list versions for a diagram
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const diagramId = searchParams.get('diagramId')
    if (!diagramId) {
      return NextResponse.json({ error: 'diagramId is required' }, { status: 400 })
    }

    const { data: versions, error } = await supabase
      .from('diagram_versions')
      .select('id, version_number, message, created_by, created_at')
      .eq('diagram_id', diagramId)
      .order('version_number', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(versions || [])
  } catch (error) {
    console.error('List versions error:', error)
    return NextResponse.json({ error: 'Failed to list versions' }, { status: 500 })
  }
}

// POST — create a new version
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { diagramId, message } = await request.json()

    if (!diagramId) {
      return NextResponse.json({ error: 'diagramId is required' }, { status: 400 })
    }

    // Get current diagram state
    const { data: diagram, error: diagramError } = await supabase
      .from('diagrams')
      .select('nodes, edges, viewport')
      .eq('id', diagramId)
      .single()

    if (diagramError || !diagram) {
      return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    // Get the latest version number
    const { data: latest } = await supabase
      .from('diagram_versions')
      .select('version_number')
      .eq('diagram_id', diagramId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (latest?.version_number || 0) + 1

    const { data: version, error: insertError } = await supabase
      .from('diagram_versions')
      .insert({
        diagram_id: diagramId,
        version_number: nextVersion,
        message: message || `Version ${nextVersion}`,
        nodes: diagram.nodes,
        edges: diagram.edges,
        viewport: diagram.viewport,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Create version error:', error)
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })
  }
}
