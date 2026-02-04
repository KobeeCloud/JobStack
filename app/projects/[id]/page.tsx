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
import { CustomNode, ContainerNode, isValidConnection, getComponentCategory } from '@/components/diagram/custom-nodes'
import { DiagramToolbar } from '@/components/diagram/toolbar'
import { DiagramSearch } from '@/components/diagram/diagram-search'
import { CostSidebar } from '@/components/diagram/cost-sidebar'
import { NodeConfigPanel } from '@/components/diagram/node-config-panel'
import { calculateInfrastructureCost } from '@/lib/cost-calculator'
import { useToast } from '@/hooks/use-toast'
import { useHistory } from '@/hooks/use-history'
import { ErrorBoundary } from '@/components/error-boundary'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { CloudProvider, ServiceType } from '@/lib/catalog'
import type { NodeConfig } from '@/lib/node-config-schemas'
import { createClient } from '@/lib/supabase/client'
import { AIAssistantPanel } from '@/components/ai/ai-assistant-panel'
import { ComplianceReportPanel } from '@/components/compliance/compliance-report-panel'
import { TestResultsPanel } from '@/components/testing/test-results-panel'
import { MultiCloudComparePanel } from '@/components/multi-cloud/multi-cloud-compare-panel'
import { analyzeArchitecture } from '@/lib/ai/architecture-analyzer'
import { runComplianceScan } from '@/lib/compliance/compliance-scanner'
import { testDiagram } from '@/lib/testing/infrastructure-tester'
import type { ArchitectureIssue } from '@/lib/ai/architecture-analyzer'
import type { ComplianceReport } from '@/lib/compliance/compliance-scanner'
import type { InfrastructureTest } from '@/lib/testing/infrastructure-tester'

const nodeTypes = { custom: CustomNode, container: ContainerNode }

