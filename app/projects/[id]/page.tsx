'use client'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Boxes, ArrowLeft, Loader2 } from 'lucide-react'
import { COMPONENT_CATALOG, getComponentById } from '@/lib/catalog'
import { ComponentPalette } from '@/components/diagram/component-palette'
import { CustomNode } from '@/components/diagram/custom-nodes'
import { DiagramToolbar } from '@/components/diagram/toolbar'
import { CostSidebar } from '@/components/diagram/cost-sidebar'
import { calculateInfrastructureCost } from '@/lib/cost-calculator'
import { useToast } from '@/hooks/use-toast'
import { ErrorBoundary } from '@/components/error-boundary'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

const nodeTypes = { custom: CustomNode }
let nodeId = 0

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
}

interface Diagram {
  id: string
  name: string
  data: {
    nodes: Node[]
    edges: Edge[]
  }
  updated_at: string
}

function DiagramCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [diagramId, setDiagramId] = useState<string | null>(null)
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const router = useRouter()
  const { toast } = useToast()
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Load project and diagram
  useEffect(() => {
    if (!projectId) {
      toast({ title: 'Error', description: 'Project ID is missing' });
      router.push('/dashboard');
      return;
    }
    let cancelled = false

    async function loadData() {
      try {
        setLoading(true)

        // Load project
        const projectRes = await fetchWithTimeout(`/api/projects/${projectId}`, {}, 10000)
        if (!projectRes.ok) {
          if (projectRes.status === 404) {
            toast({ title: 'Project not found', description: 'This project does not exist' })
            router.push('/dashboard')
            return
          }
          throw new Error('Failed to load project')
        }
        const projectData = await projectRes.json()
        if (!cancelled) setProject(projectData.data || projectData)

        // Load diagram
        const diagramRes = await fetchWithTimeout(`/api/diagrams?project_id=${projectId}&limit=1`, {}, 10000)
        if (!diagramRes.ok) throw new Error('Failed to load diagram')
        const diagramData = await diagramRes.json()
        const diagrams = diagramData.data || diagramData

        if (!cancelled && diagrams.length > 0) {
          const lastDiagram: Diagram = diagrams[0]
          setDiagramId(lastDiagram.id)
          if (lastDiagram.data?.nodes) setNodes(lastDiagram.data.nodes)
          if (lastDiagram.data?.edges) setEdges(lastDiagram.data.edges)
          setLastSaved(new Date(lastDiagram.updated_at))
          toast({
            title: 'Diagram Loaded',
            description: `Loaded ${lastDiagram.data?.nodes?.length || 0} components`,
          })
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load project',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]) // Only re-run when projectId changes

  // Auto-save every 30 seconds
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return

    const saveDiagram = async () => {
      if (!hasUnsavedChanges.current) return

      try {
        setSaving(true)
        hasUnsavedChanges.current = false

        const payload = {
          project_id: projectId,
          name: 'Main Diagram',
          data: { nodes, edges },
        }

        const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams'
        const method = diagramId ? 'PUT' : 'POST'

        const res = await fetchWithTimeout(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }, 10000)

        if (res.ok) {
          const data = await res.json()
          if (data.id && !diagramId) setDiagramId(data.id)
          setLastSaved(new Date())
        } else {
          hasUnsavedChanges.current = true // Retry on next interval
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to save')
        }
      } catch (error) {
        hasUnsavedChanges.current = true
        console.error('Auto-save failed:', error)
      } finally {
        setSaving(false)
      }
    }

    saveTimerRef.current = setInterval(saveDiagram, 30000)

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    }
  }, [nodes, edges, projectId, diagramId])

  // Mark as changed when nodes/edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      hasUnsavedChanges.current = true
    }
  }, [nodes, edges])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current && (nodes.length > 0 || edges.length > 0)) {
        // Final save attempt
        fetch('/api/diagrams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            name: 'Main Diagram',
            data: { nodes, edges },
          }),
        }).catch(() => {
          // Ignore errors on unmount
        })
      }
    }
  }, [nodes, edges, projectId])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const componentData = event.dataTransfer.getData('application/reactflow')
      if (!componentData) return

      try {
        const component = JSON.parse(componentData)
        const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect()

        // Get the current viewport/transform to calculate correct position
        const reactFlowInstance = document.querySelector('.react-flow__viewport')
        const transform = reactFlowInstance ?
          window.getComputedStyle(reactFlowInstance).transform : 'matrix(1, 0, 0, 1, 0, 0)'

        // Parse transform matrix to get zoom and pan
        let zoom = 1, panX = 0, panY = 0
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix\(([^)]+)\)/)
          if (matrix) {
            const values = matrix[1].split(', ').map(Number)
            zoom = values[0] || 1
            panX = values[4] || 0
            panY = values[5] || 0
          }
        }

        // Calculate position accounting for zoom and pan
        const position = {
          x: (event.clientX - reactFlowBounds.left - panX) / zoom,
          y: (event.clientY - reactFlowBounds.top - panY) / zoom,
        }

        // Snap to grid (20px grid)
        const snappedPosition = {
          x: Math.round(position.x / 20) * 20,
          y: Math.round(position.y / 20) * 20,
        }

        const newNode: Node = {
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'custom',
          position: snappedPosition,
          data: {
            label: component.name,
            componentId: component.id,
            provider: component.provider,
            category: component.category,
          },
        }

        setNodes((nds) => [...nds, newNode])
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add component',
        })
      }
    },
    [setNodes, toast]
  )

  const handleSave = async () => {
    try {
      setSaving(true)
      hasUnsavedChanges.current = false

      const payload = {
        project_id: projectId,
        name: 'Main Diagram',
        data: { nodes, edges },
      }

      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams'
      const method = diagramId ? 'PUT' : 'POST'

      const res = await fetchWithTimeout(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 10000)

      if (res.ok) {
        const data = await res.json()
        if (data.id && !diagramId) setDiagramId(data.id)
        setLastSaved(new Date())
        toast({ title: 'Saved', description: 'Diagram saved successfully' })
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      hasUnsavedChanges.current = true
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save diagram',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateCode = async () => {
    try {
      const res = await fetchWithTimeout(
        '/api/generate/terraform',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges, diagram_id: diagramId }),
        },
        30000
      )

      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data.files, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'terraform-code.json'
        a.click()
        URL.revokeObjectURL(url)
        toast({ title: 'Generated', description: 'Terraform code generated' })
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate code')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate Terraform code',
      })
    }
  }

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'diagram.json'
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Exported', description: 'Diagram exported successfully' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export diagram',
      })
    }
  }

  const costData = calculateInfrastructureCost(nodes)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{project?.name || 'Project'}</span>
          </div>
          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !saving && (
              <div className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="flex-1 flex">
        <ComponentPalette
          components={COMPONENT_CATALOG}
          onDragStart={(e, component) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('application/reactflow', JSON.stringify(component))
          }}
        />
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            snapGrid={[20, 20]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode={['Control', 'Meta']}
          >
            <Background gap={20} size={1} color="#e5e7eb" />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                const component = node.data?.componentId ? getComponentById(node.data.componentId as string) : null
                return component?.color || '#6366f1'
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
          <DiagramToolbar
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView()}
            onSave={handleSave}
            onExport={handleExport}
            onGenerateCode={handleGenerateCode}
            onExportImage={async (format: 'png' | 'svg') => {
              try {
                const { toPng, toSvg } = await import('html-to-image')
                const element = document.querySelector('.react-flow') as HTMLElement
                if (!element) return

                const dataUrl =
                  format === 'png' ? await toPng(element) : await toSvg(element)

                const a = document.createElement('a')
                a.href = dataUrl
                a.download = `diagram.${format}`
                a.click()
                toast({ title: 'Exported', description: `Diagram exported as ${format.toUpperCase()}` })
              } catch (error) {
                toast({
                  title: 'Error',
                  description: `Failed to export as ${format.toUpperCase()}`,
                })
              }
            }}
          />
        </div>
        <CostSidebar costData={costData} />
      </div>
    </div>
  )
}

// Next.js page component - params is now a Promise in Next.js 15+
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProjectPage({ params }: PageProps) {
  const resolvedParams = use(params)
  console.log('ProjectPage params:', resolvedParams);
  return (
    <ReactFlowProvider>
      <ErrorBoundary>
        <DiagramCanvas projectId={resolvedParams.id} />
      </ErrorBoundary>
    </ReactFlowProvider>
  )
}
