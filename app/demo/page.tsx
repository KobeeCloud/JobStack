'use client'

import { useState, memo } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogoIcon } from '@/components/logo'
import { ArrowRight, ExternalLink, DollarSign, Code2, GitBranch } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

// ─────────────────────────────────────────────────────────────────────────────
// Custom node types (styled to match JobStack UI, no useReactFlow deps)
// ─────────────────────────────────────────────────────────────────────────────

type ServiceNodeData = {
  label: string
  sub: string
  icon: React.ReactNode
  provider: 'azure'
  category: 'compute' | 'network' | 'database' | 'security' | 'storage'
}

const CATEGORY_COLORS: Record<
  ServiceNodeData['category'],
  { border: string; bg: string; text: string }
> = {
  compute: { border: '#22c55e', bg: 'rgba(34,197,94,0.08)', text: '#16a34a' },
  network: { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', text: '#2563eb' },
  database: { border: '#a855f7', bg: 'rgba(168,85,247,0.08)', text: '#9333ea' },
  security: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#d97706' },
  storage: { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)', text: '#0891b2' },
}

const ServiceNode = memo(function ServiceNode({ data, selected }: NodeProps) {
  const d = data as unknown as ServiceNodeData
  const colors = CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.compute

  return (
    <div
      className="rounded-xl border-2 px-3 py-2.5 shadow-sm min-w-[130px] transition-shadow"
      style={{
        borderColor: selected ? colors.border : `${colors.border}aa`,
        backgroundColor: colors.bg,
        boxShadow: selected ? `0 0 0 2px ${colors.border}55` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-border !border-none !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ color: colors.text }} className="text-sm">
          {d.icon as React.ReactNode}
        </span>
        <span className="text-[11px] font-semibold" style={{ color: colors.text }}>
          {d.label}
        </span>
      </div>
      <p className="text-[9.5px] text-muted-foreground ml-5">{d.sub}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border !border-none !w-2 !h-2"
      />
    </div>
  )
})

const ContainerGroupNode = memo(function ContainerGroupNode({ data, selected }: NodeProps) {
  const d = data as { label: string; sub?: string; color?: string }
  const color = d.color ?? '#64748b'

  return (
    <div
      className="rounded-2xl border-2 border-dashed h-full w-full"
      style={{
        borderColor: selected ? color : `${color}66`,
        backgroundColor: `${color}08`,
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 rounded-br-xl rounded-tl-xl px-3 py-1"
        style={{
          backgroundColor: `${color}18`,
          borderBottom: `1px solid ${color}33`,
          borderRight: `1px solid ${color}33`,
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
          {d.label}
        </span>
        {d.sub && (
          <span className="text-[9px] opacity-60" style={{ color }}>
            {d.sub}
          </span>
        )}
      </div>
    </div>
  )
})

const nodeTypes = {
  service: ServiceNode,
  container: ContainerGroupNode,
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial graph — Azure 3-tier architecture
// ─────────────────────────────────────────────────────────────────────────────

const initialNodes: Node[] = [
  // Resource Group container
  {
    id: 'rg',
    type: 'container',
    position: { x: 60, y: 30 },
    data: { label: 'Resource Group', sub: 'production-rg', color: '#3b82f6' },
    style: { width: 780, height: 460 },
  },
  // VNet container (inside RG)
  {
    id: 'vnet',
    type: 'container',
    position: { x: 80, y: 70 },
    data: { label: 'Virtual Network', sub: '10.0.0.0/16', color: '#6366f1' },
    style: { width: 620, height: 340 },
    parentId: 'rg',
    extent: 'parent' as const,
  },
  // Subnet – Gateway
  {
    id: 'sub-gw',
    type: 'container',
    position: { x: 30, y: 70 },
    data: { label: 'GW Subnet', sub: '10.0.0.0/27', color: '#3b82f6' },
    style: { width: 170, height: 200 },
    parentId: 'vnet',
    extent: 'parent' as const,
  },
  // Subnet – Web
  {
    id: 'sub-web',
    type: 'container',
    position: { x: 220, y: 70 },
    data: { label: 'Web Subnet', sub: '10.0.1.0/24', color: '#22c55e' },
    style: { width: 180, height: 200 },
    parentId: 'vnet',
    extent: 'parent' as const,
  },
  // Subnet – DB
  {
    id: 'sub-db',
    type: 'container',
    position: { x: 420, y: 70 },
    data: { label: 'DB Subnet', sub: '10.0.2.0/24', color: '#a855f7' },
    style: { width: 160, height: 200 },
    parentId: 'vnet',
    extent: 'parent' as const,
  },
  // App Gateway
  {
    id: 'agw',
    type: 'service',
    position: { x: 20, y: 100 },
    data: {
      label: 'App Gateway',
      sub: 'WAF v2',
      icon: '⚖️',
      provider: 'azure',
      category: 'network',
    },
    parentId: 'sub-gw',
    extent: 'parent' as const,
  },
  // VM 1
  {
    id: 'vm1',
    type: 'service',
    position: { x: 20, y: 60 },
    data: {
      label: 'Web VM 01',
      sub: 'Standard_D2s_v3',
      icon: '🖥️',
      provider: 'azure',
      category: 'compute',
    },
    parentId: 'sub-web',
    extent: 'parent' as const,
  },
  // VM 2
  {
    id: 'vm2',
    type: 'service',
    position: { x: 20, y: 130 },
    data: {
      label: 'Web VM 02',
      sub: 'Standard_D2s_v3',
      icon: '🖥️',
      provider: 'azure',
      category: 'compute',
    },
    parentId: 'sub-web',
    extent: 'parent' as const,
  },
  // SQL
  {
    id: 'sql',
    type: 'service',
    position: { x: 15, y: 90 },
    data: {
      label: 'Azure SQL',
      sub: 'S2 Standard',
      icon: '🗄️',
      provider: 'azure',
      category: 'database',
    },
    parentId: 'sub-db',
    extent: 'parent' as const,
  },
  // Key Vault — outside VNet
  {
    id: 'kv',
    type: 'service',
    position: { x: 740, y: 160 },
    data: {
      label: 'Key Vault',
      sub: 'Standard SKU',
      icon: '🔑',
      provider: 'azure',
      category: 'security',
    },
    parentId: 'rg',
    extent: 'parent' as const,
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'agw',
    target: 'vm1',
    animated: true,
    style: { strokeDasharray: '5 3', strokeWidth: 1.5 },
    label: 'flow',
  },
  {
    id: 'e2',
    source: 'agw',
    target: 'vm2',
    animated: true,
    style: { strokeDasharray: '5 3', strokeWidth: 1.5 },
  },
  { id: 'e3', source: 'vm1', target: 'sql', style: { strokeWidth: 1.5 }, label: 'dependency' },
  { id: 'e4', source: 'vm2', target: 'sql', style: { strokeWidth: 1.5 } },
  {
    id: 'e5',
    source: 'vm1',
    target: 'kv',
    style: { strokeWidth: 1.5, strokeDasharray: '3 3' },
    label: 'secrets',
  },
  { id: 'e6', source: 'vm2', target: 'kv', style: { strokeWidth: 1.5, strokeDasharray: '3 3' } },
]

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar content
// ─────────────────────────────────────────────────────────────────────────────

const SIDEBAR_TABS = ['Cost', 'Terraform', 'CI/CD'] as const
type SidebarTab = (typeof SIDEBAR_TABS)[number]

const TERRAFORM_SNIPPET = `# Auto-generated by JobStack

resource "azurerm_virtual_network" "prod_vnet" {
  name          = "prod-vnet"
  address_space = ["10.0.0.0/16"]
  location      = var.location
}

resource "azurerm_subnet_network_security_group_association" "nsg_assoc" {
  subnet_id = azurerm_subnet.web_subnet.id
  network_security_group_id = (
    azurerm_network_security_group.prod_nsg.id
  )
}

resource "azurerm_lb_backend_address_pool" "pool_lb" {
  loadbalancer_id = azurerm_lb.prod_lb.id
  name            = "BackendPool"
}`

const CICD_SNIPPET = `# Auto-generated by JobStack

name: Deploy Azure Infra
on:
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUB_ID }}
      - run: |
          terraform init
          terraform plan  -out=tfplan
      - if: github.ref == 'refs/heads/main'
        run: terraform apply tfplan`

function SidebarCost() {
  const items = [
    { icon: <span>⚖️</span>, name: 'App Gateway WAF v2', cost: '$145', pct: 35, color: '#3b82f6' },
    { icon: <span>🖥️</span>, name: 'VMs × 2 D2s_v3', cost: '$148', pct: 36, color: '#22c55e' },
    { icon: <span>🗄️</span>, name: 'Azure SQL S2', cost: '$75', pct: 18, color: '#a855f7' },
    { icon: <span>🔑</span>, name: 'Key Vault', cost: '$5', pct: 1, color: '#f59e0b' },
  ]
  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Est. Monthly</p>
        <p className="text-3xl font-bold text-primary mt-0.5">
          $373<span className="text-base font-normal text-muted-foreground"> /mo</span>
        </p>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.name}>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {item.icon}
                <span>{item.name}</span>
              </div>
              <span className="font-mono font-semibold">{item.cost}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground pt-2 border-t">
        Prices reflect East US region. Actual costs may vary.
      </p>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-zinc-950 rounded-lg overflow-auto font-mono text-[10px] leading-relaxed p-3 h-full text-zinc-300 whitespace-pre">
      {code}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [activeTab, setActiveTab] = useState<SidebarTab>('Cost')

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon size={22} />
            <span className="font-bold">JobStack</span>
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">prod-azure-3tier</span>
            <Badge variant="outline" className="text-[10px] py-0 border-blue-500/30 text-blue-500">
              Azure
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] py-0 border-emerald-500/30 text-emerald-600"
            >
              Demo
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/register">
            <Button size="sm">
              Start Building Free <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r flex flex-col shrink-0 bg-muted/20">
          {/* Tabs */}
          <div className="flex border-b shrink-0">
            {SIDEBAR_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all',
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {tab === 'Cost' && <DollarSign className="h-3 w-3" />}
                {tab === 'Terraform' && <Code2 className="h-3 w-3" />}
                {tab === 'CI/CD' && <GitBranch className="h-3 w-3" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'Cost' && <SidebarCost />}
            {activeTab === 'Terraform' && (
              <div className="p-3 h-full">
                <CodeBlock code={TERRAFORM_SNIPPET} />
              </div>
            )}
            {activeTab === 'CI/CD' && (
              <div className="p-3 h-full">
                <CodeBlock code={CICD_SNIPPET} />
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="p-3 border-t shrink-0">
            <Link href="/register">
              <Button className="w-full" size="sm" variant="outline">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open in editor
              </Button>
            </Link>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="hsl(var(--border))" />
            <Controls className="!border-border !bg-background !shadow-sm" />
            <MiniMap
              className="!border-border !bg-background/80 !rounded-lg"
              nodeColor={n => {
                const d = n.data as ServiceNodeData
                return d.category ? (CATEGORY_COLORS[d.category]?.border ?? '#64748b') : '#64748b'
              }}
            />
          </ReactFlow>

          {/* Floating info pill */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-background/90 backdrop-blur border rounded-full px-3 py-1.5 text-xs text-muted-foreground shadow-sm pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Read-only demo — start free to edit
          </div>
        </div>
      </div>
    </div>
  )
}
