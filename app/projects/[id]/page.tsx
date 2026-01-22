'use client'
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, Connection, Node, Edge, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Boxes, ArrowLeft } from 'lucide-react'
import { COMPONENT_CATALOG } from '@/lib/catalog'
import { ComponentPalette } from '@/components/diagram/component-palette'
import { CustomNode } from '@/components/diagram/custom-nodes'
import { DiagramToolbar } from '@/components/diagram/toolbar'
import { CostSidebar } from '@/components/diagram/cost-sidebar'
import { calculateInfrastructureCost } from '@/lib/cost-calculator'
import { useToast } from '@/hooks/use-toast'

const nodeTypes = { custom: CustomNode }
let nodeId = 0

function DiagramCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [project, setProject] = useState<any>(null)
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load project details
    fetch(`/api/projects/${projectId}`).then(res => res.json()).then(setProject)

    // Load last saved diagram for this project
    fetch(`/api/diagrams?project_id=${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const lastDiagram = data[0] // Most recent diagram
          if (lastDiagram.data?.nodes) setNodes(lastDiagram.data.nodes)
          if (lastDiagram.data?.edges) setEdges(lastDiagram.data.edges)
          toast({ title: 'Diagram Loaded', description: `Loaded ${lastDiagram.data?.nodes?.length || 0} components` })
        }
      })
      .catch(err => console.error('Failed to load diagram:', err))
  }, [projectId, setNodes, setEdges, toast])


  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const componentData = event.dataTransfer.getData('application/reactflow')
    if (!componentData) return

    const component = JSON.parse(componentData)
    const position = { x: event.clientX - 200, y: event.clientY - 100 }

    const newNode: Node = {
      id: `node-${nodeId++}`,
      type: 'custom',
      position,
      data: { label: component.name, componentId: component.id }
    }

    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  const handleSave = async () => {
    const res = await fetch('/api/diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, name: 'Main Diagram', data: { nodes, edges } })
    })
    if (res.ok) {
      toast({ title: 'Saved', description: 'Diagram saved successfully' })
    }
  }

  const handleGenerateCode = async () => {
    const res = await fetch('/api/generate/terraform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges })
    })
    if (res.ok) {
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data.files, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'terraform-code.json'
      a.click()
      toast({ title: 'Generated', description: 'Terraform code generated' })
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.json'
    a.click()
  }

  const costData = calculateInfrastructureCost(nodes)

  return (
    <div className="h-screen flex flex-col">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Button></Link>
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{project?.name || 'Project'}</span>
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
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
          <DiagramToolbar
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView()}
            onSave={handleSave}
            onExport={handleExport}
            onGenerateCode={handleGenerateCode}
          />
        </div>
        <CostSidebar costData={costData} />
      </div>
    </div>
  )
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <ReactFlowProvider>
      <DiagramCanvas projectId={id} />
    </ReactFlowProvider>
  )
}
