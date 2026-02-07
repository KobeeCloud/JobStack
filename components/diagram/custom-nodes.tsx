'use client'

import { memo, useCallback } from 'react'
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

// ========================================================
// REALISTIC CONNECTION RULES — Component-level validation
// ========================================================

// Specific component-to-component valid connections (realistic cloud architecture)
const COMPONENT_CONNECTION_RULES: Record<string, string[]> = {
  // ---- Azure Networking ----
  'azure-vnet': ['azure-vnet', 'azure-vpn-gateway', 'azure-express-route', 'azure-firewall', 'azure-ddos-protection', 'azure-bastion'],
  'azure-subnet': ['azure-nsg', 'azure-route-table', 'azure-nat-gateway'],
  'azure-nsg': ['azure-subnet', 'azure-nic'],
  'azure-nic': ['azure-vm', 'azure-public-ip', 'azure-nsg', 'azure-lb'],
  'azure-public-ip': ['azure-nic', 'azure-lb', 'azure-app-gw', 'azure-firewall', 'azure-bastion', 'azure-nat-gateway', 'azure-vpn-gateway'],
  'azure-route-table': ['azure-subnet'],
  'azure-nat-gateway': ['azure-subnet', 'azure-public-ip'],
  'azure-vpn-gateway': ['azure-vnet', 'azure-public-ip', 'azure-express-route'],
  'azure-express-route': ['azure-vnet', 'azure-vpn-gateway'],
  'azure-bastion': ['azure-subnet', 'azure-public-ip'],
  'azure-firewall': ['azure-vnet', 'azure-public-ip', 'azure-subnet'],
  'azure-ddos-protection': ['azure-vnet', 'azure-public-ip'],
  // ---- Azure Compute ----
  'azure-vm': ['azure-nic', 'azure-managed-disk', 'azure-storage-account', 'azure-sql', 'azure-cosmos', 'azure-lb', 'azure-key-vault', 'azure-redis', 'azure-mysql', 'azure-postgresql', 'azure-app-insights'],
  'azure-vmss': ['azure-lb', 'azure-app-gw', 'azure-storage-account', 'azure-managed-disk', 'azure-app-insights'],
  'azure-availability-set': ['azure-lb'],
  // ---- Azure Load Balancing ----
  'azure-lb': ['azure-vm', 'azure-vmss', 'azure-nic', 'azure-public-ip', 'azure-app-gw'],
  'azure-app-gw': ['azure-vm', 'azure-vmss', 'azure-aks', 'azure-public-ip', 'azure-waf'],
  'azure-front-door': ['azure-app-gw', 'azure-lb', 'azure-app-service', 'azure-function', 'azure-storage-account'],
  'azure-traffic-manager': ['azure-app-service', 'azure-lb', 'azure-public-ip'],
  // ---- Azure Databases ----
  'azure-sql': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks', 'azure-container-instance'],
  'azure-cosmos': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks', 'azure-container-instance'],
  'azure-mysql': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks'],
  'azure-postgresql': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks'],
  'azure-redis': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks'],
  // ---- Azure Storage ----
  'azure-storage-account': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks', 'azure-cdn'],
  'azure-managed-disk': ['azure-vm', 'azure-vmss'],
  'azure-file-share': ['azure-vm', 'azure-aks'],
  // ---- Azure PaaS ----
  'azure-app-service': ['azure-sql', 'azure-cosmos', 'azure-storage-account', 'azure-redis', 'azure-key-vault', 'azure-service-bus', 'azure-event-hub', 'azure-app-insights', 'azure-mysql', 'azure-postgresql'],
  'azure-function': ['azure-sql', 'azure-cosmos', 'azure-storage-account', 'azure-service-bus', 'azure-event-hub', 'azure-key-vault', 'azure-app-insights', 'azure-redis', 'azure-mysql', 'azure-postgresql'],
  'azure-logic-app': ['azure-sql', 'azure-cosmos', 'azure-storage-account', 'azure-service-bus', 'azure-event-hub'],
  // ---- Azure Containers ----
  'azure-aks': ['azure-acr', 'azure-sql', 'azure-cosmos', 'azure-storage-account', 'azure-key-vault', 'azure-lb', 'azure-app-gw', 'azure-redis', 'azure-mysql', 'azure-postgresql', 'azure-app-insights'],
  'azure-acr': ['azure-aks', 'azure-app-service', 'azure-container-instance'],
  'azure-container-instance': ['azure-acr', 'azure-sql', 'azure-cosmos', 'azure-storage-account'],
  // ---- Azure Security ----
  'azure-key-vault': ['azure-vm', 'azure-app-service', 'azure-function', 'azure-aks'],
  'azure-waf': ['azure-app-gw', 'azure-front-door'],
  // ---- Azure Messaging ----
  'azure-service-bus': ['azure-app-service', 'azure-function', 'azure-logic-app', 'azure-aks'],
  'azure-event-hub': ['azure-app-service', 'azure-function', 'azure-stream-analytics', 'azure-databricks'],
  'azure-event-grid': ['azure-function', 'azure-logic-app', 'azure-service-bus', 'azure-event-hub'],
  // ---- Azure AI / Analytics ----
  'azure-cognitive-services': ['azure-app-service', 'azure-function', 'azure-aks'],
  'azure-machine-learning': ['azure-storage-account', 'azure-aks', 'azure-cognitive-services'],
  'azure-databricks': ['azure-storage-account', 'azure-sql', 'azure-cosmos', 'azure-event-hub'],
  'azure-synapse': ['azure-storage-account', 'azure-sql', 'azure-cosmos'],
  'azure-stream-analytics': ['azure-event-hub', 'azure-sql', 'azure-cosmos', 'azure-storage-account'],
  // ---- Azure Monitoring ----
  'azure-app-insights': ['azure-app-service', 'azure-function', 'azure-aks', 'azure-vm'],
  'azure-monitor': ['azure-vm', 'azure-aks', 'azure-app-service', 'azure-sql'],
  'azure-log-analytics': ['azure-monitor', 'azure-app-insights', 'azure-vm', 'azure-aks'],
  // ---- Azure CDN / DNS ----
  'azure-cdn': ['azure-storage-account', 'azure-app-service', 'azure-front-door'],
  'azure-dns': ['azure-app-service', 'azure-lb', 'azure-front-door', 'azure-traffic-manager'],

  // ---- AWS Networking ----
  'aws-vpc': ['aws-vpc', 'aws-vpn-gateway', 'aws-direct-connect', 'aws-transit-gateway'],
  'aws-subnet': ['aws-nat-gateway', 'aws-route-table', 'aws-nacl'],
  'aws-security-group': ['aws-ec2', 'aws-rds', 'aws-ecs', 'aws-eks', 'aws-elb', 'aws-alb', 'aws-lambda', 'aws-elasticache', 'aws-aurora'],
  'aws-nat-gateway': ['aws-subnet', 'aws-eip'],
  'aws-route-table': ['aws-subnet', 'aws-internet-gateway', 'aws-nat-gateway', 'aws-vpn-gateway'],
  'aws-internet-gateway': ['aws-vpc', 'aws-route-table'],
  'aws-eip': ['aws-ec2', 'aws-nat-gateway', 'aws-alb', 'aws-nlb'],
  'aws-vpn-gateway': ['aws-vpc', 'aws-direct-connect'],
  'aws-transit-gateway': ['aws-vpc', 'aws-vpn-gateway', 'aws-direct-connect'],
  'aws-nacl': ['aws-subnet'],
  // ---- AWS Compute ----
  'aws-ec2': ['aws-security-group', 'aws-ebs', 'aws-s3', 'aws-rds', 'aws-dynamodb', 'aws-elb', 'aws-alb', 'aws-iam-role', 'aws-cloudwatch', 'aws-elasticache', 'aws-aurora', 'aws-efs', 'aws-secrets-manager'],
  'aws-auto-scaling': ['aws-ec2', 'aws-alb', 'aws-elb'],
  'aws-lambda': ['aws-security-group', 'aws-s3', 'aws-rds', 'aws-dynamodb', 'aws-sqs', 'aws-sns', 'aws-api-gateway', 'aws-iam-role', 'aws-kinesis', 'aws-cloudwatch', 'aws-secrets-manager', 'aws-aurora', 'aws-elasticache', 'aws-efs'],
  // ---- AWS Load Balancing ----
  'aws-alb': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-auto-scaling', 'aws-security-group', 'aws-eip', 'aws-waf'],
  'aws-nlb': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-eip'],
  'aws-elb': ['aws-ec2', 'aws-auto-scaling', 'aws-security-group'],
  'aws-cloudfront': ['aws-s3', 'aws-alb', 'aws-api-gateway', 'aws-waf'],
  // ---- AWS Database ----
  'aws-rds': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-lambda', 'aws-security-group'],
  'aws-dynamodb': ['aws-ec2', 'aws-lambda', 'aws-ecs', 'aws-eks', 'aws-api-gateway'],
  'aws-elasticache': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-lambda', 'aws-security-group'],
  'aws-aurora': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-lambda', 'aws-security-group'],
  // ---- AWS Storage ----
  'aws-s3': ['aws-ec2', 'aws-lambda', 'aws-cloudfront', 'aws-ecs', 'aws-eks', 'aws-sagemaker', 'aws-glue', 'aws-athena'],
  'aws-efs': ['aws-ec2', 'aws-ecs', 'aws-eks', 'aws-lambda'],
  'aws-ebs': ['aws-ec2'],
  // ---- AWS Containers ----
  'aws-ecs': ['aws-ecr', 'aws-rds', 'aws-dynamodb', 'aws-s3', 'aws-alb', 'aws-nlb', 'aws-security-group', 'aws-cloudwatch', 'aws-secrets-manager', 'aws-efs'],
  'aws-eks': ['aws-ecr', 'aws-rds', 'aws-dynamodb', 'aws-s3', 'aws-alb', 'aws-nlb', 'aws-security-group', 'aws-cloudwatch', 'aws-secrets-manager', 'aws-efs'],
  'aws-ecr': ['aws-ecs', 'aws-eks'],
  // ---- AWS Messaging ----
  'aws-sqs': ['aws-lambda', 'aws-ec2', 'aws-ecs', 'aws-sns'],
  'aws-sns': ['aws-lambda', 'aws-sqs', 'aws-ec2'],
  'aws-kinesis': ['aws-lambda', 'aws-ec2', 'aws-s3', 'aws-redshift'],
  'aws-eventbridge': ['aws-lambda', 'aws-sqs', 'aws-sns', 'aws-step-functions'],
  'aws-step-functions': ['aws-lambda', 'aws-ecs', 'aws-sns', 'aws-sqs'],
  // ---- AWS API / Security ----
  'aws-api-gateway': ['aws-lambda', 'aws-ec2', 'aws-ecs', 'aws-eks', 'aws-waf', 'aws-cloudfront', 'aws-cognito'],
  'aws-cognito': ['aws-api-gateway', 'aws-alb', 'aws-lambda'],
  'aws-iam-role': ['aws-ec2', 'aws-lambda', 'aws-ecs', 'aws-eks'],
  'aws-waf': ['aws-alb', 'aws-cloudfront', 'aws-api-gateway'],
  'aws-secrets-manager': ['aws-ec2', 'aws-lambda', 'aws-ecs', 'aws-eks'],
  'aws-kms': ['aws-s3', 'aws-rds', 'aws-ebs', 'aws-sqs', 'aws-sns'],
  // ---- AWS Analytics / AI ----
  'aws-sagemaker': ['aws-s3', 'aws-ec2'],
  'aws-redshift': ['aws-s3', 'aws-kinesis', 'aws-glue'],
  'aws-glue': ['aws-s3', 'aws-rds', 'aws-redshift', 'aws-dynamodb'],
  'aws-athena': ['aws-s3', 'aws-glue'],
  // ---- AWS Monitoring ----
  'aws-cloudwatch': ['aws-ec2', 'aws-lambda', 'aws-ecs', 'aws-eks', 'aws-rds', 'aws-sns'],
  'aws-cloudtrail': ['aws-s3', 'aws-cloudwatch'],
  // ---- AWS DNS ----
  'aws-route53': ['aws-alb', 'aws-cloudfront', 'aws-ec2', 'aws-s3', 'aws-elb', 'aws-api-gateway'],

  // ---- GCP Networking ----
  'gcp-vpc': ['gcp-vpc', 'gcp-cloud-vpn', 'gcp-cloud-interconnect'],
  'gcp-subnet': ['gcp-cloud-nat', 'gcp-firewall-rule'],
  'gcp-firewall-rule': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-sql', 'gcp-subnet'],
  'gcp-cloud-nat': ['gcp-subnet'],
  'gcp-cloud-vpn': ['gcp-vpc'],
  'gcp-cloud-interconnect': ['gcp-vpc'],
  // ---- GCP Compute ----
  'gcp-compute-instance': ['gcp-firewall-rule', 'gcp-persistent-disk', 'gcp-cloud-sql', 'gcp-cloud-storage', 'gcp-lb', 'gcp-cloud-monitoring', 'gcp-memorystore'],
  'gcp-cloud-function': ['gcp-cloud-sql', 'gcp-firestore', 'gcp-cloud-storage', 'gcp-pub-sub', 'gcp-cloud-monitoring', 'gcp-memorystore'],
  'gcp-cloud-run': ['gcp-cloud-sql', 'gcp-firestore', 'gcp-cloud-storage', 'gcp-pub-sub', 'gcp-lb', 'gcp-artifact-registry', 'gcp-memorystore'],
  // ---- GCP Load Balancing ----
  'gcp-lb': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-run', 'gcp-cloud-armor'],
  'gcp-cloud-cdn': ['gcp-cloud-storage', 'gcp-lb'],
  'gcp-cloud-armor': ['gcp-lb'],
  // ---- GCP Database ----
  'gcp-cloud-sql': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-run', 'gcp-firewall-rule'],
  'gcp-firestore': ['gcp-compute-instance', 'gcp-cloud-function', 'gcp-cloud-run', 'gcp-gke'],
  'gcp-cloud-spanner': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function'],
  'gcp-memorystore': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-run'],
  'gcp-bigtable': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-dataflow'],
  // ---- GCP Storage ----
  'gcp-cloud-storage': ['gcp-compute-instance', 'gcp-cloud-function', 'gcp-cloud-run', 'gcp-gke', 'gcp-cloud-cdn', 'gcp-bigquery', 'gcp-dataflow'],
  'gcp-persistent-disk': ['gcp-compute-instance', 'gcp-gke'],
  // ---- GCP Containers ----
  'gcp-gke': ['gcp-artifact-registry', 'gcp-cloud-sql', 'gcp-firestore', 'gcp-cloud-storage', 'gcp-lb', 'gcp-firewall-rule', 'gcp-memorystore', 'gcp-cloud-monitoring'],
  'gcp-artifact-registry': ['gcp-gke', 'gcp-cloud-run'],
  // ---- GCP Messaging ----
  'gcp-pub-sub': ['gcp-cloud-function', 'gcp-cloud-run', 'gcp-dataflow', 'gcp-bigquery'],
  // ---- GCP Analytics / AI ----
  'gcp-bigquery': ['gcp-cloud-storage', 'gcp-pub-sub', 'gcp-dataflow'],
  'gcp-dataflow': ['gcp-cloud-storage', 'gcp-pub-sub', 'gcp-bigquery', 'gcp-bigtable'],
  'gcp-vertex-ai': ['gcp-cloud-storage', 'gcp-bigquery', 'gcp-compute-instance'],
  // ---- GCP Monitoring ----
  'gcp-cloud-monitoring': ['gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-sql'],
  'gcp-cloud-logging': ['gcp-cloud-monitoring', 'gcp-cloud-storage', 'gcp-bigquery'],
  // ---- GCP DNS ----
  'gcp-cloud-dns': ['gcp-lb', 'gcp-compute-instance', 'gcp-cloud-run'],
}

