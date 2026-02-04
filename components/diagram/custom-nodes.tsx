'use client'
import { memo, useCallback, useState, useEffect } from 'react'
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getComponentById } from '@/lib/catalog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  LucideIcon,
  Settings,
  Maximize2,
  Grid3X3,
  Plus,
  Server,
  Database,
  Shield,
  Network,
  Trash2,
  Copy,
} from 'lucide-react'

// ==========================================
// CUSTOM NODE - Regular components
// ==========================================
interface CustomNodeData {
  label?: string
  componentId: string
  config?: any
}

interface CustomNodeProps {
  id: string
  data: CustomNodeData
}

export const CustomNode = memo(({ id, data }: CustomNodeProps) => {
  const component = getComponentById(data.componentId)
  const { deleteElements, setNodes, getNodes } = useReactFlow()

  if (!component) return null

  const Icon = component.icon as LucideIcon
  const replicas = data.config?.replicas || 1

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] })
  }

  const handleDuplicate = () => {
    const nodes = getNodes()
    const currentNode = nodes.find(n => n.id === id)
    if (!currentNode) return

    const newNode = {
      ...currentNode,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: currentNode.position.x + 20,
        y: currentNode.position.y + 20,
      },
      selected: false,
    }
    setNodes([...nodes, newNode])
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="min-w-[180px] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
          <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: `${component.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: component.color }} />
              </div>
              <span className="font-semibold text-sm flex-1 truncate">
                {data.label || component.name}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleConfigure}
                title="Configure"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {component.category}
              </Badge>
              {replicas > 1 && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                  ×{replicas}
                </Badge>
              )}
            </div>
            <p className="text-xs font-medium text-primary">
              ${component.estimatedCost.min * replicas}-${component.estimatedCost.max * replicas}/mo
            </p>
          </div>
          <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleConfigure}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})

CustomNode.displayName = 'CustomNode'

// ==========================================
// CONTAINER NODE - VNet/Subnet/VPC with advanced features
// ==========================================
interface ContainerNodeData {
  label?: string
  componentId: string
  config?: {
    cidr?: string
    attachedNsg?: string
    attachedFirewall?: string
    [key: string]: any
  }
}

interface ContainerNodeProps {
  id: string
  data: ContainerNodeData
  selected?: boolean
}

// Components that can be added to different container types
const CONTAINER_QUICK_ADD: Record<string, { label: string; icon: LucideIcon; componentId: string }[]> = {
  'azure-vnet': [
    { label: 'Subnet', icon: Network, componentId: 'azure-subnet' },
    { label: 'NSG', icon: Shield, componentId: 'azure-nsg' },
    { label: 'NAT Gateway', icon: Network, componentId: 'azure-nat-gateway' },
  ],
  'azure-subnet': [
    { label: 'Virtual Machine', icon: Server, componentId: 'azure-vm' },
    { label: 'SQL Database', icon: Database, componentId: 'azure-sql' },
    { label: 'App Service', icon: Server, componentId: 'azure-app-service' },
  ],
  'aws-vpc': [
    { label: 'Subnet', icon: Network, componentId: 'aws-subnet' },
    { label: 'Security Group', icon: Shield, componentId: 'aws-security-group' },
    { label: 'NAT Gateway', icon: Network, componentId: 'aws-nat-gateway' },
  ],
  'aws-subnet': [
    { label: 'EC2 Instance', icon: Server, componentId: 'aws-ec2' },
    { label: 'RDS Database', icon: Database, componentId: 'aws-rds' },
    { label: 'Lambda', icon: Server, componentId: 'aws-lambda' },
  ],
  'gcp-vpc': [
    { label: 'Subnet', icon: Network, componentId: 'gcp-subnet' },
    { label: 'Firewall Rule', icon: Shield, componentId: 'gcp-firewall' },
  ],
  'gcp-subnet': [
    { label: 'Compute Instance', icon: Server, componentId: 'gcp-compute' },
    { label: 'Cloud SQL', icon: Database, componentId: 'gcp-cloud-sql' },
  ],
}

export const ContainerNode = memo(({ id, data, selected }: ContainerNodeProps) => {
  const component = getComponentById(data.componentId)
  const { getNodes, setNodes, deleteElements } = useReactFlow()
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [childCount, setChildCount] = useState(0)

  // Update child count
  useEffect(() => {
    const nodes = getNodes()
    const children = nodes.filter(n => n.parentId === id)
    setChildCount(children.length)
  }, [getNodes, id])

  // Listen for drag events to highlight drop zone
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const rect = document.querySelector(`[data-id="${id}"]`)?.getBoundingClientRect()
      if (rect) {
        const isOver = e.clientX >= rect.left && e.clientX <= rect.right &&
                       e.clientY >= rect.top && e.clientY <= rect.bottom
        setIsDropTarget(isOver)
      }
    }

    const handleDragEnd = () => setIsDropTarget(false)

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragend', handleDragEnd)
    window.addEventListener('drop', handleDragEnd)

    return () => {
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragend', handleDragEnd)
      window.removeEventListener('drop', handleDragEnd)
    }
  }, [id])

  if (!component) return null

  const Icon = component.icon as LucideIcon
  const quickAddItems = CONTAINER_QUICK_ADD[data.componentId] || []

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  // Auto-resize to fit children
  const handleAutoResize = useCallback(() => {
    const nodes = getNodes()
    const childNodes = nodes.filter(n => n.parentId === id)

    if (childNodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    childNodes.forEach(node => {
      const x = node.position.x
      const y = node.position.y
      const width = (node.measured?.width || node.width || 200) as number
      const height = (node.measured?.height || node.height || 100) as number

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + width > maxX) maxX = x + width
      if (y + height > maxY) maxY = y + height
    })

    const padding = 40
    const headerHeight = 60

    setNodes(nds => nds.map(n => {
      if (n.id === id) {
        return {
          ...n,
          style: {
            ...n.style,
            width: Math.max(300, maxX - minX + padding * 2),
            height: Math.max(200, maxY - minY + padding * 2 + headerHeight),
          }
        }
      }
      return n
    }))
  }, [getNodes, setNodes, id])

  // Auto-layout children in grid
  const handleAutoLayout = useCallback(() => {
    const nodes = getNodes()
    const childNodes = nodes.filter(n => n.parentId === id)

    if (childNodes.length === 0) return

    const cols = Math.ceil(Math.sqrt(childNodes.length))
    const nodeWidth = 200
    const nodeHeight = 100
    const gap = 30
    const startX = 40
    const startY = 70

    setNodes(nds => nds.map(n => {
      if (n.parentId === id) {
        const index = childNodes.findIndex(cn => cn.id === n.id)
        const col = index % cols
        const row = Math.floor(index / cols)
        return {
          ...n,
          position: {
            x: startX + col * (nodeWidth + gap),
            y: startY + row * (nodeHeight + gap),
          }
        }
      }
      return n
    }))

    setTimeout(handleAutoResize, 100)
  }, [getNodes, setNodes, id, handleAutoResize])

  // Quick add component
  const handleQuickAdd = useCallback((componentId: string) => {
    const nodes = getNodes()
    const childNodes = nodes.filter(n => n.parentId === id)
    const comp = getComponentById(componentId)
    if (!comp) return

    const isContainer = ['azure-subnet', 'aws-subnet', 'gcp-subnet'].includes(componentId)

    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: isContainer ? 'container' : 'custom',
      position: {
        x: 40 + (childNodes.length % 3) * 220,
        y: 70 + Math.floor(childNodes.length / 3) * 130,
      },
      parentId: id,
      extent: 'parent' as const,
      expandParent: true,
      data: {
        label: comp.name,
        componentId: componentId,
        provider: comp.provider,
        category: comp.category,
      },
      ...(isContainer && {
        style: { width: 350, height: 250 },
      }),
    }

    setNodes([...nodes, newNode])
    setTimeout(handleAutoResize, 100)
  }, [getNodes, setNodes, id, handleAutoResize])

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] })
  }

  const handleDuplicate = () => {
    const nodes = getNodes()
    const currentNode = nodes.find(n => n.id === id)
    if (!currentNode) return

    const newNode = {
      ...currentNode,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: currentNode.position.x + 40,
        y: currentNode.position.y + 40,
      },
      selected: false,
    }
    setNodes([...nodes, newNode])
  }

  // Colors based on provider
  const containerColors: Record<string, { bg: string; border: string; accent: string }> = {
    'azure-vnet': { bg: 'rgba(0, 120, 212, 0.03)', border: '#0078D4', accent: '#0078D4' },
    'azure-subnet': { bg: 'rgba(0, 120, 212, 0.06)', border: '#0078D4', accent: '#0078D4' },
    'aws-vpc': { bg: 'rgba(255, 153, 0, 0.03)', border: '#FF9900', accent: '#FF9900' },
    'aws-subnet': { bg: 'rgba(255, 153, 0, 0.06)', border: '#FF9900', accent: '#FF9900' },
    'gcp-vpc': { bg: 'rgba(66, 133, 244, 0.03)', border: '#4285F4', accent: '#4285F4' },
    'gcp-subnet': { bg: 'rgba(66, 133, 244, 0.06)', border: '#4285F4', accent: '#4285F4' },
  }

  const colors = containerColors[data.componentId] || { bg: 'rgba(100, 100, 100, 0.03)', border: '#666', accent: '#666' }
  const cidr = data.config?.cidr || '10.0.0.0/16'

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          data-id={id}
          className={`rounded-xl border-2 relative transition-all duration-300 ${
            isDropTarget ? 'border-solid shadow-lg scale-[1.02]' : 'border-dashed'
          } ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          style={{
            backgroundColor: isDropTarget ? `${colors.accent}10` : colors.bg,
            borderColor: isDropTarget ? colors.accent : `${colors.border}50`,
            minWidth: 300,
            minHeight: 200,
            width: '100%',
            height: '100%',
          }}
        >
          <NodeResizer
            isVisible={selected}
            minWidth={300}
            minHeight={200}
            lineClassName="!border-primary"
            handleClassName="!h-3 !w-3 !bg-white !border-2 !border-primary !rounded-full"
          />
          <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />

          {/* Enhanced Header */}
          <div
            className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between rounded-t-xl"
            style={{
              backgroundColor: `${colors.accent}15`,
              borderBottom: `1px solid ${colors.border}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${colors.accent}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{data.label || component.name}</span>
                  {childCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {childCount} items
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
                    {cidr}
                  </code>
                  {data.config?.attachedNsg && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      NSG
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleAutoLayout}
                title="Auto-layout children"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleAutoResize}
                title="Auto-resize to fit"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleConfigure}
                title="Configure"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Drop zone indicator */}
          {childCount === 0 && !isDropTarget && (
            <div className="absolute inset-0 top-16 flex flex-col items-center justify-center pointer-events-none opacity-40">
              <Plus className="h-8 w-8 mb-2" style={{ color: colors.accent }} />
              <span className="text-xs text-muted-foreground">Drop components here</span>
              <span className="text-[10px] text-muted-foreground mt-1">or right-click to add</span>
            </div>
          )}

          {/* Active drop indicator */}
          {isDropTarget && (
            <div className="absolute inset-0 top-16 flex items-center justify-center pointer-events-none">
              <div
                className="px-4 py-2 rounded-lg animate-pulse"
                style={{ backgroundColor: `${colors.accent}20` }}
              >
                <span className="text-sm font-medium" style={{ color: colors.accent }}>
                  Drop here!
                </span>
              </div>
            </div>
          )}

          <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
        </div>
      </ContextMenuTrigger>

      {/* Context Menu */}
      <ContextMenuContent className="w-56">
        {quickAddItems.length > 0 && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                Quick Add
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {quickAddItems.map((item) => (
                  <ContextMenuItem
                    key={item.componentId}
                    onClick={() => handleQuickAdd(item.componentId)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={handleAutoLayout}>
          <Grid3X3 className="mr-2 h-4 w-4" />
          Auto-Layout
        </ContextMenuItem>
        <ContextMenuItem onClick={handleAutoResize}>
          <Maximize2 className="mr-2 h-4 w-4" />
          Fit to Contents
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleConfigure}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})

ContainerNode.displayName = 'ContainerNode'
