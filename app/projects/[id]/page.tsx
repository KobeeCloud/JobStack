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
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { useDiagramStore } from '@/lib/store/diagram-store'
import { COMPONENT_CATALOG, getComponentById } from '@/lib/catalog'
import { ComponentPalette } from '@/components/diagram/component-palette'
import { MobileWarningOverlay } from '@/components/diagram/mobile-warning'
import {
  CustomNode,
  ContainerNode,
  AttachmentNode,
  getConnectionError,
  getEdgeType,
  CONTAINER_HIERARCHY,
} from '@/components/diagram/custom-nodes'
import { DiagramToolbar } from '@/components/diagram/toolbar'
import { DiagramSearch } from '@/components/diagram/diagram-search'
import { CostSidebar } from '@/components/diagram/cost-sidebar'
import { NodeConfigPanel } from '@/components/diagram/node-config-panel'
import { toast } from 'sonner'
import { useHistory } from '@/hooks/use-history'
import { ErrorBoundary } from '@/components/error-boundary'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { CloudProvider, ServiceType } from '@/lib/catalog'
import { createClient } from '@/lib/supabase/client'
import { AIAssistantPanel } from '@/components/ai/ai-assistant-panel'
import { ComplianceReportPanel } from '@/components/compliance/compliance-report-panel'
import { TestResultsPanel } from '@/components/testing/test-results-panel'
import { MultiCloudComparePanel } from '@/components/multi-cloud/multi-cloud-compare-panel'
import { CustomComponentPanel } from '@/components/custom/custom-component-panel'
import { ProjectShareDialog } from '@/components/project-share-dialog'
import { TemplateDialog } from '@/components/diagram/template-dialog'
import { analyzeArchitecture } from '@/lib/ai/architecture-analyzer'
import { runComplianceScan } from '@/lib/compliance/compliance-scanner'
import { testDiagram } from '@/lib/testing/infrastructure-tester'
import { LabeledEdge } from '@/components/diagram/labeled-edge'
import { CodePreviewDialog } from '@/components/diagram/code-preview-dialog'
import { K8sWizard } from '@/components/diagram/k8s-wizard'
import { GovernanceWizard } from '@/components/diagram/governance-wizard'
import { QuickBuildModal } from '@/components/diagram/quick-build-modal'
import { getLayoutedElements } from '@/lib/auto-layout'
import { Terminal } from '@/components/diagram/terminal'
import { MultiRegionSelector } from '@/components/regions/multi-region-selector'
import { RelativeTime } from '@/components/relative-time'

const nodeTypes = { custom: CustomNode, container: ContainerNode, attachment: AttachmentNode }
const edgeTypes = { default: LabeledEdge }