// Category-level fallback rules
const CATEGORY_CONNECTION_RULES: Record<string, string[]> = {
  'compute': ['database', 'storage', 'networking', 'security', 'containers', 'compute', 'ai-ml', 'analytics', 'messaging', 'monitoring', 'devops', 'identity'],
  'database': ['compute', 'containers', 'storage', 'analytics', 'security'],
  'storage': ['compute', 'database', 'analytics', 'ai-ml', 'containers', 'devops', 'monitoring'],
  'networking': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'devops', 'monitoring', 'identity'],
  'security': ['networking', 'compute', 'containers', 'database', 'storage', 'identity'],
  'containers': ['database', 'storage', 'networking', 'compute', 'containers', 'security', 'messaging', 'monitoring', 'devops'],
  'ai-ml': ['storage', 'compute', 'database', 'analytics', 'containers'],
  'analytics': ['database', 'storage', 'compute', 'ai-ml', 'messaging', 'containers'],
  'messaging': ['compute', 'containers', 'networking', 'analytics', 'database', 'ai-ml'],
  'devops': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'monitoring'],
  'monitoring': ['compute', 'database', 'storage', 'networking', 'security', 'containers', 'ai-ml', 'analytics', 'messaging', 'devops'],
  'identity': ['compute', 'containers', 'networking', 'security', 'database'],
}

