'use client'

import { memo } from 'react'
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  Settings,
  Trash2,
  Copy,
  Lock,
  Shield,
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cloud,
  Database,
  Container,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react'
import { COMPONENT_CATALOG } from '@/lib/catalog'

// Connection validation rules
export const CONNECTION_RULES: Record<string, string[]> = {
  'compute': ['database', 'storage', 'networking', 'security', 'containers', 'compute', 'ai-ml', 'analytics', 'messaging'],
  'database': ['compute', 'storage', 'analytics'],
  'storage': ['compute', 'database', 'analytics', 'ai-ml'],
  'networking': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'devops', 'monitoring'],
  'security': ['networking', 'compute', 'containers'],
  'containers': ['database', 'storage', 'networking', 'compute', 'containers', 'security', 'messaging'],
  'ai-ml': ['storage', 'compute', 'database', 'analytics'],
  'analytics': ['database', 'storage', 'compute', 'ai-ml'],
  'messaging': ['compute', 'containers', 'networking'],
  'devops': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'monitoring'],
  'monitoring': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'devops'],
}

export function getComponentCategory(componentId: string): string {
  const component = COMPONENT_CATALOG.find(c => c.id === componentId)
  return component?.category || 'compute'
}

// Components that should use parent-child relationship, not edge connections
const CONTAINER_HIERARCHY: Record<string, string[]> = {
  // Azure
  'azure-resource-group': ['azure-vnet', 'azure-subnet', 'azure-vm', 'azure-storage', 'azure-nsg', 'azure-lb', 'azure-app-gw', 'azure-sql', 'azure-cosmos', 'azure-function', 'azure-aks', 'azure-acr'],
  'azure-vnet': ['azure-subnet', 'azure-vm', 'azure-nic'],
  'azure-subnet': ['azure-vm', 'azure-nic', 'azure-aks'],
  // AWS
  'aws-vpc': ['aws-subnet', 'aws-ec2', 'aws-rds', 'aws-ecs', 'aws-eks', 'aws-lambda'],
  'aws-subnet': ['aws-ec2', 'aws-rds', 'aws-ecs', 'aws-eks', 'aws-lambda'],
  // GCP
  'gcp-vpc': ['gcp-subnet', 'gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-run'],
  'gcp-subnet': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-run'],
}

// Check if two components should use parent-child relationship instead of edge
export function shouldUseParentChild(sourceComponentId: string, targetComponentId: string): boolean {
  // Check if source is a container that can contain target
  if (CONTAINER_HIERARCHY[sourceComponentId]?.includes(targetComponentId)) {
    return true
  }
  // Check if target is a container that can contain source
  if (CONTAINER_HIERARCHY[targetComponentId]?.includes(sourceComponentId)) {
    return true
  }
  return false
}

export function isValidConnection(sourceComponentId: string, targetComponentId: string): boolean {
  // Block edge connections between components that should use parent-child
  if (shouldUseParentChild(sourceComponentId, targetComponentId)) {
    return false
  }

  const sourceCategory = getComponentCategory(sourceComponentId)
  const targetCategory = getComponentCategory(targetComponentId)
  const allowedTargets = CONNECTION_RULES[sourceCategory]
  if (!allowedTargets) return true
  return allowedTargets.includes(targetCategory)
}

function getHandleConfig(category: string) {
  switch (category) {
    case 'database':
      return { top: true, bottom: false, left: true, right: false, topType: 'target' as const, bottomType: 'target' as const, leftType: 'target' as const, rightType: 'target' as const }
    case 'storage':
      return { top: true, bottom: true, left: true, right: false, topType: 'target' as const, bottomType: 'source' as const, leftType: 'target' as const, rightType: 'source' as const }
    case 'networking':
    case 'security':
    case 'compute':
    case 'containers':
      return { top: true, bottom: true, left: true, right: true, topType: 'target' as const, bottomType: 'source' as const, leftType: 'target' as const, rightType: 'source' as const }
    case 'messaging':
      return { top: true, bottom: true, left: true, right: true, topType: 'target' as const, bottomType: 'source' as const, leftType: 'source' as const, rightType: 'target' as const }
    default:
      return { top: true, bottom: true, left: true, right: true, topType: 'target' as const, bottomType: 'source' as const, leftType: 'target' as const, rightType: 'source' as const }
  }
}

