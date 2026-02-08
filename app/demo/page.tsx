'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoIcon } from '@/components/logo'
import { ArrowRight, Info } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const demoNodes: Node[] = [
  {
    id: 'rg-1',
    type: 'default',
    position: { x: 400, y: 0 },
    data: { label: '📦 Resource Group\nproduction-rg' },
    style: { background: '#dbeafe', border: '2px solid #3b82f6', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'vnet-1',
    type: 'default',
    position: { x: 150, y: 120 },
    data: { label: '🌐 Virtual Network\n10.0.0.0/16' },
    style: { background: '#dbeafe', border: '2px solid #2563eb', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'lb-1',
    type: 'default',
    position: { x: 600, y: 120 },
    data: { label: '⚖️ Load Balancer\napp-lb' },
    style: { background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'vm-1',
    type: 'default',
    position: { x: 50, y: 280 },
    data: { label: '🖥️ VM (Web Server)\nStandard_D2s_v3' },
    style: { background: '#dcfce7', border: '2px solid #22c55e', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'vm-2',
    type: 'default',
    position: { x: 300, y: 280 },
    data: { label: '🖥️ VM (API Server)\nStandard_D4s_v3' },
    style: { background: '#dcfce7', border: '2px solid #22c55e', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'db-1',
    type: 'default',
    position: { x: 550, y: 280 },
    data: { label: '🗄️ Azure SQL\nS2 Standard' },
    style: { background: '#fae8ff', border: '2px solid #a855f7', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'storage-1',
    type: 'default',
    position: { x: 150, y: 440 },
    data: { label: '💾 Blob Storage\nLRS / Hot' },
    style: { background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
  {
    id: 'redis-1',
    type: 'default',
    position: { x: 450, y: 440 },
    data: { label: '⚡ Redis Cache\nC1 Standard' },
    style: { background: '#fef3c7', border: '2px solid #ef4444', borderRadius: 12, padding: 16, fontSize: 13, width: 200, textAlign: 'center' as const },
  },
]

const demoEdges: Edge[] = [
  { id: 'e1', source: 'rg-1', target: 'vnet-1', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2', source: 'rg-1', target: 'lb-1', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e3', source: 'vnet-1', target: 'vm-1', style: { stroke: '#22c55e' } },
  { id: 'e4', source: 'vnet-1', target: 'vm-2', style: { stroke: '#22c55e' } },
  { id: 'e5', source: 'lb-1', target: 'vm-1', style: { stroke: '#f59e0b', strokeDasharray: '5,5' } },
  { id: 'e6', source: 'lb-1', target: 'vm-2', style: { stroke: '#f59e0b', strokeDasharray: '5,5' } },
  { id: 'e7', source: 'vm-2', target: 'db-1', style: { stroke: '#a855f7' } },
  { id: 'e8', source: 'vm-1', target: 'storage-1', style: { stroke: '#f43f5e' } },
  { id: 'e9', source: 'vm-2', target: 'redis-1', style: { stroke: '#ef4444' } },
]

const costBreakdown = [
  { name: 'VMs (2x)', cost: '$185/mo' },
  { name: 'Load Balancer', cost: '$25/mo' },
  { name: 'Azure SQL S2', cost: '$75/mo' },
  { name: 'Blob Storage', cost: '$5/mo' },
  { name: 'Redis Cache C1', cost: '$40/mo' },
  { name: 'VNet + NSG', cost: '$0/mo' },
]

export default function DemoPage() {
  const [nodes, , onNodesChange] = useNodesState(demoNodes)
  const [edges, , onEdgesChange] = useEdgesState(demoEdges)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon size={24} />
              <span className="font-bold text-xl">JobStack</span>
            </Link>
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950">
              <Info className="h-3 w-3 mr-1" />
              Demo — Read Only
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/register">
              <Button>
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Cost sidebar */}
        <aside className="w-64 border-r bg-card p-4 overflow-y-auto hidden md:block">
          <h3 className="font-semibold text-sm mb-3">Estimated Monthly Cost</h3>
          <div className="text-2xl font-bold text-primary mb-4">$330/mo</div>
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-mono">{item.cost}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <h3 className="font-semibold text-sm mb-2">Architecture</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Production Azure infrastructure with load-balanced web &amp; API servers,
            managed SQL database, Redis cache, and blob storage. VNet isolation
            with NSG rules.
          </p>
          <hr className="my-4" />
          <h3 className="font-semibold text-sm mb-2">Try it yourself</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Create a free account to build, export Terraform, and collaborate.
          </p>
          <Link href="/register" className="block">
            <Button size="sm" className="w-full">Get Started Free</Button>
          </Link>
        </aside>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
          >
            <Background gap={16} size={1} />
            <Controls position="bottom-right" />
            <MiniMap
              position="bottom-left"
              nodeStrokeWidth={3}
              style={{ height: 100, width: 160 }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
