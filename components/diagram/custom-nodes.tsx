'use client'
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { getComponentById } from '@/lib/catalog'
import { LucideIcon } from 'lucide-react'

interface CustomNodeData {
  label?: string
  componentId: string
}

interface CustomNodeProps {
  data: CustomNodeData
}

export const CustomNode = memo(({ data }: CustomNodeProps) => {
  const component = getComponentById(data.componentId)
  if (!component) return null

  const Icon = component.icon as LucideIcon

  return (
    <Card className="min-w-[180px] shadow-lg">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5" style={{ color: component.color }} />
          <span className="font-semibold text-sm">{data.label || component.name}</span>
        </div>
        <p className="text-xs text-muted-foreground">{component.category}</p>
        <p className="text-xs text-primary mt-1">${component.estimatedCost.min}-${component.estimatedCost.max}/mo</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

CustomNode.displayName = 'CustomNode'