export function getComponentCategory(componentId: string): string {
  const component = COMPONENT_CATALOG.find(c => c.id === componentId)
  return component?.category || 'compute'
}

// ========================================================
// CONTAINER HIERARCHY — Which components can contain others
// ========================================================

export const CONTAINER_HIERARCHY: Record<string, string[]> = {
  // Azure — Resource Group contains everything
  'azure-resource-group': [
    'azure-vnet', 'azure-vm', 'azure-vmss', 'azure-storage-account', 'azure-nsg',
    'azure-lb', 'azure-app-gw', 'azure-sql', 'azure-cosmos', 'azure-function',
    'azure-aks', 'azure-acr', 'azure-key-vault', 'azure-app-service',
    'azure-firewall', 'azure-bastion', 'azure-vpn-gateway', 'azure-public-ip',
    'azure-nat-gateway', 'azure-ddos-protection', 'azure-front-door',
    'azure-traffic-manager', 'azure-cdn', 'azure-dns', 'azure-service-bus',
    'azure-event-hub', 'azure-event-grid', 'azure-redis', 'azure-mysql',
    'azure-postgresql', 'azure-app-insights', 'azure-monitor', 'azure-log-analytics',
    'azure-cognitive-services', 'azure-machine-learning', 'azure-databricks',
    'azure-synapse', 'azure-container-instance', 'azure-logic-app', 'azure-waf',
    'azure-availability-set', 'azure-express-route', 'azure-subnet',
  ],
  // Azure — VNet contains ONLY Subnets (real Azure)
  'azure-vnet': ['azure-subnet'],
  // Azure — Subnet contains resources deployed into it
  'azure-subnet': [
    'azure-vm', 'azure-vmss', 'azure-nic', 'azure-aks', 'azure-container-instance',
    'azure-app-gw', 'azure-firewall', 'azure-bastion', 'azure-lb',
  ],
  // Azure — Availability Set groups VMs
  'azure-availability-set': ['azure-vm'],

  // AWS
  'aws-vpc': ['aws-subnet', 'aws-internet-gateway', 'aws-vpn-gateway'],
  'aws-subnet': [
    'aws-ec2', 'aws-rds', 'aws-ecs', 'aws-eks', 'aws-lambda',
    'aws-nat-gateway', 'aws-elb', 'aws-alb', 'aws-nlb', 'aws-elasticache', 'aws-aurora',
  ],

  // GCP
  'gcp-vpc': ['gcp-subnet'],
  'gcp-subnet': [
    'gcp-compute-instance', 'gcp-gke', 'gcp-cloud-function', 'gcp-cloud-run',
    'gcp-cloud-sql', 'gcp-memorystore', 'gcp-cloud-nat',
  ],
}