// Container component IDs that should use ContainerNode
const CONTAINER_COMPONENTS = [
  'azure-vnet', 'azure-subnet',
  'aws-vpc', 'aws-subnet',
  'gcp-vpc', 'gcp-subnet',
]

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  cloud_provider?: CloudProvider
  settings?: {
    project_types?: ServiceType[]
  }
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)

  // Feature panels state
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiIssues, setAiIssues] = useState<ArchitectureIssue[]>([])
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  const [compliancePanelOpen, setCompliancePanelOpen] = useState(false)
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null)
  const [complianceScanning, setComplianceScanning] = useState(false)

  const [testingPanelOpen, setTestingPanelOpen] = useState(false)
  const [testResults, setTestResults] = useState<InfrastructureTest[] | null>(null)
  const [testing, setTesting] = useState(false)

  const [multiCloudPanelOpen, setMultiCloudPanelOpen] = useState(false)
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)

  const { zoomIn, zoomOut, fitView, screenToFlowPosition, getNodes, setCenter } = useReactFlow()
  const router = useRouter()
  const { toast } = useToast()
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  // History for undo/redo
  const { canUndo, canRedo, undo, redo, pushState } = useHistory()
  const isUndoRedoAction = useRef(false)

  // Push state to history when nodes/edges change (but not during undo/redo)
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }
    if (nodes.length > 0 || edges.length > 0) {
      pushState(nodes, edges)
    }
  }, [nodes, edges, pushState])

  // Undo handler
  const handleUndo = useCallback(() => {
    const state = undo()
    if (state) {
      isUndoRedoAction.current = true
      setNodes(state.nodes)
      setEdges(state.edges)
      toast({ title: 'Undo', description: 'Restored previous state' })
    }
  }, [undo, setNodes, setEdges, toast])

  // Redo handler
  const handleRedo = useCallback(() => {
    const state = redo()
    if (state) {
      isUndoRedoAction.current = true
      setNodes(state.nodes)
      setEdges(state.edges)
      toast({ title: 'Redo', description: 'Restored next state' })
    }
  }, [redo, setNodes, setEdges, toast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + S - Save
      if (modKey && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }

      // Ctrl/Cmd + Z - Undo
      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
      if ((modKey && e.key === 'y') || (modKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        handleRedo()
        return
      }

      // Ctrl/Cmd + D - Duplicate selected nodes
      if (modKey && e.key === 'd') {
        e.preventDefault()
        const selectedNodes = nodes.filter(n => n.selected)
        if (selectedNodes.length > 0) {
          const newNodes = selectedNodes.map((node, idx) => ({
            ...node,
            id: `node-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
            position: {
              x: node.position.x + 30,
              y: node.position.y + 30,
            },
            selected: false,
          }))
          setNodes(nds => [...nds, ...newNodes])
          toast({ title: 'Duplicated', description: `${newNodes.length} node(s) duplicated` })
        }
        return
      }

      // Ctrl/Cmd + A - Select all
      if (modKey && e.key === 'a') {
        e.preventDefault()
        setNodes(nds => nds.map(n => ({ ...n, selected: true })))
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, setNodes, handleUndo, handleRedo, toast])

  // Fit view to a specific node
  const handleFitNode = useCallback((nodeId: string) => {
    const node = getNodes().find(n => n.id === nodeId)
    if (node) {
      const x = node.position.x + ((node.measured?.width || 150) / 2)
      const y = node.position.y + ((node.measured?.height || 60) / 2)
      setCenter(x, y, { zoom: 1.5, duration: 500 })
      // Also select the node
      setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })))
    }
  }, [getNodes, setCenter, setNodes])

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

  // Realtime collaboration
  useEffect(() => {
    if (!diagramId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`diagram:${diagramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diagrams',
          filter: `id=eq.${diagramId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            const updatedDiagram = payload.new as Diagram
            if (updatedDiagram.data?.nodes) {
              setNodes(updatedDiagram.data.nodes)
            }
            if (updatedDiagram.data?.edges) {
              setEdges(updatedDiagram.data.edges)
            }
            toast({
              title: 'Diagram Updated',
              description: 'Changes from another user',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [diagramId, setNodes, setEdges, toast])

  // Handle configure node event from custom nodes
  useEffect(() => {
    const handleConfigureNode = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>
      const { nodeId } = customEvent.detail
      // Use getNodes() to always get current nodes state
      const currentNodes = getNodes()
      const node = currentNodes.find((n) => n.id === nodeId)
      if (node) {
        setSelectedNode(node)
        setConfigPanelOpen(true)
      }
    }

    window.addEventListener('configure-node', handleConfigureNode)
    return () => window.removeEventListener('configure-node', handleConfigureNode)
  }, [getNodes])

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
      // Validate connection based on component categories
      if (params.source && params.target) {
        const currentNodes = getNodes()
        const sourceNode = currentNodes.find(n => n.id === params.source)
        const targetNode = currentNodes.find(n => n.id === params.target)

        if (sourceNode && targetNode) {
          const sourceComponentId = (sourceNode.data as any).componentId || (sourceNode.data as any).component || ''
          const targetComponentId = (targetNode.data as any).componentId || (targetNode.data as any).component || ''

          if (sourceComponentId && targetComponentId && !isValidConnection(sourceComponentId, targetComponentId)) {
            const sourceCategory = getComponentCategory(sourceComponentId)
            const targetCategory = getComponentCategory(targetComponentId)
            toast({
              title: 'Invalid Connection',
              description: `${sourceCategory} components typically cannot connect directly to ${targetCategory} components`,
              variant: 'destructive'
            })
            return // Don't create the connection
          }
        }
      }

      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, getNodes, toast]
  )

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setConfigPanelOpen(true)
  }, [])

  const handleConfigUpdate = useCallback((nodeId: string, config: NodeConfig) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    )
    setConfigPanelOpen(false)
    setSelectedNode(null)
  }, [setNodes])

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

        // Use ReactFlow's API to convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        // Snap to grid (20px grid)
        const snappedPosition = {
          x: Math.round(position.x / 20) * 20,
          y: Math.round(position.y / 20) * 20,
        }

        // Check if this is a container component (VNet, Subnet, VPC)
        const isContainer = CONTAINER_COMPONENTS.includes(component.id)

        // Check if dropped inside a container node
        let parentId: string | undefined
        let relativePosition = snappedPosition

        if (!isContainer) {
          // Find container node at drop position
          const currentNodes = nodes
          const containerNode = currentNodes.find(node => {
            if (node.type !== 'container') return false

            const nodeX = node.position.x
            const nodeY = node.position.y
            const nodeWidth = (node.style?.width as number) || (node.measured?.width as number) || 300
            const nodeHeight = (node.style?.height as number) || (node.measured?.height as number) || 200

            return (
              snappedPosition.x >= nodeX &&
              snappedPosition.x <= nodeX + nodeWidth &&
              snappedPosition.y >= nodeY &&
              snappedPosition.y <= nodeY + nodeHeight
            )
          })

          if (containerNode) {
            parentId = containerNode.id
            // Calculate position relative to container
            relativePosition = {
              x: snappedPosition.x - containerNode.position.x,
              y: snappedPosition.y - containerNode.position.y,
            }
          }
        }

        const newNode: Node = {
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: isContainer ? 'container' : 'custom',
          position: relativePosition,
          parentId,
          extent: parentId ? 'parent' : undefined,
          expandParent: parentId ? true : undefined,
          data: {
            label: component.name,
            componentId: component.id,
            provider: component.provider,
            category: component.category,
          },
          ...(isContainer && {
            style: {
              width: 400,
              height: 300,
            },
          }),
        }

        setNodes((nds) => [...nds, newNode])
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to add component',
        })
      }
    },
    [setNodes, toast, screenToFlowPosition, nodes]
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
    if (nodes.length === 0) {
      toast({
        title: 'No Components',
        description: 'Add cloud components (AWS, Azure, GCP) to generate Terraform code.',
        variant: 'destructive'
      })
      return
    }

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

      const data = await res.json()

      if (!res.ok || !data.success) {
        // Show detailed error with list of problems
        const errorMessage = data.error || 'Failed to generate Terraform'
        const warnings = data.warnings || []

        toast({
          title: 'Cannot Generate Terraform',
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
              {warnings.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p>Warnings:</p>
                  <ul className="list-disc list-inside">
                    {warnings.slice(0, 3).map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                    {warnings.length > 3 && <li>...and {warnings.length - 3} more</li>}
                  </ul>
                </div>
              )}
            </div>
          ) as any,
          variant: 'destructive',
        })
        return
      }

      // Success - download the files
      const blob = new Blob([JSON.stringify(data.files, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'terraform-code.json'
      a.click()
      URL.revokeObjectURL(url)

      const successMessage = data.skippedCount > 0
        ? `Generated ${data.files.length} files (${data.skippedCount} components skipped)`
        : `Generated ${data.files.length} Terraform files`

      toast({
        title: 'Terraform Generated',
        description: successMessage
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate Terraform code',
        variant: 'destructive'
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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to export diagram',
      })
    }
  }

  // AI Analysis
  const handleAIAnalysis = async () => {
    if (nodes.length === 0) {
      toast({ title: 'No components', description: 'Add components to analyze' })
      return
    }

    try {
      setAiAnalyzing(true)
      setAiPanelOpen(true)
      const issues = await analyzeArchitecture(nodes, edges)
      setAiIssues(issues)
      toast({
        title: 'Analysis Complete',
        description: `Found ${issues.length} recommendations`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze architecture',
      })
    } finally {
      setAiAnalyzing(false)
    }
  }

  // Compliance Scanning
  const handleComplianceScan = async (framework: 'cis' | 'gdpr' | 'soc2' | 'pci-dss' | 'hipaa') => {
    if (nodes.length === 0) {
      toast({ title: 'No components', description: 'Add components to scan' })
      return
    }

    try {
      setComplianceScanning(true)
      const frameworkMap = {
        'cis': 'CIS',
        'gdpr': 'GDPR',
        'soc2': 'SOC2',
        'pci-dss': 'PCI-DSS',
        'hipaa': 'HIPAA',
      } as const

      const report = await runComplianceScan(nodes, edges, frameworkMap[framework])
      setComplianceReport(report)
      toast({
        title: 'Scan Complete',
        description: `Score: ${report.score}% - ${report.findings.length} findings`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run compliance scan',
      })
    } finally {
      setComplianceScanning(false)
    }
  }

  // Infrastructure Testing
  const handleRunTests = async () => {
    if (nodes.length === 0) {
      toast({ title: 'No components', description: 'Add components to test' })
      return
    }

    try {
      setTesting(true)
      setTestingPanelOpen(true)
      const results = await testDiagram(nodes, edges)
      setTestResults(results)
      const passed = results.filter(r => r.status === 'pass').length
      toast({
        title: 'Tests Complete',
        description: `${passed}/${results.length} tests passed`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run tests',
      })
    } finally {
      setTesting(false)
    }
  }

  // Multi-Cloud Component Selection
  const handleSelectMultiCloudComponent = useCallback((
    genericId: string,
    provider: 'aws' | 'azure' | 'gcp'
  ) => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const snappedPosition = {
      x: Math.round(position.x / 20) * 20,
      y: Math.round(position.y / 20) * 20,
    }

    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      position: snappedPosition,
      data: {
        label: `${genericId} (${provider})`,
        componentId: genericId,
        provider,
        category: 'compute',
      },
    }

    setNodes((nds) => [...nds, newNode])
    toast({ title: 'Component Added', description: `Added ${provider.toUpperCase()} component` })
  }, [screenToFlowPosition, setNodes, toast])

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
    <div className="h-screen flex flex-col overflow-hidden">
      <nav className="border-b flex-shrink-0">
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ComponentPalette
          components={COMPONENT_CATALOG}
          cloudProvider={project?.cloud_provider}
          projectTypes={project?.settings?.project_types}
          onDragStart={(e, component) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('application/reactflow', JSON.stringify(component))
          }}
        />
        <div className="flex-1 relative overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            snapGrid={[20, 20]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode={['Control', 'Meta']}
            panOnDrag={[1, 2]}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            selectNodesOnDrag={true}
            elementsSelectable={true}
            nodesConnectable={true}
            nodesDraggable={true}
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

          {/* Search Component */}
          <DiagramSearch
            nodes={nodes}
            onHighlightNode={setHighlightedNodeId}
            onFitNode={handleFitNode}
          />

          <DiagramToolbar
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView()}
            onSave={handleSave}
            onExport={handleExport}
            onGenerateCode={handleGenerateCode}
            onAIAnalysis={handleAIAnalysis}
            onComplianceScan={() => setCompliancePanelOpen(true)}
            onRunTests={handleRunTests}
            onMultiCloud={() => setMultiCloudPanelOpen(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            aiAnalyzing={aiAnalyzing}
            complianceScanning={complianceScanning}
            testing={testing}
            saving={saving}
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
              } catch {
                toast({
                  title: 'Error',
                  description: `Failed to export as ${format.toUpperCase()}`,
                })
              }
            }}
          />
        </div>
        <CostSidebar costData={costData} />

        {/* AI Assistant Panel */}
        {aiPanelOpen && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiPanelOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <AIAssistantPanel
                issues={aiIssues}
                isAnalyzing={aiAnalyzing}
              />
            </div>
          </div>
        )}

        {/* Compliance Panel */}
        {compliancePanelOpen && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Compliance Scanning</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompliancePanelOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <ComplianceReportPanel
                report={complianceReport}
                onRunScan={handleComplianceScan}
                isScanning={complianceScanning}
              />
            </div>
          </div>
        )}

        {/* Testing Panel */}
        {testingPanelOpen && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Infrastructure Testing</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestingPanelOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <TestResultsPanel
                results={testResults}
                onRunTests={handleRunTests}
                isTesting={testing}
              />
            </div>
          </div>
        )}

        {/* Multi-Cloud Panel */}
        {multiCloudPanelOpen && (
          <div className="absolute left-80 top-20 w-[500px] h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Multi-Cloud Components</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMultiCloudPanelOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <MultiCloudComparePanel onSelectComponent={handleSelectMultiCloudComponent} />
            </div>
          </div>
        )}

        {configPanelOpen && selectedNode && (
          <NodeConfigPanel
            key={selectedNode.id} // Force reset when node changes
            node={selectedNode}
            onClose={() => {
              setConfigPanelOpen(false)
              setSelectedNode(null)
            }}
            onUpdate={handleConfigUpdate}
          />
        )}
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
  return (
    <ReactFlowProvider>
      <ErrorBoundary>
        <DiagramCanvas projectId={resolvedParams.id} />
      </ErrorBoundary>
    </ReactFlowProvider>
  )
}