// Container component IDs that should use ContainerNode type
// Derived from CONTAINER_HIERARCHY keys so it stays in sync
const CONTAINER_COMPONENTS = Object.keys(CONTAINER_HIERARCHY)

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  cloud_provider?: CloudProvider
  organization_id?: string | null
  settings?: {
    project_types?: ServiceType[]
    environment?: string
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
  // Local state for things that only belong to this component
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Connect to Zustand store
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    diagramId,
    setDiagramId,
    selectedNode,
    setSelectedNode,
    configPanelOpen: _configPanelOpen,
    setConfigPanelOpen,
    activePanel,
    setActivePanel,
    aiIssues,
    setAiIssues,
    aiAnalyzing,
    setAiAnalyzing,
    complianceReport,
    setComplianceReport,
    complianceScanning,
    setComplianceScanning,
    testing,
    setTesting,
    testResults,
    setTestResults,
    highlightedNodeId: _highlightedNodeId,
    setHighlightedNodeId,
    templateDialogOpen,
    setTemplateDialogOpen,
    showK8sWizard,
    setShowK8sWizard,
    showGovernanceWizard,
    setShowGovernanceWizard,
    showQuickBuild,
    setShowQuickBuild,
    terraformDirty: _terraformDirty,
    setTerraformDirty,
    codePreviewOpen,
    setCodePreviewOpen,
    codePreviewFiles,
    setCodePreviewFiles,
    codePreviewTitle,
    setCodePreviewTitle,
    codePreviewZipName,
    setCodePreviewZipName,
  } = useDiagramStore()

  const { zoomIn, zoomOut, fitView, screenToFlowPosition, getNodes, setCenter } = useReactFlow()
  const router = useRouter()
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)
  // FIX BUG#3: track diagramId in a ref so save-on-unmount cleanup gets fresh value
  const diagramIdRef = useRef<string | null>(null)
  // FIX BUG#4: store latest handleSave to avoid stale closure in keyboard shortcut effect
  const handleSaveRef = useRef<() => Promise<void>>(() => Promise.resolve())
  // Track when WE last saved so realtime listener can distinguish our save from others
  const lastLocalSaveAt = useRef<number>(0)
  // Cursor presence
  const currentUserNameRef = useRef<string>('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const presenceChannelRef = useRef<any>(null)
  const lastCursorBroadcast = useRef<number>(0)
  const [peerCursors, setPeerCursors] = useState<
    Record<string, { user_name: string; x: number; y: number }>
  >({})
  const [showTerminal, setShowTerminal] = useState(false)
  const [showMultiRegion, setShowMultiRegion] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['aws-us-east-1'])
  const [primaryRegion, setPrimaryRegion] = useState<string>('aws-us-east-1')

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
      toast.success('Undo', { description: 'Restored previous state' })
    }
  }, [undo, setNodes, setEdges, toast])

  // Redo handler
  const handleRedo = useCallback(() => {
    const state = redo()
    if (state) {
      isUndoRedoAction.current = true
      setNodes(state.nodes)
      setEdges(state.edges)
      toast.success('Redo', { description: 'Restored next state' })
    }
  }, [redo, setNodes, setEdges, toast])

  // AI Analysis
  const analyzeDiagram = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[]) => {
      if (currentNodes.length === 0) {
        toast.warning('No components', { description: 'Add components to analyze' })
        return
      }

      try {
        setAiAnalyzing(true)
        const issues = await analyzeArchitecture(currentNodes, currentEdges)
        setAiIssues(issues)
        toast.success('Analysis Complete', {
          description: `Found ${issues.length} recommendations`,
        })
      } catch (error) {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to analyze architecture',
        })
      } finally {
        setAiAnalyzing(false)
      }
    },
    [setAiAnalyzing, setAiIssues]
  )

  const toggleAI = useCallback(() => {
    if (activePanel !== 'ai') {
      setActivePanel('ai')
      analyzeDiagram(nodes, edges)
    } else {
      setActivePanel('none')
    }
  }, [nodes, edges, activePanel, setActivePanel, analyzeDiagram])

  // Infrastructure Testing
  const runTesting = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[]) => {
      if (currentNodes.length === 0) {
        toast.warning('No components', { description: 'Add components to test' })
        return
      }

      try {
        setTesting(true)
        const results = await testDiagram(currentNodes, currentEdges)
        setTestResults(results)
        const passed = results.filter(r => r.status === 'pass').length
        toast.success('Tests Complete', { description: `${passed}/${results.length} tests passed` })
      } catch (error) {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Failed to run tests',
        })
      } finally {
        setTesting(false)
      }
    },
    [setTesting, setTestResults]
  )

  const toggleTesting = useCallback(() => {
    if (activePanel !== 'testing') {
      setActivePanel('testing')
      runTesting(nodes, edges)
    } else {
      setActivePanel('none')
    }
  }, [nodes, edges, activePanel, setActivePanel, runTesting])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // FIX BUG#8: navigator.platform is deprecated since Chrome 110
      const isMac = /Mac|iPhone|iPad|iPod/i.test(
        (navigator as any).userAgentData?.platform ?? navigator.platform
      )
      const modKey = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + S - Save
      if (modKey && e.key === 's') {
        e.preventDefault()
        // FIX BUG#4: use ref to avoid stale closure — always calls latest handleSave
        handleSaveRef.current()
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
          toast.success('Duplicated', { description: `${newNodes.length} node(s) duplicated` })
        }
        return
      }

      // Ctrl/Cmd + A - Select all
      if (modKey && e.key === 'a') {
        // Prevent default only if a flow action is intended (e.g. not in input)
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        e.preventDefault()
        setNodes(nds => nds.map(n => ({ ...n, selected: true })))
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nodes, setNodes, handleUndo, handleRedo, toast])

  // Warn user before closing/refreshing the tab when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Fit view to a specific node
  const handleFitNode = useCallback(
    (nodeId: string) => {
      const node = getNodes().find(n => n.id === nodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width || 150) / 2
        const y = node.position.y + (node.measured?.height || 60) / 2
        setCenter(x, y, { zoom: 1.5, duration: 500 })
        // Also select the node
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })))
      }
    },
    [getNodes, setCenter, setNodes]
  )

  // Load project and diagram
  useEffect(() => {
    if (!projectId) {
      toast.error('Error', { description: 'Project ID is missing' })
      router.push('/dashboard')
      return
    }
    let cancelled = false

    async function loadData() {
      try {
        setLoading(true)

        // Load project
        const projectRes = await fetchWithTimeout(`/api/projects/${projectId}`, {}, 10000)
        if (!projectRes.ok) {
          if (projectRes.status === 404) {
            toast.error('Project not found', { description: 'This project does not exist' })
            router.push('/dashboard')
            return
          }
          throw new Error('Failed to load project')
        }
        const projectData = await projectRes.json()
        if (!cancelled) setProject(projectData.data || projectData)

        // Load diagram
        const diagramRes = await fetchWithTimeout(
          `/api/diagrams?project_id=${projectId}&limit=1`,
          {},
          10000
        )
        if (!diagramRes.ok) throw new Error('Failed to load diagram')
        const diagramData = await diagramRes.json()
        const diagrams = diagramData.data || diagramData

        if (!cancelled && diagrams.length > 0) {
          const lastDiagram: Diagram = diagrams[0]
          setDiagramId(lastDiagram.id)
          if (lastDiagram.data?.nodes) setNodes(lastDiagram.data.nodes)
          if (lastDiagram.data?.edges) setEdges(lastDiagram.data.edges)
          setLastSaved(new Date(lastDiagram.updated_at))
          toast.success('Diagram Loaded', {
            description: `Loaded ${lastDiagram.data?.nodes?.length || 0} components`,
          })
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('Error', {
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
          data: { nodes, edges, last_edited_by_name: currentUserNameRef.current || undefined },
        }

        const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams'
        const method = diagramId ? 'PUT' : 'POST'

        const res = await fetchWithTimeout(
          url,
          {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
          10000
        )

        if (res.ok) {
          const data = await res.json()
          if (data.id && !diagramId) setDiagramId(data.id)
          setLastSaved(new Date())
          lastLocalSaveAt.current = Date.now() // mark autosave timestamp
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
            // Only show notification if update came from a different user
            // (grace period: 4s after our own save to allow for realtime round-trip)
            if (Date.now() - lastLocalSaveAt.current > 4000) {
              const editorName = (payload.new as any)?.data?.last_edited_by_name
              toast.info('Diagram Updated', {
                description: editorName
                  ? `${editorName} made changes`
                  : 'Changes from another user',
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [diagramId, setNodes, setEdges, toast])

  // Fetch current user info for presence/change attribution
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((result: Awaited<ReturnType<typeof supabase.auth.getUser>>) => {
      const user = result.data?.user
      if (user) {
        currentUserNameRef.current =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User'
      }
    })
  }, [])

  // Realtime cursor presence channel
  useEffect(() => {
    if (!diagramId) return
    const supabase = createClient()
    const presenceChannel = supabase.channel(`presence:${diagramId}`, {
      config: { presence: { key: crypto.randomUUID() } },
    })
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const cursors: Record<string, { user_name: string; x: number; y: number }> = {}
        Object.entries(state).forEach(([key, presences]) => {
          const p = (presences as any[])[0]
          if (p && p.user_name !== currentUserNameRef.current) {
            cursors[key] = { user_name: p.user_name, x: p.x ?? 0, y: p.y ?? 0 }
          }
        })
        setPeerCursors(cursors)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          presenceChannelRef.current = presenceChannel
        }
      })
    return () => {
      supabase.removeChannel(presenceChannel)
      presenceChannelRef.current = null
    }
  }, [diagramId])

  // Broadcast cursor position (throttled to 40 ms)
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!presenceChannelRef.current) return
    const now = Date.now()
    if (now - lastCursorBroadcast.current < 40) return
    lastCursorBroadcast.current = now
    const rect = e.currentTarget.getBoundingClientRect()
    presenceChannelRef.current.track({
      user_name: currentUserNameRef.current || 'User',
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])
  useEffect(() => {
    const handleConfigureNode = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>
      const { nodeId } = customEvent.detail
      // Use getNodes() to always get current nodes state
      const currentNodes = getNodes()
      const node = currentNodes.find(n => n.id === nodeId)
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

  // FIX BUG#3: Keep diagramIdRef in sync so cleanup closure always has fresh value
  useEffect(() => {
    diagramIdRef.current = diagramId
  }, [diagramId])

  // Save on unmount — uses diagramIdRef to avoid stale closure (BUG#3)
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current && (nodes.length > 0 || edges.length > 0)) {
        const currentDiagramId = diagramIdRef.current
        const url = currentDiagramId ? `/api/diagrams/${currentDiagramId}` : '/api/diagrams'
        const method = currentDiagramId ? 'PUT' : 'POST'
        fetch(url, {
          method,
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
      if (params.source && params.target) {
        const currentNodes = getNodes()
        const sourceNode = currentNodes.find(n => n.id === params.source)
        const targetNode = currentNodes.find(n => n.id === params.target)

        if (sourceNode && targetNode) {
          // Guard: prevent edges between parent and child — containment already encodes the relationship
          if (sourceNode.parentId === targetNode.id || targetNode.parentId === sourceNode.id) {
            toast.info('Already Connected', {
              description: 'These components are linked via containment. No edge needed.',
            })
            return
          }

          const sourceComponentId =
            (sourceNode.data as any).componentId || (sourceNode.data as any).component || ''
          const targetComponentId =
            (targetNode.data as any).componentId || (targetNode.data as any).component || ''

          if (sourceComponentId && targetComponentId) {
            const error = getConnectionError(sourceComponentId, targetComponentId)
            if (error) {
              toast.error('Invalid Connection', { description: error })
              return
            }
          }

          // Auto-assign semantic edge type based on component pair
          const sourceComponentIdForType =
            (sourceNode.data as any).componentId || (sourceNode.data as any).component || ''
          const targetComponentIdForType =
            (targetNode.data as any).componentId || (targetNode.data as any).component || ''
          const edgeSemanticType = getEdgeType(sourceComponentIdForType, targetComponentIdForType)

          setEdges(eds =>
            addEdge(
              {
                ...params,
                data: { ...(params as any).data, edgeType: edgeSemanticType },
              },
              eds
            )
          )
          return
        }
      }

      setEdges(eds => addEdge(params, eds))
    },
    [setEdges, getNodes, toast]
  )

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setConfigPanelOpen(true)
  }, [])

  // Helper: compute absolute position of a node considering its parent chain
  const getAbsolutePosition = useCallback(
    (node: Node, allNodes: Node[]): { x: number; y: number } => {
      let x = node.position.x
      let y = node.position.y
      let currentParentId = node.parentId
      while (currentParentId) {
        const parent = allNodes.find(n => n.id === currentParentId)
        if (!parent) break
        x += parent.position.x
        y += parent.position.y
        currentParentId = parent.parentId
      }
      return { x, y }
    },
    []
  )

  // Helper: get node bounding box (absolute)
  // Prefers data.width/height (written by ContainerNode resize) over style (may be stale)
  const getNodeBounds = useCallback(
    (node: Node, allNodes: Node[]) => {
      const pos = getAbsolutePosition(node, allNodes)
      const w =
        (node.data?.width as number) ||
        (node.style?.width as number) ||
        (node.measured?.width as number) ||
        400
      const h =
        (node.data?.height as number) ||
        (node.style?.height as number) ||
        (node.measured?.height as number) ||
        300
      return { x: pos.x, y: pos.y, width: w, height: h }
    },
    [getAbsolutePosition]
  )

  // Handle node reparenting when dragged into/out of containers
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const allNodes = getNodes()
      const draggedComponent = draggedNode.data?.componentId as string
      const draggedAbs = getAbsolutePosition(draggedNode, allNodes)

      // Size of the dragged node itself (for proper containment check)
      const draggedW =
        (draggedNode.style?.width as number) || (draggedNode.measured?.width as number) || 180
      const draggedH =
        (draggedNode.style?.height as number) || (draggedNode.measured?.height as number) || 60

      // Find the deepest (most specific) valid container at the drop position
      const validContainers = allNodes
        .filter(node => {
          if (node.id === draggedNode.id) return false
          if (node.type !== 'container') return false
          // Don't allow dropping a node into its own descendant
          let parentCheck = node.parentId
          while (parentCheck) {
            if (parentCheck === draggedNode.id) return false
            parentCheck = allNodes.find(n => n.id === parentCheck)?.parentId
          }

          const containerComponent = node.data?.componentId as string
          if (!CONTAINER_HIERARCHY[containerComponent]?.includes(draggedComponent)) return false

          const bounds = getNodeBounds(node, allNodes)
          // Check if dragged node CENTER is inside the container
          const cx = draggedAbs.x + draggedW / 2
          const cy = draggedAbs.y + draggedH / 2
          return (
            cx >= bounds.x &&
            cx <= bounds.x + bounds.width &&
            cy >= bounds.y &&
            cy <= bounds.y + bounds.height
          )
        })
        .sort((a, b) => {
          let depthA = 0,
            depthB = 0
          let p = a.parentId
          while (p) {
            depthA++
            p = allNodes.find(n => n.id === p)?.parentId
          }
          p = b.parentId
          while (p) {
            depthB++
            p = allNodes.find(n => n.id === p)?.parentId
          }
          return depthB - depthA
        })

      const targetContainer = validContainers[0] || null

      if (targetContainer && targetContainer.id !== draggedNode.parentId) {
        // Reparent into new container
        const containerAbs = getAbsolutePosition(targetContainer, allNodes)
        const childRelX = draggedAbs.x - containerAbs.x
        const childRelY = draggedAbs.y - containerAbs.y

        // Auto-resize container if child would overflow
        const containerW =
          (targetContainer.data?.width as number) || (targetContainer.style?.width as number) || 400
        const containerH =
          (targetContainer.data?.height as number) ||
          (targetContainer.style?.height as number) ||
          300
        const padding = 20
        const headerHeight = 40
        const neededW = Math.max(containerW, childRelX + draggedW + padding)
        const neededH = Math.max(containerH, childRelY + draggedH + padding)
        // Ensure child doesn't land in the header
        const clampedY = Math.max(headerHeight + padding, childRelY)

        setNodes(nds =>
          nds.map(node => {
            if (node.id === draggedNode.id) {
              return {
                ...node,
                parentId: targetContainer.id,
                extent: undefined,
                expandParent: undefined,
                position: {
                  x: Math.max(padding, childRelX),
                  y: clampedY,
                },
                onAction: (action: string) => {
                  switch (action) {
                    case 'ai':
                      toggleAI()
                      break
                    case 'compliance':
                      setActivePanel(activePanel === 'compliance' ? 'none' : 'compliance')
                      break
                    case 'cost':
                      setActivePanel('none')
                      break
                    case 'multicloud':
                      setActivePanel(activePanel === 'multiCloud' ? 'none' : 'multiCloud')
                      break
                    case 'testing':
                      toggleTesting()
                      break
                    case 'governance':
                      setShowGovernanceWizard(true)
                      break
                  }
                },
              }
            }
            // Grow container if needed
            if (node.id === targetContainer.id && (neededW > containerW || neededH > containerH)) {
              return {
                ...node,
                style: {
                  ...node.style,
                  width: neededW,
                  height: neededH,
                },
                data: {
                  ...node.data,
                  width: neededW,
                  height: neededH,
                },
              }
            }
            return node
          })
        )
        toast.success('Component Nested', {
          description: `${draggedNode.data?.label} → ${targetContainer.data?.label}`,
        })
      } else if (targetContainer && targetContainer.id === draggedNode.parentId) {
        // Still inside the same parent — auto-resize if child overflows
        const containerW =
          (targetContainer.data?.width as number) || (targetContainer.style?.width as number) || 400
        const containerH =
          (targetContainer.data?.height as number) ||
          (targetContainer.style?.height as number) ||
          300
        const padding = 20
        const childX = draggedNode.position.x
        const childY = draggedNode.position.y
        const neededW = Math.max(containerW, childX + draggedW + padding)
        const neededH = Math.max(containerH, childY + draggedH + padding)

        if (neededW > containerW || neededH > containerH) {
          setNodes(nds =>
            nds.map(node => {
              if (node.id === targetContainer.id) {
                return {
                  ...node,
                  style: {
                    ...node.style,
                    width: neededW,
                    height: neededH,
                  },
                  data: {
                    ...node.data,
                    width: neededW,
                    height: neededH,
                  },
                }
              }
              return node
            })
          )
        }
      } else if (!targetContainer && draggedNode.parentId) {
        // Dragged out of container — unparent
        const oldParent = allNodes.find(n => n.id === draggedNode.parentId)
        if (oldParent) {
          setNodes(nds =>
            nds.map(node => {
              if (node.id === draggedNode.id) {
                return {
                  ...node,
                  parentId: undefined,
                  extent: undefined,
                  expandParent: undefined,
                  position: { x: draggedAbs.x, y: draggedAbs.y },
                }
              }
              return node
            })
          )
          toast.success('Component Removed', {
            description: `${draggedNode.data?.label} removed from ${oldParent.data?.label}`,
          })
        }
      }
    },
    [
      getNodes,
      setNodes,
      toast,
      getAbsolutePosition,
      getNodeBounds,
      activePanel,
      setActivePanel,
      toggleAI,
      toggleTesting,
      setShowGovernanceWizard,
    ]
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

        // Check if this is a container component
        const componentId = component.isCustom ? component.componentId : component.id
        const isContainer = !component.isCustom && CONTAINER_COMPONENTS.includes(component.id)

        // Find the deepest valid container at drop position
        let parentId: string | undefined
        let relativePosition = snappedPosition

        const currentNodes = nodes
        // Sort containers deepest-first for proper nesting
        const validContainers = currentNodes
          .filter(node => {
            if (node.type !== 'container') return false
            const containerComponent = node.data?.componentId as string
            // Use CONTAINER_HIERARCHY to validate
            if (!CONTAINER_HIERARCHY[containerComponent]?.includes(component.id)) return false

            // Compute absolute bounds
            let absX = node.position.x,
              absY = node.position.y
            let pid = node.parentId
            while (pid) {
              const p = currentNodes.find(n => n.id === pid)
              if (!p) break
              absX += p.position.x
              absY += p.position.y
              pid = p.parentId
            }
            const w = (node.style?.width as number) || (node.measured?.width as number) || 400
            const h = (node.style?.height as number) || (node.measured?.height as number) || 300

            return (
              snappedPosition.x >= absX &&
              snappedPosition.x <= absX + w &&
              snappedPosition.y >= absY &&
              snappedPosition.y <= absY + h
            )
          })
          .sort((a, b) => {
            let dA = 0,
              dB = 0
            let p = a.parentId
            while (p) {
              dA++
              p = currentNodes.find(n => n.id === p)?.parentId
            }
            p = b.parentId
            while (p) {
              dB++
              p = currentNodes.find(n => n.id === p)?.parentId
            }
            return dB - dA
          })

        const targetContainer = validContainers[0]
        if (targetContainer) {
          parentId = targetContainer.id
          // Compute container absolute position
          let absX = targetContainer.position.x,
            absY = targetContainer.position.y
          let pid = targetContainer.parentId
          while (pid) {
            const p = currentNodes.find(n => n.id === pid)
            if (!p) break
            absX += p.position.x
            absY += p.position.y
            pid = p.parentId
          }
          relativePosition = {
            x: snappedPosition.x - absX,
            y: snappedPosition.y - absY,
          }
        }

        // Default sizes for containers
        const getContainerSize = (id: string) => {
          if (id.includes('resource-group')) return { width: 800, height: 600 }
          if (id.includes('vnet') || id.includes('vpc')) return { width: 600, height: 450 }
          if (id.includes('subnet')) return { width: 450, height: 300 }
          if (id.includes('availability-set')) return { width: 350, height: 250 }
          return { width: 400, height: 300 }
        }

        const containerSize = isContainer ? getContainerSize(component.id) : undefined

        // Ensure child position is inside the container (below header)
        const headerHeight = 40
        const padding = 20
        if (parentId) {
          relativePosition = {
            x: Math.max(padding, relativePosition.x),
            y: Math.max(headerHeight + padding, relativePosition.y),
          }
        }

        // Auto-resize the parent container if needed
        const childW = containerSize ? containerSize.width : 180
        const childH = containerSize ? containerSize.height : 60
        let parentGrow: { id: string; width: number; height: number } | null = null
        if (parentId) {
          const parentNode = currentNodes.find(n => n.id === parentId)
          if (parentNode) {
            const parentW = (parentNode.style?.width as number) || 400
            const parentH = (parentNode.style?.height as number) || 300
            const neededW = Math.max(parentW, relativePosition.x + childW + padding)
            const neededH = Math.max(parentH, relativePosition.y + childH + padding)
            if (neededW > parentW || neededH > parentH) {
              parentGrow = { id: parentId, width: neededW, height: neededH }
            }
          }
        }

        const newNode: Node = {
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: isContainer ? 'container' : 'custom',
          position: relativePosition,
          parentId,
          data: {
            label: component.name || component.label,
            componentId: componentId,
            provider: component.provider,
            category: component.category,
            // Store dimensions in data so ContainerNode can read them reliably
            ...(containerSize && { width: containerSize.width, height: containerSize.height }),
            ...(component.isCustom && {
              isCustom: true,
              icon: component.icon,
              color: component.color,
            }),
          },
          ...(containerSize && { style: containerSize }),
        }

        setNodes(nds => {
          const updated = parentGrow
            ? nds.map(n =>
                n.id === parentGrow!.id
                  ? {
                      ...n,
                      style: { ...n.style, width: parentGrow!.width, height: parentGrow!.height },
                    }
                  : n
              )
            : nds
          return [...updated, newNode]
        })
      } catch {
        toast.error('Error', { description: 'Failed to add component' })
      }
    },
    [setNodes, toast, screenToFlowPosition, nodes]
  )

  const handleSave = async () => {
    try {
      setSaving(true)
      hasUnsavedChanges.current = false
      lastLocalSaveAt.current = Date.now() // mark as our own save

      const payload = {
        project_id: projectId,
        name: 'Main Diagram',
        data: { nodes, edges, last_edited_by_name: currentUserNameRef.current || undefined },
      }

      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams'
      const method = diagramId ? 'PUT' : 'POST'

      const res = await fetchWithTimeout(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        10000
      )

      if (res.ok) {
        const data = await res.json()
        if (data.id && !diagramId) setDiagramId(data.id)
        setLastSaved(new Date())
        toast.success('Saved', { description: 'Diagram saved successfully' })
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      hasUnsavedChanges.current = true
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to save diagram',
      })
    } finally {
      setSaving(false)
    }
  }
  // FIX BUG#4: Update handleSaveRef on every render (after handleSave is defined).
  // Keyboard shortcut useEffect calls handleSaveRef.current() so it always has
  // the latest closure with fresh nodes/edges/diagramId. Ref updates don't cause re-renders.
  handleSaveRef.current = handleSave

  const handleGenerateCode = async () => {
    if (nodes.length === 0) {
      toast.warning('No Components', {
        description: 'Add cloud components (AWS, Azure, GCP) to generate Terraform code.',
      })
      return
    }

    try {
      const res = await fetchWithTimeout(
        '/api/generate/terraform',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes,
            edges,
            diagram_id: diagramId,
            environment: project?.settings?.environment || 'dev',
            project_name: project?.name || 'project',
          }),
        },
        30000
      )

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errors = data.errors || []
        const warnings = data.warnings || []
        const errorMessage = data.error || 'Failed to generate Terraform'
        const errorList =
          errors.length > 0
            ? errors
                .map((e: { nodeLabel: string; error: string }) => `• ${e.nodeLabel}: ${e.error}`)
                .join('\n')
            : errorMessage
        toast.error('Cannot Generate Terraform', {
          description:
            errorList +
            (warnings.length > 0 ? `\n⚠ Warnings: ${warnings.slice(0, 3).join('; ')}` : ''),
        })
        return
      }

      // Store files and open preview dialog — user can copy or download from there
      setCodePreviewFiles(
        (data.files as { filename: string; code: string }[]).map(f => ({
          filename: f.filename,
          code: f.code,
        }))
      )
      setCodePreviewTitle('Terraform Infrastructure Code')
      setCodePreviewZipName('terraform-infrastructure.zip')
      setTerraformDirty(false)
      setCodePreviewOpen(true)

      const successMessage =
        data.skippedCount > 0
          ? `Generated ${data.files.length} files (${data.skippedCount} components skipped)`
          : `Generated ${data.files.length} Terraform files`
      toast.success('Terraform Generated', { description: successMessage })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to generate Terraform code',
      })
    }
  }

  // Download the files currently shown in the preview dialog
  const handleCodePreviewDownload = useCallback(async () => {
    if (codePreviewFiles.length === 0) return
    if (codePreviewFiles.length === 1) {
      const file = codePreviewFiles[0]
      const blob = new Blob([file.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const file of codePreviewFiles) {
        zip.file(file.filename, file.code)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = codePreviewZipName
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [codePreviewFiles, codePreviewZipName])

  // Import Terraform .tf files → diagram nodes
  const handleImportTerraform = useCallback(
    async (files: FileList) => {
      try {
        const { importTerraformFiles } = await import('@/lib/terraform-import')
        const fileContents = await Promise.all(
          Array.from(files).map(async f => ({ name: f.name, content: await f.text() }))
        )
        const result = importTerraformFiles(fileContents)
        if (result.nodes.length === 0) {
          toast.warning('Nothing Imported', {
            description:
              'No recognized Terraform resources found. Make sure the files contain resource blocks.',
          })
          return
        }
        setNodes(result.nodes)
        setEdges(result.edges)
        hasUnsavedChanges.current = true
        const warnMsg =
          result.warnings.length > 0
            ? ` · ${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}`
            : ''
        toast.success('Terraform Imported', {
          description: `${result.nodes.length} component${result.nodes.length !== 1 ? 's' : ''} added from Terraform${warnMsg}`,
        })
        setTimeout(() => fitView({ padding: 0.2 }), 100)
      } catch (error) {
        toast.error('Import Failed', {
          description: error instanceof Error ? error.message : 'Failed to parse Terraform files',
        })
      }
    },
    [setNodes, setEdges, fitView]
  )

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'diagram.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported', { description: 'Diagram exported successfully' })
    } catch {
      toast.error('Error', { description: 'Failed to export diagram' })
    }
  }

  const handleGenerateCloudFormation = async () => {
    if (nodes.length === 0) {
      toast.warning('No Components', {
        description: 'Add cloud components to generate CloudFormation.',
      })
      return
    }
    try {
      const { generateCloudFormation } = await import('@/lib/export/cloudformation-generator')
      const yaml = generateCloudFormation(nodes, edges, 'yaml')
      setCodePreviewFiles([{ filename: 'cloudformation-template.yaml', code: yaml }])
      setCodePreviewTitle('CloudFormation Template')
      setCodePreviewZipName('cloudformation-template.yaml')
      setCodePreviewOpen(true)
      toast.success('CloudFormation Generated', {
        description: 'Review and download your template',
      })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to generate CloudFormation',
      })
    }
  }

  const handleGenerateARM = async () => {
    if (nodes.length === 0) {
      toast.warning('No Components', {
        description: 'Add cloud components to generate ARM template.',
      })
      return
    }
    try {
      const { generateARM } = await import('@/lib/export/arm-generator')
      const json = generateARM(nodes, edges)
      setCodePreviewFiles([{ filename: 'arm-template.json', code: json }])
      setCodePreviewTitle('ARM Template')
      setCodePreviewZipName('arm-template.json')
      setCodePreviewOpen(true)
      toast.success('ARM Template Generated', { description: 'Review and download your template' })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to generate ARM template',
      })
    }
  }

  const handleGeneratePulumi = async () => {
    if (nodes.length === 0) {
      toast.warning('No Components', {
        description: 'Add cloud components to generate Pulumi code.',
      })
      return
    }
    try {
      const { generatePulumi } = await import('@/lib/export/pulumi-generator')
      const code = generatePulumi(nodes, edges)
      setCodePreviewFiles([{ filename: 'index.ts', code }])
      setCodePreviewTitle('Pulumi Infrastructure Code')
      setCodePreviewZipName('pulumi-index.ts')
      setCodePreviewOpen(true)
      toast.success('Pulumi Generated', { description: 'Review and download your TypeScript code' })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to generate Pulumi code',
      })
    }
  }

  const handleGenerateCICD = async () => {
    if (nodes.length === 0) {
      toast.warning('No Components', {
        description: 'Add CI/CD, monitoring, or messaging components to generate config files.',
      })
      return
    }
    try {
      const { generateCICDConfigs } = await import('@/lib/generators/cicd')
      const result = generateCICDConfigs(nodes, edges)

      if (result.outputs.length === 0) {
        const exampleTools =
          'GitHub Actions, GitLab CI, Jenkins, ArgoCD, Helm, Datadog, Prometheus, RabbitMQ, Kafka'
        toast.warning('No CI/CD Components Found', {
          description: `Add third-party tools to your diagram: ${exampleTools}`,
        })
        return
      }

      if (result.outputs.length === 1) {
        // Single file — download directly
        const out = result.outputs[0]
        const blob = new Blob([out.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = out.filename.replace(/\//g, '_')
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Multiple files — ZIP them
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        for (const out of result.outputs) {
          zip.file(out.filename, out.content)
        }
        const blob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cicd-configs.zip'
        a.click()
        URL.revokeObjectURL(url)
      }

      const skippedMsg =
        result.skipped.length > 0
          ? ` · ${result.skipped.length} annotation-only component(s) skipped`
          : ''
      toast.success('CI/CD Files Generated', {
        description: `${result.outputs.length} file(s) exported${skippedMsg}`,
      })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to generate CI/CD configs',
      })
    }
  }

  // Compliance Scanning
  const handleComplianceScan = async (framework: 'cis' | 'gdpr' | 'soc2' | 'pci-dss' | 'hipaa') => {
    if (nodes.length === 0) {
      toast.warning('No components', { description: 'Add components to scan' })
      return
    }

    try {
      setComplianceScanning(true)
      const frameworkMap = {
        cis: 'CIS',
        gdpr: 'GDPR',
        soc2: 'SOC2',
        'pci-dss': 'PCI-DSS',
        hipaa: 'HIPAA',
      } as const

      const report = await runComplianceScan(nodes, edges, frameworkMap[framework])
      setComplianceReport(report)
      toast.success('Scan Complete', {
        description: `Score: ${report.score}% - ${report.findings.length} findings`,
      })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to run compliance scan',
      })
    } finally {
      setComplianceScanning(false)
    }
  }

  // Multi-Cloud Component Selection
  const handleSelectMultiCloudComponent = useCallback(
    (genericId: string, provider: 'aws' | 'azure' | 'gcp') => {
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

      setNodes(nds => [...nds, newNode])
      toast.success('Component Added', { description: `Added ${provider.toUpperCase()} component` })
    },
    [screenToFlowPosition, setNodes, toast]
  )

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
      <MobileWarningOverlay />
      <nav className="border-b flex-shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <LogoIcon size={24} />
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
              <div className="text-xs text-muted-foreground" title={lastSaved.toLocaleString()}>
                Saved <RelativeTime date={lastSaved.toISOString()} />
              </div>
            )}
            {nodes.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <span>
                  {nodes.length} {nodes.length === 1 ? 'component' : 'components'}
                </span>
                {edges.length > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>
                      {edges.length} {edges.length === 1 ? 'connection' : 'connections'}
                    </span>
                  </>
                )}
              </div>
            )}
            <ProjectShareDialog projectId={projectId} projectName={project?.name || 'Project'} />
          </div>
        </div>
      </nav>
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex flex-col w-72 border-r bg-muted/20 overflow-hidden">
          <ComponentPalette
            components={COMPONENT_CATALOG}
            cloudProvider={project?.cloud_provider}
            projectTypes={project?.settings?.project_types}
            onDragStart={(e, component) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('application/reactflow', JSON.stringify(component))
            }}
          />
          {project?.organization_id && (
            <div className="border-t max-h-[40%] overflow-hidden flex-shrink-0">
              <CustomComponentPanel
                organizationId={project.organization_id}
                onDragStart={() => {}}
                className="h-full"
              />
            </div>
          )}
        </div>
        <div className="flex-1 relative overflow-hidden" onMouseMove={handleCanvasMouseMove}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={changes => {
              setNodes(nds => applyNodeChanges(changes, nds))
            }}
            onEdgesChange={changes => {
              setEdges(eds => applyEdgeChanges(changes, eds))
            }}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStop={onNodeDragStop}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
              nodeColor={node => {
                const component = node.data?.componentId
                  ? getComponentById(node.data.componentId as string)
                  : null
                return component?.color || '#6366f1'
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>

          {/* Peer cursor overlays */}
          {Object.entries(peerCursors).map(([key, cursor]) => (
            <div
              key={key}
              className="absolute pointer-events-none z-50"
              style={{
                left: `${cursor.x}%`,
                top: `${cursor.y}%`,
                transform: 'translate(-2px,-2px)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" className="drop-shadow">
                <path
                  d="M0 0 L0 11 L3 8.5 L5.5 13.5 L7.5 12.5 L5 7.5 L9 7.5 Z"
                  fill="#6366f1"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              <span className="absolute left-4 top-0 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none">
                {cursor.user_name}
              </span>
            </div>
          ))}

          {/* Empty canvas quick-start overlay */}
          {nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center max-w-sm px-6 pointer-events-auto">
                <div className="text-4xl mb-3">🏗️</div>
                <h3 className="font-semibold text-lg mb-1">Start building your diagram</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag components from the left panel, or start with a template.
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => setTemplateDialogOpen(true)}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Browse templates
                  </button>
                  <button
                    onClick={() => setShowQuickBuild(true)}
                    className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
                  >
                    ⚡ Quick Build
                  </button>
                  <button
                    onClick={() => {
                      const rg = {
                        id: `container-${Date.now()}`,
                        type: 'container',
                        position: { x: 80, y: 80 },
                        data: {
                          label: 'my-resource-group',
                          componentId: 'azure-resource-group',
                          provider: 'azure',
                          width: 600,
                          height: 400,
                        },
                        style: { width: 600, height: 400 },
                      }
                      setNodes([rg as any])
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Azure: Add Resource Group
                  </button>
                  <button
                    onClick={() => {
                      const vpc = {
                        id: `container-${Date.now()}`,
                        type: 'container',
                        position: { x: 80, y: 80 },
                        data: {
                          label: 'my-vpc',
                          componentId: 'aws-vpc',
                          provider: 'aws',
                          width: 600,
                          height: 400,
                        },
                        style: { width: 600, height: 400 },
                      }
                      setNodes([vpc as any])
                    }}
                    className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    AWS: Add VPC
                  </button>
                  <button
                    onClick={() => {
                      const vpc = {
                        id: `container-${Date.now()}`,
                        type: 'container',
                        position: { x: 80, y: 80 },
                        data: {
                          label: 'my-vpc',
                          componentId: 'gcp-vpc',
                          provider: 'gcp',
                          width: 600,
                          height: 400,
                        },
                        style: { width: 600, height: 400 },
                      }
                      setNodes([vpc as any])
                    }}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    GCP: Add VPC Network
                  </button>
                </div>
              </div>
            </div>
          )}

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
            onLayout={() => {
              const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges
              )
              setNodes([...layoutedNodes])
              setEdges([...layoutedEdges])
              setTimeout(() => fitView({ padding: 0.2 }), 50)
            }}
            onSave={handleSave}
            onExport={handleExport}
            onGenerateCode={handleGenerateCode}
            onGenerateCloudFormation={handleGenerateCloudFormation}
            onGenerateARM={handleGenerateARM}
            onGeneratePulumi={handleGeneratePulumi}
            onGenerateCICD={handleGenerateCICD}
            onAIAnalysis={toggleAI}
            onComplianceScan={() => {
              // Open the compliance panel; auto-trigger a CIS scan if no report yet
              if (activePanel === 'compliance') {
                setActivePanel('none')
              } else {
                setActivePanel('compliance')
                if (!complianceReport && !complianceScanning) {
                  handleComplianceScan('cis')
                }
              }
            }}
            onRunTests={toggleTesting}
            onMultiCloud={() =>
              setActivePanel(activePanel === 'multiCloud' ? 'none' : 'multiCloud')
            }
            onShowTemplates={() => setTemplateDialogOpen(true)}
            onK8sWizard={() => setShowK8sWizard(true)}
            onGovernanceWizard={() => setShowGovernanceWizard(true)}
            onQuickBuild={() => setShowQuickBuild(true)}
            onDryRun={() => setShowTerminal(true)}
            onRegionConfig={() => setShowMultiRegion(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            saving={saving}
            onImportTerraform={handleImportTerraform}
            diagramId={diagramId ?? undefined}
            onRestoreVersion={() => {
              // Reload diagram data from server after version restore
              window.location.reload()
            }}
            onExportImage={async (format: 'png' | 'svg') => {
              try {
                const { toPng, toSvg } = await import('html-to-image')
                const element = document.querySelector('.react-flow') as HTMLElement
                if (!element) return

                const dataUrl = format === 'png' ? await toPng(element) : await toSvg(element)

                const a = document.createElement('a')
                a.href = dataUrl
                a.download = `diagram.${format}`
                a.click()
                toast.success('Exported', {
                  description: `Diagram exported as ${format.toUpperCase()}`,
                })
              } catch {
                toast.error('Error', { description: `Failed to export as ${format.toUpperCase()}` })
              }
            }}
          />
        </div>
        <CostSidebar nodes={nodes} />

        {/* Code Preview Dialog */}
        <CodePreviewDialog
          open={codePreviewOpen}
          onClose={() => setCodePreviewOpen(false)}
          title={codePreviewTitle}
          files={codePreviewFiles}
          onDownload={handleCodePreviewDownload}
        />

        {/* Template Dialog */}
        <TemplateDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          onApply={template => {
            // Normalize node types: containers get 'container', rest get 'custom'
            const normalizedNodes = (template.data.nodes || []).map((node: any) => ({
              ...node,
              type: CONTAINER_COMPONENTS.includes(node.data?.componentId) ? 'container' : 'custom',
            }))
            setNodes(normalizedNodes)
            setEdges(template.data.edges || [])
            hasUnsavedChanges.current = true
            toast.success('Template Applied', {
              description: `Loaded "${template.name}" — ${normalizedNodes.length} components`,
            })
            setTimeout(() => fitView({ padding: 0.2 }), 100)
          }}
        />

        {/* K8s Wizard */}
        <K8sWizard
          open={showK8sWizard}
          onOpenChange={setShowK8sWizard}
          onComplete={(newNodes, newEdges) => {
            const cx = window.innerWidth / 2 - 350
            const cy = window.innerHeight / 2 - 200
            const positioned = newNodes.map(n => ({
              ...n,
              position: { x: n.position.x + cx, y: n.position.y + cy },
            }))
            setNodes(nds => [...nds, ...positioned])
            setEdges(eds => [...eds, ...newEdges])
            hasUnsavedChanges.current = true
            toast.success('K8s Cluster Added', {
              description: `Generated ${positioned.length} nodes`,
            })
            setTimeout(() => fitView({ padding: 0.15 }), 150)
          }}
        />

        {/* Quick Build Modal */}
        <QuickBuildModal
          open={showQuickBuild}
          onOpenChange={setShowQuickBuild}
          onApply={(newNodes, newEdges) => {
            setNodes(nds => [...nds, ...newNodes])
            setEdges(eds => [...eds, ...newEdges])
            hasUnsavedChanges.current = true
            toast.success('Quick Build Applied', {
              description: `Added ${newNodes.length} components to canvas`,
            })
            setTimeout(() => fitView({ padding: 0.12 }), 150)
          }}
        />

        {/* Governance Wizard */}
        <GovernanceWizard
          open={showGovernanceWizard}
          onOpenChange={setShowGovernanceWizard}
          onComplete={(newNodes, newEdges) => {
            const cx = window.innerWidth / 2 - 450
            const cy = window.innerHeight / 2 - 300
            const positioned = newNodes.map(n => ({
              ...n,
              position: { x: n.position.x + cx, y: n.position.y + cy },
            }))
            setNodes(nds => [...nds, ...positioned])
            setEdges(eds => [...eds, ...newEdges])
            hasUnsavedChanges.current = true
            toast.success('Governance Landing Zone Added', {
              description: `Generated ${positioned.length} nodes`,
            })
            setTimeout(() => fitView({ padding: 0.15 }), 150)
          }}
        />

        {/* AI Assistant Sidebar */}
        {activePanel === 'ai' && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
                  ✕
                </Button>
              </div>
              <AIAssistantPanel issues={aiIssues} isAnalyzing={aiAnalyzing} />
            </div>
          </div>
        )}

        {/* Compliance Sidebar */}
        {activePanel === 'compliance' && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Compliance Scanning</h3>
                <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
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

        {/* Testing Sidebar */}
        {activePanel === 'testing' && (
          <div className="absolute right-4 top-20 w-96 h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Infrastructure Testing</h3>
                <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
                  ✕
                </Button>
              </div>
              <TestResultsPanel
                results={testResults}
                onRunTests={toggleTesting}
                isTesting={testing}
              />
            </div>
          </div>
        )}

        {/* Multi-Cloud Compare Sidebar */}
        {activePanel === 'multiCloud' && (
          <div className="absolute left-80 top-20 w-[500px] h-[calc(100vh-160px)] z-20 bg-background border rounded-lg shadow-xl">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Multi-Cloud Components</h3>
                <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
                  ✕
                </Button>
              </div>
              <MultiCloudComparePanel onSelectComponent={handleSelectMultiCloudComponent} />
            </div>
          </div>
        )}

        {showTerminal && (
          <Terminal nodes={nodes} edges={edges} onClose={() => setShowTerminal(false)} />
        )}

        {showMultiRegion && (
          <div className="absolute right-4 top-20 z-50">
            <MultiRegionSelector
              selectedRegions={selectedRegions}
              onRegionsChange={setSelectedRegions}
              primaryRegion={primaryRegion}
              onPrimaryChange={setPrimaryRegion}
              onClose={() => setShowMultiRegion(false)}
            />
          </div>
        )}

        <NodeConfigPanel key={selectedNode?.id || 'none'} />
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