// Lookup: which containers can a given component go into?
export function getValidContainers(componentId: string): string[] {
  const containers: string[] = []
  for (const [containerId, children] of Object.entries(CONTAINER_HIERARCHY)) {
    if (children.includes(componentId)) {
      containers.push(containerId)
    }
  }
  return containers
}

// Check if two components should use parent-child relationship instead of edge
export function shouldUseParentChild(sourceComponentId: string, targetComponentId: string): boolean {
  if (CONTAINER_HIERARCHY[sourceComponentId]?.includes(targetComponentId)) return true
  if (CONTAINER_HIERARCHY[targetComponentId]?.includes(sourceComponentId)) return true
  return false
}

// Validate whether a connection (edge) between two components is realistic
export function isValidConnection(sourceComponentId: string, targetComponentId: string): boolean {
  // Block connections that should be parent-child
  if (shouldUseParentChild(sourceComponentId, targetComponentId)) return false

  // Check component-level rules first (bidirectional)
  const sourceRules = COMPONENT_CONNECTION_RULES[sourceComponentId]
  const targetRules = COMPONENT_CONNECTION_RULES[targetComponentId]
  if (sourceRules?.includes(targetComponentId)) return true
  if (targetRules?.includes(sourceComponentId)) return true

  // If neither side has specific rules, allow based on category
  if (!sourceRules && !targetRules) {
    const sourceCategory = getComponentCategory(sourceComponentId)
    const targetCategory = getComponentCategory(targetComponentId)
    const allowed = CATEGORY_CONNECTION_RULES[sourceCategory]
    if (!allowed) return true
    return allowed.includes(targetCategory)
  }

  // If one side has rules but doesn't list the other, fallback to category
  const sourceCategory = getComponentCategory(sourceComponentId)
  const targetCategory = getComponentCategory(targetComponentId)
  const allowed = CATEGORY_CONNECTION_RULES[sourceCategory]
  if (!allowed) return true
  return allowed.includes(targetCategory)
}

