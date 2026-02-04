'use client'
import { memo, useCallback } from 'react'
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getComponentById } from '@/lib/catalog'
import { LucideIcon, Settings, Maximize2 } from 'lucide-react'

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

  if (!component) return null

  const Icon = component.icon as LucideIcon
  const replicas = data.config?.replicas || 1

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Dispatch custom event to open config panel
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  return (
    <Card className="min-w-[180px] shadow-lg hover:shadow-xl transition-shadow">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 flex-shrink-0" style={{ color: component.color }} />
          <span className="font-semibold text-sm flex-1 truncate">{data.label || component.name}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleConfigure}
            title="Configure"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{component.category}</span>
          {replicas > 1 && (
            <Badge variant="secondary" className="text-xs h-4 px-1">
              ×{replicas}
            </Badge>
          )}
        </div>
        <p className="text-xs text-primary">${component.estimatedCost.min * replicas}-${component.estimatedCost.max * replicas}/mo</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

CustomNode.displayName = 'CustomNode'

// Container Node for VNet/Subnet - can hold other nodes inside
interface ContainerNodeData {
  label?: string
  componentId: string
  config?: any
}

interface ContainerNodeProps {
  id: string
  data: ContainerNodeData
  selected?: boolean
}

export const ContainerNode = memo(({ id, data, selected }: ContainerNodeProps) => {
  const component = getComponentById(data.componentId)
  const { getNodes, setNodes } = useReactFlow()

  if (!component) return null

  const Icon = component.icon as LucideIcon

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  // Auto-resize to fit children
  const handleAutoResize = useCallback(() => {
    const nodes = getNodes()
    const childNodes = nodes.filter(n => n.parentId === id)

    if (childNodes.length === 0) return

    // Calculate bounding box of children
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    childNodes.forEach(node => {
      const x = node.position.x
      const y = node.position.y
      const width = (node.measured?.width || node.width || 200)
      const height = (node.measured?.height || node.height || 100)

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + width > maxX) maxX = x + width
      if (y + height > maxY) maxY = y + height
    })

    // Add padding
    const padding = 40
    const headerHeight = 50

    setNodes(nds => nds.map(n => {
      if (n.id === id) {
        return {
          ...n,
          style: {
            ...n.style,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2 + headerHeight,
          }
        }
      }
      return n
    }))
  }, [getNodes, setNodes, id])

  // Background colors for different container types
  const containerColors: Record<string, { bg: string; border: string }> = {
    'azure-vnet': { bg: 'rgba(0, 120, 212, 0.05)', border: 'rgba(0, 120, 212, 0.3)' },
    'azure-subnet': { bg: 'rgba(0, 120, 212, 0.08)', border: 'rgba(0, 120, 212, 0.4)' },
    'aws-vpc': { bg: 'rgba(255, 153, 0, 0.05)', border: 'rgba(255, 153, 0, 0.3)' },
    'aws-subnet': { bg: 'rgba(255, 153, 0, 0.08)', border: 'rgba(255, 153, 0, 0.4)' },
    'gcp-vpc': { bg: 'rgba(66, 133, 244, 0.05)', border: 'rgba(66, 133, 244, 0.3)' },
    'gcp-subnet': { bg: 'rgba(66, 133, 244, 0.08)', border: 'rgba(66, 133, 244, 0.4)' },
  }

  const colors = containerColors[data.componentId] || { bg: 'rgba(100, 100, 100, 0.05)', border: 'rgba(100, 100, 100, 0.3)' }

  return (
    <div
      className="rounded-lg border-2 border-dashed relative"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
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
        lineClassName="border-primary"
        handleClassName="h-3 w-3 bg-white border-2 border-primary rounded"
      />
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between border-b border-dashed"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 flex-shrink-0" style={{ color: component.color }} />
          <span className="font-semibold text-sm">{data.label || component.name}</span>
          <Badge variant="outline" className="text-xs">Container</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleAutoResize}
            title="Auto-resize to fit contents"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleConfigure}
            title="Configure"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Drop zone hint */}
      <div className="absolute inset-0 top-12 flex items-center justify-center pointer-events-none opacity-30">
        <span className="text-xs text-muted-foreground">Drop components here</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
})

ContainerNode.displayName = 'ContainerNode'

CustomNode.displayName = 'CustomNode'
