'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Node, Edge } from '@xyflow/react'

/*
 * Quick Build Modal
 * Generates a batch of nodes (and optional edges) representing common
 * infrastructure patterns so users can scaffold a diagram in seconds.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PatternParam {
  key: string
  label: string
  type: 'text' | 'number'
  default: string | number
  min?: number
  max?: number
}

interface PatternNodeTemplate {
  id: string              // unique within pattern (used in edge source/target)
  componentId: string     // catalog component id
  label: string           // display label (may include {{prefix}}, {{cidr}})
  category: string
  provider: 'azure' | 'aws' | 'gcp'
  isContainer?: boolean
  width?: number
  height?: number
  x: number
  y: number
  parentTemplateId?: string  // nesting inside a container node
  config?: Record<string, unknown>
}

interface PatternEdgeTemplate {
  from: string
  to: string
}

interface QuickBuildPattern {
  id: string
  name: string
  description: string
  icon: string
  provider: 'azure' | 'aws' | 'gcp'
  tags: string[]
  params: PatternParam[]
  nodes: PatternNodeTemplate[]
  edges?: PatternEdgeTemplate[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern definitions
// ─────────────────────────────────────────────────────────────────────────────

const PATTERNS: QuickBuildPattern[] = [
  // ── Azure ──────────────────────────────────────────────────────────────────
  {
    id: 'azure-basic-vm',
    name: 'Azure – Basic VM Workload',
    description: 'Resource Group → VNet → Subnet → NSG + N × VMs. Perfect starting point for lift-and-shift migrations.',
    icon: '🖥️',
    provider: 'azure',
    tags: ['VM', 'VNet', 'IaaS'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'prod' },
      { key: 'cidr', label: 'VNet CIDR', type: 'text', default: '10.0.0.0/16' },
      { key: 'subnetCidr', label: 'Subnet CIDR', type: 'text', default: '10.0.1.0/24' },
      { key: 'vmCount', label: 'Number of VMs', type: 'number', default: 2, min: 1, max: 10 },
    ],
    nodes: [
      { id: 'rg', componentId: 'azure-resource-group', label: '{{prefix}}-rg', category: 'management', provider: 'azure', isContainer: true, width: 1000, height: 700, x: 50, y: 50 },
      { id: 'vnet', componentId: 'azure-virtual-network', label: '{{prefix}}-vnet ({{cidr}})', category: 'networking', provider: 'azure', isContainer: true, width: 800, height: 500, x: 80, y: 100, parentTemplateId: 'rg', config: { address_space: ['{{cidr}}'] } },
      { id: 'subnet', componentId: 'azure-subnet', label: '{{prefix}}-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 600, height: 280, x: 80, y: 120, parentTemplateId: 'vnet', config: { address_prefixes: ['{{subnetCidr}}'] } },
      { id: 'nsg', componentId: 'azure-network-security-group', label: '{{prefix}}-nsg', category: 'networking', provider: 'azure', x: 80, y: 380, parentTemplateId: 'vnet' },
    ],
    edges: [
      { from: 'nsg', to: 'subnet' },
    ],
  },
  {
    id: 'azure-aks-platform',
    name: 'Azure – AKS Platform',
    description: 'Dedicated VNet with system + user node pool subnets, AKS cluster, and Azure Container Registry with private endpoint.',
    icon: '☸️',
    provider: 'azure',
    tags: ['AKS', 'Kubernetes', 'Containers'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'aks-prod' },
      { key: 'cidr', label: 'VNet CIDR', type: 'text', default: '10.10.0.0/16' },
    ],
    nodes: [
      { id: 'rg', componentId: 'azure-resource-group', label: '{{prefix}}-rg', category: 'management', provider: 'azure', isContainer: true, width: 1100, height: 750, x: 50, y: 50 },
      { id: 'vnet', componentId: 'azure-virtual-network', label: '{{prefix}}-vnet', category: 'networking', provider: 'azure', isContainer: true, width: 850, height: 500, x: 80, y: 100, parentTemplateId: 'rg' },
      { id: 'sysSubnet', componentId: 'azure-subnet', label: 'system-nodepool-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 330, height: 200, x: 80, y: 130, parentTemplateId: 'vnet', config: { address_prefixes: ['10.10.1.0/24'] } },
      { id: 'userSubnet', componentId: 'azure-subnet', label: 'user-nodepool-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 330, height: 200, x: 450, y: 130, parentTemplateId: 'vnet', config: { address_prefixes: ['10.10.2.0/24'] } },
      { id: 'aks', componentId: 'azure-kubernetes-service', label: '{{prefix}}-aks', category: 'compute', provider: 'azure', x: 120, y: 420, parentTemplateId: 'rg' },
      { id: 'acr', componentId: 'azure-container-registry', label: '{{prefix}}acr', category: 'containers', provider: 'azure', x: 500, y: 420, parentTemplateId: 'rg' },
    ],
    edges: [
      { from: 'aks', to: 'acr' },
    ],
  },
  {
    id: 'azure-3tier',
    name: 'Azure – 3-Tier Secure Web App',
    description: 'App Gateway (DMZ) → Web tier → App tier → DB tier. NSG on each subnet, Azure SQL in the backend.',
    icon: '🏛️',
    provider: 'azure',
    tags: ['3-tier', 'SQL', 'AppGateway'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'webapp' },
      { key: 'cidr', label: 'VNet CIDR', type: 'text', default: '10.20.0.0/16' },
    ],
    nodes: [
      { id: 'rg', componentId: 'azure-resource-group', label: '{{prefix}}-rg', category: 'management', provider: 'azure', isContainer: true, width: 1200, height: 900, x: 50, y: 50 },
      { id: 'vnet', componentId: 'azure-virtual-network', label: '{{prefix}}-vnet', category: 'networking', provider: 'azure', isContainer: true, width: 1000, height: 650, x: 80, y: 100, parentTemplateId: 'rg' },
      { id: 'subGw', componentId: 'azure-subnet', label: 'AppGatewaySubnet', category: 'networking', provider: 'azure', isContainer: true, width: 260, height: 160, x: 80, y: 120, parentTemplateId: 'vnet', config: { address_prefixes: ['10.20.0.0/26'] } },
      { id: 'subWeb', componentId: 'azure-subnet', label: 'web-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 280, height: 160, x: 380, y: 120, parentTemplateId: 'vnet', config: { address_prefixes: ['10.20.1.0/24'] } },
      { id: 'subApp', componentId: 'azure-subnet', label: 'app-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 280, height: 160, x: 380, y: 320, parentTemplateId: 'vnet', config: { address_prefixes: ['10.20.2.0/24'] } },
      { id: 'subDb', componentId: 'azure-subnet', label: 'db-subnet', category: 'networking', provider: 'azure', isContainer: true, width: 280, height: 160, x: 380, y: 480, parentTemplateId: 'vnet', config: { address_prefixes: ['10.20.3.0/24'], delegation: 'Microsoft.DBforPostgreSQL/flexibleServers' } },
      { id: 'agw', componentId: 'azure-application-gateway', label: '{{prefix}}-appgw', category: 'networking', provider: 'azure', x: 90, y: 150, parentTemplateId: 'subGw' },
      { id: 'nsgWeb', componentId: 'azure-network-security-group', label: 'nsg-web', category: 'networking', provider: 'azure', x: 700, y: 140, parentTemplateId: 'vnet' },
      { id: 'nsgApp', componentId: 'azure-network-security-group', label: 'nsg-app', category: 'networking', provider: 'azure', x: 700, y: 340, parentTemplateId: 'vnet' },
      { id: 'nsgDb', componentId: 'azure-network-security-group', label: 'nsg-db', category: 'networking', provider: 'azure', x: 700, y: 500, parentTemplateId: 'vnet' },
      { id: 'vm1', componentId: 'azure-virtual-machine', label: '{{prefix}}-web-vm1', category: 'compute', provider: 'azure', x: 200, y: 150, parentTemplateId: 'subWeb' },
      { id: 'vm2', componentId: 'azure-virtual-machine', label: '{{prefix}}-app-vm1', category: 'compute', provider: 'azure', x: 200, y: 350, parentTemplateId: 'subApp' },
      { id: 'sql', componentId: 'azure-sql-database', label: '{{prefix}}-sqldb', category: 'database', provider: 'azure', x: 200, y: 510, parentTemplateId: 'subDb' },
    ],
    edges: [
      { from: 'agw', to: 'vm1' },
      { from: 'vm1', to: 'vm2' },
      { from: 'vm2', to: 'sql' },
      { from: 'nsgWeb', to: 'subWeb' },
      { from: 'nsgApp', to: 'subApp' },
      { from: 'nsgDb', to: 'subDb' },
    ],
  },

  // ── AWS ────────────────────────────────────────────────────────────────────
  {
    id: 'aws-basic-ec2',
    name: 'AWS – Basic EC2 + ALB',
    description: 'VPC with public + private subnets across 2 AZs, IGW, NAT GW, ALB, Security Group, and N × EC2 instances.',
    icon: '⚙️',
    provider: 'aws',
    tags: ['EC2', 'ALB', 'VPC', 'IaaS'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'prod' },
      { key: 'cidr', label: 'VPC CIDR', type: 'text', default: '10.0.0.0/16' },
      { key: 'ec2Count', label: 'Number of EC2 instances', type: 'number', default: 2, min: 1, max: 6 },
    ],
    nodes: [
      { id: 'vpc', componentId: 'aws-vpc', label: '{{prefix}}-vpc ({{cidr}})', category: 'networking', provider: 'aws', isContainer: true, width: 1100, height: 700, x: 50, y: 50, config: { cidr_block: '{{cidr}}', enable_dns_hostnames: true } },
      { id: 'pubSub', componentId: 'aws-subnet', label: 'public-subnet-1a', category: 'networking', provider: 'aws', isContainer: true, width: 420, height: 200, x: 80, y: 100, parentTemplateId: 'vpc', config: { cidr_block: '10.0.1.0/24', availability_zone: 'a', map_public_ip_on_launch: true } },
      { id: 'privSub', componentId: 'aws-subnet', label: 'private-subnet-1a', category: 'networking', provider: 'aws', isContainer: true, width: 420, height: 200, x: 580, y: 100, parentTemplateId: 'vpc', config: { cidr_block: '10.0.2.0/24', availability_zone: 'a' } },
      { id: 'igw', componentId: 'aws-internet-gateway', label: '{{prefix}}-igw', category: 'networking', provider: 'aws', x: 80, y: 430, parentTemplateId: 'vpc' },
      { id: 'nat', componentId: 'aws-nat-gateway', label: '{{prefix}}-nat', category: 'networking', provider: 'aws', x: 250, y: 430, parentTemplateId: 'vpc' },
      { id: 'sg', componentId: 'aws-security-group', label: '{{prefix}}-sg-web', category: 'networking', provider: 'aws', x: 450, y: 430, parentTemplateId: 'vpc' },
      { id: 'alb', componentId: 'aws-alb', label: '{{prefix}}-alb', category: 'networking', provider: 'aws', x: 650, y: 430, parentTemplateId: 'vpc', config: { load_balancer_type: 'application' } },
      { id: 'ec2a', componentId: 'aws-ec2', label: '{{prefix}}-ec2-1', category: 'compute', provider: 'aws', x: 90, y: 130, parentTemplateId: 'privSub' },
      { id: 'ec2b', componentId: 'aws-ec2', label: '{{prefix}}-ec2-2', category: 'compute', provider: 'aws', x: 250, y: 130, parentTemplateId: 'privSub' },
    ],
    edges: [
      { from: 'igw', to: 'pubSub' },
      { from: 'nat', to: 'privSub' },
      { from: 'alb', to: 'ec2a' },
      { from: 'alb', to: 'ec2b' },
    ],
  },
  {
    id: 'aws-serverless-api',
    name: 'AWS – Serverless API',
    description: 'API Gateway → Lambda (Node.js 20) → DynamoDB. Zero-infrastructure, pay-per-request pattern.',
    icon: '⚡',
    provider: 'aws',
    tags: ['Lambda', 'Serverless', 'API Gateway'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'api' },
    ],
    nodes: [
      { id: 'apigw', componentId: 'aws-api-gateway', label: '{{prefix}}-gateway', category: 'appservices', provider: 'aws', x: 100, y: 200 },
      { id: 'lambda', componentId: 'aws-lambda', label: '{{prefix}}-handler', category: 'appservices', provider: 'aws', x: 400, y: 200, config: { runtime: 'nodejs20.x', architectures: ['arm64'], timeout: 30 } },
      { id: 'dynamo', componentId: 'aws-dynamodb', label: '{{prefix}}-table', category: 'database', provider: 'aws', x: 700, y: 200 },
      { id: 'sqs', componentId: 'aws-sqs', label: '{{prefix}}-dlq', category: 'messaging', provider: 'aws', x: 400, y: 420 },
    ],
    edges: [
      { from: 'apigw', to: 'lambda' },
      { from: 'lambda', to: 'dynamo' },
      { from: 'lambda', to: 'sqs' },
    ],
  },
  {
    id: 'aws-eks',
    name: 'AWS – EKS Cluster',
    description: 'VPC with 2 private subnets across 2 AZs, EKS cluster, ECR registry, and ALB Ingress.',
    icon: '🐳',
    provider: 'aws',
    tags: ['EKS', 'Kubernetes', 'Containers'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'eks-prod' },
      { key: 'cidr', label: 'VPC CIDR', type: 'text', default: '10.30.0.0/16' },
    ],
    nodes: [
      { id: 'vpc', componentId: 'aws-vpc', label: '{{prefix}}-vpc', category: 'networking', provider: 'aws', isContainer: true, width: 1100, height: 700, x: 50, y: 50, config: { enable_dns_hostnames: true } },
      { id: 'sub1', componentId: 'aws-subnet', label: 'private-subnet-1a', category: 'networking', provider: 'aws', isContainer: true, width: 420, height: 200, x: 80, y: 100, parentTemplateId: 'vpc', config: { availability_zone: 'a' } },
      { id: 'sub2', componentId: 'aws-subnet', label: 'private-subnet-1b', category: 'networking', provider: 'aws', isContainer: true, width: 420, height: 200, x: 580, y: 100, parentTemplateId: 'vpc', config: { availability_zone: 'b' } },
      { id: 'natgw', componentId: 'aws-nat-gateway', label: '{{prefix}}-nat', category: 'networking', provider: 'aws', x: 80, y: 430, parentTemplateId: 'vpc' },
      { id: 'eks', componentId: 'aws-eks', label: '{{prefix}}-cluster', category: 'compute', provider: 'aws', x: 300, y: 430, parentTemplateId: 'vpc' },
      { id: 'ecr', componentId: 'aws-ecr', label: '{{prefix}}-ecr', category: 'containers', provider: 'aws', x: 600, y: 430, parentTemplateId: 'vpc' },
    ],
    edges: [
      { from: 'eks', to: 'ecr' },
    ],
  },

  // ── GCP ────────────────────────────────────────────────────────────────────
  {
    id: 'gcp-compute-stack',
    name: 'GCP – Compute Stack',
    description: 'VPC → Subnet → Firewall rules + N × Compute Instances behind a Cloud Load Balancer.',
    icon: '🌐',
    provider: 'gcp',
    tags: ['Compute Engine', 'VPC', 'Cloud LB'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'prod' },
      { key: 'cidr', label: 'Subnet CIDR', type: 'text', default: '10.0.0.0/20' },
      { key: 'vmCount', label: 'Number of VMs', type: 'number', default: 2, min: 1, max: 6 },
    ],
    nodes: [
      { id: 'vpc', componentId: 'gcp-vpc', label: '{{prefix}}-vpc', category: 'networking', provider: 'gcp', isContainer: true, width: 1000, height: 700, x: 50, y: 50, config: { auto_create_subnetworks: false, routing_mode: 'REGIONAL' } },
      { id: 'subnet', componentId: 'gcp-subnet', label: '{{prefix}}-subnet ({{cidr}})', category: 'networking', provider: 'gcp', isContainer: true, width: 700, height: 280, x: 80, y: 100, parentTemplateId: 'vpc', config: { private_ip_google_access: true } },
      { id: 'fw', componentId: 'gcp-firewall', label: '{{prefix}}-fw-allow-http', category: 'networking', provider: 'gcp', x: 80, y: 450, parentTemplateId: 'vpc', config: { direction: 'INGRESS', priority: 1000, allow_ports: 'tcp:80,tcp:443', source_ranges: '0.0.0.0/0' } },
      { id: 'vm1', componentId: 'gcp-compute-instance', label: '{{prefix}}-vm-1', category: 'compute', provider: 'gcp', x: 90, y: 110, parentTemplateId: 'subnet' },
      { id: 'vm2', componentId: 'gcp-compute-instance', label: '{{prefix}}-vm-2', category: 'compute', provider: 'gcp', x: 350, y: 110, parentTemplateId: 'subnet' },
      { id: 'lb', componentId: 'gcp-cloud-lb', label: '{{prefix}}-lb', category: 'networking', provider: 'gcp', x: 450, y: 450, parentTemplateId: 'vpc', config: { load_balancing_scheme: 'EXTERNAL_MANAGED', protocol: 'HTTPS' } },
    ],
    edges: [
      { from: 'lb', to: 'vm1' },
      { from: 'lb', to: 'vm2' },
    ],
  },
  {
    id: 'gcp-gke',
    name: 'GCP – GKE Cluster',
    description: 'Dedicated VPC + subnet with Private Google Access, GKE Autopilot cluster, and Cloud Storage bucket for artifacts.',
    icon: '☸️',
    provider: 'gcp',
    tags: ['GKE', 'Kubernetes', 'Autopilot'],
    params: [
      { key: 'prefix', label: 'Name prefix', type: 'text', default: 'gke-prod' },
      { key: 'region', label: 'Region', type: 'text', default: 'us-central1' },
    ],
    nodes: [
      { id: 'vpc', componentId: 'gcp-vpc', label: '{{prefix}}-vpc', category: 'networking', provider: 'gcp', isContainer: true, width: 1000, height: 650, x: 50, y: 50, config: { routing_mode: 'REGIONAL' } },
      { id: 'subnet', componentId: 'gcp-subnet', label: '{{prefix}}-nodes-subnet', category: 'networking', provider: 'gcp', isContainer: true, width: 700, height: 280, x: 80, y: 100, parentTemplateId: 'vpc', config: { private_ip_google_access: true, purpose: 'PRIVATE', log_config_enable: true } },
      { id: 'fw', componentId: 'gcp-firewall', label: '{{prefix}}-fw-internal', category: 'networking', provider: 'gcp', x: 80, y: 430, parentTemplateId: 'vpc', config: { direction: 'INGRESS', source_tags: ['k8s-node'] } },
      { id: 'gke', componentId: 'gcp-gke', label: '{{prefix}}-cluster', category: 'compute', provider: 'gcp', x: 350, y: 430, parentTemplateId: 'vpc' },
      { id: 'gcs', componentId: 'gcp-cloud-storage', label: '{{prefix}}-artifacts', category: 'storage', provider: 'gcp', x: 650, y: 430, parentTemplateId: 'vpc', config: { storage_class: 'STANDARD', uniform_bucket_level_access: true } },
    ],
    edges: [
      { from: 'gke', to: 'gcs' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Template interpolation helper
// ─────────────────────────────────────────────────────────────────────────────

function interpolate(str: string, params: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? `{{${key}}}`)
}

function interpolateDeep(obj: unknown, params: Record<string, string>): unknown {
  if (typeof obj === 'string') return interpolate(obj, params)
  if (Array.isArray(obj)) return obj.map((item) => interpolateDeep(item, params))
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = interpolateDeep(v, params)
    }
    return result
  }
  return obj
}

// ─────────────────────────────────────────────────────────────────────────────
// Node/edge generator
// ─────────────────────────────────────────────────────────────────────────────

function buildNodesAndEdges(
  pattern: QuickBuildPattern,
  params: Record<string, string>,
  canvasOffset: { x: number; y: number } = { x: 100, y: 100 }
): { nodes: Node[]; edges: Edge[] } {
  const idMap: Record<string, string> = {}
  const now = Date.now()

  const nodes: Node[] = pattern.nodes.map((tmpl, idx) => {
    const realId = `node-${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`
    idMap[tmpl.id] = realId

    const label = interpolate(tmpl.label, params)
    const config = tmpl.config ? interpolateDeep(tmpl.config, params) as Record<string, unknown> : {}

    const parentRealId = tmpl.parentTemplateId ? idMap[tmpl.parentTemplateId] : undefined

    const isContainer = tmpl.isContainer ?? false
    const w = tmpl.width
    const h = tmpl.height

    return {
      id: realId,
      type: isContainer ? 'container' : 'custom',
      position: parentRealId
        ? { x: tmpl.x, y: tmpl.y }
        : { x: canvasOffset.x + tmpl.x, y: canvasOffset.y + tmpl.y },
      parentId: parentRealId,
      ...(parentRealId && { extent: 'parent' as const }),
      data: {
        label,
        componentId: tmpl.componentId,
        provider: tmpl.provider,
        category: tmpl.category,
        config,
        ...(isContainer && w && h && { width: w, height: h }),
      },
      ...(isContainer && w && h && { style: { width: w, height: h } }),
    } as Node
  })

  const edges: Edge[] = (pattern.edges ?? []).map((e, idx) => ({
    id: `edge-${now}-${idx}`,
    source: idMap[e.from] ?? e.from,
    target: idMap[e.to] ?? e.to,
  }))

  return { nodes, edges }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider badge colours
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDER_STYLES: Record<string, string> = {
  azure: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  aws: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  gcp: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface QuickBuildModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (nodes: Node[], edges: Edge[]) => void
}

export function QuickBuildModal({ open, onOpenChange, onApply }: QuickBuildModalProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string>(PATTERNS[0].id)
  const [paramValues, setParamValues] = useState<Record<string, Record<string, string>>>({})

  const selectedPattern = PATTERNS.find((p) => p.id === selectedPatternId) ?? PATTERNS[0]

  // Build context-aware param values (merging defaults with user changes)
  const getParams = (pattern: QuickBuildPattern): Record<string, string> => {
    const overrides = paramValues[pattern.id] ?? {}
    const result: Record<string, string> = {}
    for (const p of pattern.params) {
      result[p.key] = overrides[p.key] !== undefined ? overrides[p.key] : String(p.default)
    }
    return result
  }

  const setParam = (patternId: string, key: string, value: string) => {
    setParamValues((prev) => ({
      ...prev,
      [patternId]: { ...(prev[patternId] ?? {}), [key]: value },
    }))
  }

  const handleDeploy = () => {
    const params = getParams(selectedPattern)
    const { nodes, edges } = buildNodesAndEdges(selectedPattern, params)
    onApply(nodes, edges)
    onOpenChange(false)
  }

  const params = getParams(selectedPattern)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>⚡</span> Quick Build
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Scaffold a complete infrastructure pattern in one click
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Left: pattern list ── */}
          <div className="w-64 border-r flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-1">
                {(['azure', 'aws', 'gcp'] as const).map((provider) => {
                  const provPatterns = PATTERNS.filter((p) => p.provider === provider)
                  if (!provPatterns.length) return null
                  return (
                    <div key={provider}>
                      <div className={`text-xs font-semibold uppercase tracking-wider px-2 py-1.5 rounded ${PROVIDER_STYLES[provider]}`}>
                        {provider === 'azure' ? 'Microsoft Azure' : provider === 'aws' ? 'Amazon Web Services' : 'Google Cloud'}
                      </div>
                      {provPatterns.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPatternId(p.id)}
                          className={`w-full text-left px-2 py-2 rounded-md text-sm mt-0.5 transition-colors ${
                            selectedPatternId === p.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span className="mr-1.5">{p.icon}</span>
                          {p.name.split(' – ').slice(1).join(' – ')}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ── Right: detail + params ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{selectedPattern.icon}</span>
                    <h2 className="text-lg font-semibold">{selectedPattern.name}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PROVIDER_STYLES[selectedPattern.provider]}`}>
                      {selectedPattern.provider.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPattern.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {selectedPattern.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>

                {/* What will be created */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">What will be added to canvas</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedPattern.nodes.map((n) => (
                      <div key={n.id} className="flex items-center gap-1.5 text-xs bg-muted/60 rounded px-2 py-1">
                        <span className="text-muted-foreground font-mono text-[10px] uppercase">{n.provider}</span>
                        <span className="font-medium">{interpolate(n.label, params)}</span>
                        {n.isContainer && <span className="ml-auto text-muted-foreground">[container]</span>}
                      </div>
                    ))}
                  </div>
                  {(selectedPattern.edges?.length ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      + {selectedPattern.edges!.length} connection{selectedPattern.edges!.length > 1 ? 's' : ''} between components
                    </p>
                  )}
                </div>

                {/* Parameters */}
                {selectedPattern.params.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Configure parameters</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPattern.params.map((p) => (
                        <div key={p.key} className="space-y-1">
                          <Label className="text-xs">{p.label}</Label>
                          <Input
                            type={p.type}
                            min={p.min}
                            max={p.max}
                            value={params[p.key]}
                            onChange={(e) => setParam(selectedPattern.id, p.key, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-between items-center bg-background">
              <p className="text-xs text-muted-foreground">
                {selectedPattern.nodes.length} components will be added to the current diagram.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button size="sm" onClick={handleDeploy} className="gap-1.5">
                  <span>⚡</span>
                  Deploy to Canvas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