// Get human-readable reason why a connection is invalid
export function getConnectionError(sourceComponentId: string, targetComponentId: string): string | null {
  if (shouldUseParentChild(sourceComponentId, targetComponentId)) {
    return 'These components have a containment relationship. Drag the child into the container instead of connecting with an edge.'
  }
  if (!isValidConnection(sourceComponentId, targetComponentId)) {
    const srcCatalog = COMPONENT_CATALOG.find(c => c.id === sourceComponentId)
    const tgtCatalog = COMPONENT_CATALOG.find(c => c.id === targetComponentId)
    return `${srcCatalog?.name || sourceComponentId} cannot connect to ${tgtCatalog?.name || targetComponentId}. This connection is not realistic in cloud architecture.`
  }
  return null
}

// ========================================================
// UI HELPER COMPONENTS
// ========================================================

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

// ========================================================
// CUSTOM NODE — Regular component (VM, DB, LB, etc.)
// ========================================================

interface CustomNodeProps {
  id: string
  data: {
    label: string
    icon?: string
    componentId?: string
    component?: string
    provider?: string
    category?: string
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

  const getProviderColor = () => {
    switch (data.provider) {
      case 'aws': return 'border-l-orange-500 border-l-4'
      case 'azure': return 'border-l-blue-500 border-l-4'
      case 'gcp': return 'border-l-red-500 border-l-4'
      default: return ''
    }
  }

  const handleDelete = useCallback(() => deleteElements({ nodes: [{ id }] }), [deleteElements, id])

  const handleConfigure = useCallback(() => {
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }, [id])

  const handleDuplicate = useCallback(() => {
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
  }, [getNodes, id, setNodes])

  const CategoryIcon = getCategoryIcon(category)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={`min-w-[180px] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group relative ${selected ? 'ring-2 ring-primary ring-offset-2' : ''} ${getProviderColor()}`}>
          <NodeResizer minWidth={150} minHeight={60} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-primary border-2 border-background rounded" />

          {data.security?.nsg && <SecurityIndicator type="nsg" />}
          {data.security?.firewall && <div className="absolute -top-2 -right-8"><SecurityIndicator type="firewall" /></div>}
          {data.security?.encryption && <div className="absolute -bottom-2 -right-2"><SecurityIndicator type="encryption" /></div>}

          {/* Top handles */}
          <Handle id="top-target" type="target" position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '40%' }} />
          <Handle id="top-source" type="source" position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '60%' }} />
          {/* Bottom handles */}
          <Handle id="bottom-source" type="source" position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '40%' }} />
          <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '60%' }} />
          {/* Left handles */}
          <Handle id="left-target" type="target" position={Position.Left} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '40%' }} />
          <Handle id="left-source" type="source" position={Position.Left} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '60%' }} />
          {/* Right handles */}
          <Handle id="right-source" type="source" position={Position.Right} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '40%' }} />
          <Handle id="right-target" type="target" position={Position.Right} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '60%' }} />

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