function SecurityIndicator({ type }: { type: 'nsg' | 'firewall' | 'waf' | 'ddos' | 'encryption' }) {
  const config = {
    nsg: { icon: Shield, label: 'Network Security Group', color: 'bg-blue-500' },
    firewall: { icon: ShieldCheck, label: 'Firewall Protected', color: 'bg-orange-500' },
    waf: { icon: Shield, label: 'WAF Protected', color: 'bg-purple-500' },
    ddos: { icon: Zap, label: 'DDoS Protection', color: 'bg-red-500' },
    encryption: { icon: Lock, label: 'Encrypted', color: 'bg-green-500' },
  }
  const { icon: Icon, label, color } = config[type]
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${color} flex items-center justify-center shadow-md`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent><p className="text-xs font-medium">{label}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StatusIndicator({ status }: { status: 'running' | 'stopped' | 'warning' | 'error' }) {
  const config = {
    running: { icon: CheckCircle2, color: 'text-green-500', label: 'Running' },
    stopped: { icon: XCircle, color: 'text-gray-400', label: 'Stopped' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Warning' },
    error: { icon: XCircle, color: 'text-red-500', label: 'Error' },
  }
  const { icon: Icon, color, label } = config[status]
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Icon className={`w-3 h-3 ${color}`} /></TooltipTrigger>
        <TooltipContent><p className="text-xs">{label}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'compute': return Cpu
    case 'database': return Database
    case 'storage': return HardDrive
    case 'networking': return Network
    case 'security': return Shield
    case 'containers': return Container
    default: return Cloud
  }
}

interface CustomNodeProps {
  id: string
  data: {
    label: string
    icon?: string
    componentId?: string
    component?: string
    provider?: string
    config?: Record<string, unknown>
    security?: { nsg?: boolean; firewall?: boolean; waf?: boolean; ddos?: boolean; encryption?: boolean }
    status?: 'running' | 'stopped' | 'warning' | 'error'
  }
  selected: boolean
}

export const CustomNode = memo(function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { setNodes, getNodes, deleteElements } = useReactFlow()
  const componentId = data.componentId || data.component || ''
  const category = getComponentCategory(componentId)
  const handleConfig = getHandleConfig(category)

  const getProviderColor = () => {
    switch (data.provider) {
      case 'aws': return 'border-l-orange-500 border-l-4'
      case 'azure': return 'border-l-blue-500 border-l-4'
      case 'gcp': return 'border-l-red-500 border-l-4'
      default: return ''
    }
  }

  const handleDelete = () => deleteElements({ nodes: [{ id }] })

  const handleConfigure = () => {
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  const handleDuplicate = () => {
    const nodes = getNodes()
    const currentNode = nodes.find(n => n.id === id)
    if (!currentNode) return
    const newNode = {
      ...currentNode,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x: currentNode.position.x + 20, y: currentNode.position.y + 20 },
      selected: false,
    }
    setNodes([...nodes, newNode])
  }

  const CategoryIcon = getCategoryIcon(category)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={`min-w-[180px] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group relative ${selected ? 'ring-2 ring-primary ring-offset-2' : ''} ${getProviderColor()}`}>
          <NodeResizer minWidth={150} minHeight={60} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-primary border-2 border-background rounded" />

          {data.security?.nsg && <SecurityIndicator type="nsg" />}
          {data.security?.firewall && <div className="absolute -top-2 -right-8"><SecurityIndicator type="firewall" /></div>}
          {data.security?.encryption && <div className="absolute -bottom-2 -right-2"><SecurityIndicator type="encryption" /></div>}

          {handleConfig.top && <Handle type={handleConfig.topType} position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" />}
          {handleConfig.bottom && <Handle type={handleConfig.bottomType} position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" />}
          {handleConfig.left && <Handle type={handleConfig.leftType} position={Position.Left} className="w-3 h-3 bg-primary/80 border-2 border-background" />}
          {handleConfig.right && <Handle type={handleConfig.rightType} position={Position.Right} className="w-3 h-3 bg-primary/80 border-2 border-background" />}

          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {data.icon ? <span className="text-2xl">{data.icon}</span> : <CategoryIcon className="w-6 h-6 text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm truncate">{data.label}</span>
                  {data.status && <StatusIndicator status={data.status} />}
                </div>
                {data.provider && <Badge variant="outline" className="text-[10px] px-1 py-0 mt-1">{data.provider.toUpperCase()}</Badge>}
              </div>
            </div>
          </CardContent>

          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button onClick={handleConfigure} className="p-1 rounded bg-background/80 hover:bg-background shadow-sm"><Settings className="w-3 h-3" /></button>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleConfigure}><Settings className="w-4 h-4 mr-2" />Configure</ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}><Copy className="w-4 h-4 mr-2" />Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})

CustomNode.displayName = 'CustomNode'

interface ContainerNodeProps {
  id: string
  data: {
    label: string
    icon?: string
    provider?: string
    componentId?: string
    component?: string
    security?: { nsg?: boolean; firewall?: boolean; waf?: boolean; ddos?: boolean; encryption?: boolean }
  }
  selected: boolean
  style?: React.CSSProperties
}

export const ContainerNode = memo(function ContainerNode({ id, data, selected, style }: ContainerNodeProps) {
  const { deleteElements, setNodes, getNodes } = useReactFlow()
  const componentId = data.componentId || data.component || ''
  const category = getComponentCategory(componentId)

  const getProviderBg = () => {
    switch (data.provider) {
      case 'aws': return 'bg-orange-500/5 border-orange-300'
      case 'azure': return 'bg-blue-500/5 border-blue-300'
      case 'gcp': return 'bg-red-500/5 border-red-300'
      default: return 'bg-muted/30 border-border'
    }
  }

  const handleDelete = () => deleteElements({ nodes: [{ id }] })

  const handleConfigure = () => {
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }

  const handleDuplicate = () => {
    const nodes = getNodes()
    const currentNode = nodes.find(n => n.id === id)
    if (!currentNode) return
    const newNode = {
      ...currentNode,
      id: `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: { x: currentNode.position.x + 30, y: currentNode.position.y + 30 },
      selected: false,
    }
    setNodes([...nodes, newNode])
  }

  const CategoryIcon = getCategoryIcon(category)

  // Get dimensions from style or use defaults
  const width = style?.width || 400
  const height = style?.height || 300

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`rounded-lg border-2 border-dashed relative group ${selected ? 'ring-2 ring-primary ring-offset-2' : ''} ${getProviderBg()}`}
          style={{ width, height, minWidth: 250, minHeight: 150 }}
        >
          <NodeResizer minWidth={250} minHeight={150} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-primary border-2 border-background rounded" />

          {data.security?.nsg && <SecurityIndicator type="nsg" />}
          {data.security?.firewall && <div className="absolute -top-2 right-6"><SecurityIndicator type="firewall" /></div>}

          <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" />
          <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" />

          <div className="absolute top-0 left-0 right-0 px-3 py-2 border-b border-dashed flex items-center gap-2 bg-background/50 rounded-t-lg">
            {data.icon ? <span className="text-xl">{data.icon}</span> : <CategoryIcon className="w-5 h-5 text-muted-foreground" />}
            <span className="font-medium text-sm">{data.label}</span>
            {data.provider && <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">{data.provider.toUpperCase()}</Badge>}
          </div>

          <div className="absolute inset-0 top-10 flex items-center justify-center text-muted-foreground/50 text-sm pointer-events-none">Drop components here</div>

          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button onClick={handleConfigure} className="p-1 rounded bg-background/80 hover:bg-background shadow-sm"><Settings className="w-3 h-3" /></button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleConfigure}><Settings className="w-4 h-4 mr-2" />Configure</ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}><Copy className="w-4 h-4 mr-2" />Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})

ContainerNode.displayName = 'ContainerNode'
