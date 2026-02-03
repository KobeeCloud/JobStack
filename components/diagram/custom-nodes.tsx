'use client'
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getComponentById } from '@/lib/catalog'
import { LucideIcon, Settings } from 'lucide-react'

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