// ========================================================
// CONTAINER NODE — VNet, Subnet, VPC, Resource Group, etc.
// ========================================================

interface ContainerNodeProps {
  id: string
  data: {
    label: string
    icon?: string
    provider?: string
    componentId?: string
    component?: string
    category?: string
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
      case 'aws': return 'bg-orange-500/5 border-orange-400'
      case 'azure': return 'bg-blue-500/5 border-blue-400'
      case 'gcp': return 'bg-red-500/5 border-red-400'
      default: return 'bg-muted/30 border-border'
    }
  }

  // Visual differentiation for container depth
  const getContainerStyle = () => {
    if (componentId.includes('resource-group')) return 'border-dashed border-2'
    if (componentId.includes('vnet') || componentId.includes('vpc')) return 'border-solid border-2'
    if (componentId.includes('subnet')) return 'border-dotted border-2'
    if (componentId.includes('availability-set')) return 'border-dashed border-2'
    return 'border-dashed border-2'
  }

  const handleDelete = useCallback(() => deleteElements({ nodes: [{ id }] }), [deleteElements, id])

  const handleConfigure = useCallback(() => {
    window.dispatchEvent(new CustomEvent('configure-node', { detail: { nodeId: id } }))
  }, [id])

  const handleDuplicate = useCallback(() => {
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
  }, [getNodes, id, setNodes])

  const CategoryIcon = getCategoryIcon(category)

  // Default sizes based on container type
  const getDefaultSize = () => {
    if (componentId.includes('resource-group')) return { width: 800, height: 600 }
    if (componentId.includes('vnet') || componentId.includes('vpc')) return { width: 600, height: 450 }
    if (componentId.includes('subnet')) return { width: 450, height: 300 }
    if (componentId.includes('availability-set')) return { width: 350, height: 250 }
    return { width: 400, height: 300 }
  }

  const defaults = getDefaultSize()
  const width = style?.width || defaults.width
  const height = style?.height || defaults.height

  const getMinSize = () => {
    if (componentId.includes('resource-group')) return { minWidth: 400, minHeight: 300 }
    if (componentId.includes('vnet') || componentId.includes('vpc')) return { minWidth: 300, minHeight: 250 }
    if (componentId.includes('subnet')) return { minWidth: 200, minHeight: 150 }
    return { minWidth: 200, minHeight: 150 }
  }

  const minSize = getMinSize()

  const getHintText = () => {
    if (componentId.includes('vnet') || componentId.includes('vpc')) return 'Drop subnets here'
    if (componentId.includes('subnet')) return 'Drop instances / services here'
    if (componentId.includes('resource-group')) return 'Drop resources here'
    if (componentId.includes('availability-set')) return 'Drop VMs here'
    return 'Drop components here'
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`rounded-lg relative group ${selected ? 'ring-2 ring-primary ring-offset-2' : ''} ${getProviderBg()} ${getContainerStyle()}`}
          style={{ width, height }}
        >
          <NodeResizer
            minWidth={minSize.minWidth}
            minHeight={minSize.minHeight}
            isVisible={selected}
            lineClassName="border-primary"
            handleClassName="h-3 w-3 bg-primary border-2 border-background rounded"
          />

          {data.security?.nsg && <SecurityIndicator type="nsg" />}
          {data.security?.firewall && <div className="absolute -top-2 right-6"><SecurityIndicator type="firewall" /></div>}

          {/* Handles on all 4 sides — both source and target */}
          <Handle id="top-target" type="target" position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '30%' }} />
          <Handle id="top-source" type="source" position={Position.Top} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '70%' }} />
          <Handle id="bottom-source" type="source" position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '30%' }} />
          <Handle id="bottom-target" type="target" position={Position.Bottom} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ left: '70%' }} />
          <Handle id="left-target" type="target" position={Position.Left} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '30%' }} />
          <Handle id="left-source" type="source" position={Position.Left} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '70%' }} />
          <Handle id="right-source" type="source" position={Position.Right} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '30%' }} />
          <Handle id="right-target" type="target" position={Position.Right} className="w-3 h-3 bg-primary/80 border-2 border-background" style={{ top: '70%' }} />

          {/* Header bar */}
          <div className="absolute top-0 left-0 right-0 px-3 py-2 border-b border-dashed flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-t-lg z-10">
            {data.icon ? <span className="text-xl">{data.icon}</span> : <CategoryIcon className="w-5 h-5 text-muted-foreground" />}
            <span className="font-semibold text-sm">{data.label}</span>
            {data.provider && <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">{data.provider.toUpperCase()}</Badge>}
          </div>

          {/* Hint text */}
          <div className="absolute inset-0 top-10 flex items-center justify-center text-muted-foreground/30 text-sm pointer-events-none select-none">
            {getHintText()}
          </div>

          {/* Action buttons */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
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
