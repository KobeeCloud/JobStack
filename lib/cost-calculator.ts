import { Node } from '@xyflow/react'
import { getComponentById } from '@/lib/catalog'

export interface CostBreakdown {
  componentId: string
  componentName: string
  minCost: number
  maxCost: number
  category: string
}

export interface TotalCost {
  min: number
  max: number
  breakdown: CostBreakdown[]
  currency: string
}

// ──────────────────────────────────────────────────
// VM size → estimated monthly cost (USD) lookup
// ──────────────────────────────────────────────────
const VM_SIZE_COSTS: Record<string, number> = {
  // AWS
  't3.micro': 8, 't3.small': 15, 't3.medium': 30, 't3.large': 60, 't3.xlarge': 121,
  't3.2xlarge': 243, 'm5.large': 70, 'm5.xlarge': 140, 'm5.2xlarge': 281,
  'c5.large': 62, 'c5.xlarge': 124, 'c5.2xlarge': 248, 'r5.large': 91,
  'r5.xlarge': 182, 'r5.2xlarge': 365,
  // Azure
  'standard_b1s': 4, 'standard_b1ms': 15, 'standard_b2s': 30, 'standard_b2ms': 61,
  'standard_d2s_v3': 70, 'standard_d4s_v3': 140, 'standard_d8s_v3': 281,
  'standard_d2s_v5': 70, 'standard_d4s_v5': 140, 'standard_d8s_v5': 281,
  'standard_e2s_v3': 91, 'standard_e4s_v3': 182, 'standard_f2s_v2': 62,
  'standard_f4s_v2': 124, 'standard_ds2_v2': 101, 'standard_ds3_v2': 202,
  // GCP
  'e2-micro': 6, 'e2-small': 12, 'e2-medium': 24, 'e2-standard-2': 49,
  'e2-standard-4': 97, 'e2-standard-8': 194, 'n2-standard-2': 69,
  'n2-standard-4': 138, 'n2-standard-8': 276,
}

// App Service / Function SKU → monthly cost
const SKU_COSTS: Record<string, number> = {
  'f1': 0, 'd1': 10, 'b1': 13, 'b2': 26, 'b3': 52,
  's1': 73, 's2': 146, 's3': 292, 'p1v2': 73, 'p2v2': 146, 'p3v2': 292,
  'p1v3': 95, 'p2v3': 190, 'p3v3': 380,
  'y1': 0, 'ep1': 175, 'ep2': 350, 'ep3': 700,
}

// Storage tier multipliers
const STORAGE_TIER_MULTIPLIER: Record<string, number> = {
  'standard': 1, 'premium': 2,
  'lrs': 1, 'grs': 2, 'ragrs': 2.2, 'zrs': 1.5, 'gzrs': 3, 'ragzrs': 3.3,
}

// Disk SKU per-GB monthly cost
const DISK_COST_PER_GB: Record<string, number> = {
  'standard_hdd': 0.04, 'standard_ssd': 0.075, 'premium_ssd': 0.12, 'ultrassd': 0.18,
}

/**
 * Calculate cost for a single node based on its catalog entry AND user-configured specs.
 */
function calculateNodeCost(node: Node): { min: number; max: number } | null {
  const componentId = node.data?.componentId as string
  if (!componentId) return null

  const component = getComponentById(componentId)
  if (!component) return null

  let baseCostMin = component.estimatedCost.min
  let baseCostMax = component.estimatedCost.max
  const config = (node.data?.config ?? {}) as Record<string, unknown>

  // ── VM / Compute instances ──
  if (['azure-vm', 'aws-ec2', 'gcp-compute-instance', 'azure-vmss'].includes(componentId)) {
    const size = (config.size as string || '').toLowerCase()
    if (size && VM_SIZE_COSTS[size]) {
      baseCostMin = VM_SIZE_COSTS[size]
      baseCostMax = VM_SIZE_COSTS[size]
    }
    const replicas = Number(config.replicas) || 1
    if (replicas > 1) {
      baseCostMin *= replicas
      baseCostMax *= replicas
    }
    const diskSize = Number(config.diskSize) || 0
    const diskType = (config.diskType as string || 'standard_ssd').toLowerCase()
    if (diskSize > 0) {
      const perGb = DISK_COST_PER_GB[diskType] ?? 0.075
      baseCostMin += diskSize * perGb
      baseCostMax += diskSize * perGb
    }
  }

  // ── Kubernetes clusters (AKS/EKS/GKE) ──
  if (['azure-aks', 'aws-eks', 'gcp-gke'].includes(componentId)) {
    const pool = config.defaultNodePool as Record<string, unknown> | undefined
    if (pool) {
      const vmSize = (pool.vmSize as string || '').toLowerCase()
      const nodeCount = Number(pool.nodeCount) || 3
      const perNodeCost = (vmSize && VM_SIZE_COSTS[vmSize]) ? VM_SIZE_COSTS[vmSize] : 100
      baseCostMin = perNodeCost * nodeCount
      baseCostMax = perNodeCost * (Number(pool.maxCount) || nodeCount)
    }
  }

  // ── App Service / Function Apps ──
  if (['azure-app-service', 'azure-functions', 'aws-lambda', 'gcp-cloud-functions'].includes(componentId)) {
    const sku = (config.sku as string || '').toLowerCase()
    if (sku && SKU_COSTS[sku] !== undefined) {
      baseCostMin = SKU_COSTS[sku]
      baseCostMax = SKU_COSTS[sku]
    }
  }

  // ── Storage accounts ──
  if (['azure-storage-account', 'azure-blob', 'aws-s3', 'gcp-cloud-storage'].includes(componentId)) {
    const tier = (config.accountTier as string || 'standard').toLowerCase()
    const replication = (config.replicationType as string || 'lrs').toLowerCase()
    const tierMult = STORAGE_TIER_MULTIPLIER[tier] ?? 1
    const replMult = STORAGE_TIER_MULTIPLIER[replication] ?? 1
    baseCostMin = baseCostMin * tierMult * replMult
    baseCostMax = baseCostMax * tierMult * replMult
  }

  // ── Managed disks ──
  if (['azure-managed-disk', 'aws-ebs', 'gcp-persistent-disk'].includes(componentId)) {
    const diskSizeGb = Number(config.size) || 128
    const sku = (config.sku as string || 'premium_ssd').toLowerCase()
    const perGb = DISK_COST_PER_GB[sku] ?? 0.12
    baseCostMin = diskSizeGb * perGb
    baseCostMax = diskSizeGb * perGb
  }

  // ── SQL Database SKU ──
  if (['azure-sql'].includes(componentId)) {
    const sku = (config.sku as string || '').toUpperCase()
    const sqlSkuCosts: Record<string, number> = {
      'S0': 15, 'S1': 30, 'S2': 75, 'S3': 150, 'S4': 300, 'S6': 600,
      'P1': 465, 'P2': 930, 'P4': 1860, 'P6': 3720,
      'GP_GEN5_2': 384, 'GP_GEN5_4': 768, 'GP_GEN5_8': 1536,
      'BC_GEN5_2': 913, 'BC_GEN5_4': 1826,
    }
    if (sku && sqlSkuCosts[sku]) {
      baseCostMin = sqlSkuCosts[sku]
      baseCostMax = sqlSkuCosts[sku]
    }
  }

  // ── Generic replicas multiplier (non-VM components with replicas) ──
  if (config.replicas && !['azure-vm', 'aws-ec2', 'gcp-compute-instance', 'azure-vmss'].includes(componentId)) {
    const replicas = Number(config.replicas) || 1
    if (replicas > 1) {
      baseCostMin *= replicas
      baseCostMax *= replicas
    }
  }

  return { min: Math.round(baseCostMin), max: Math.round(baseCostMax) }
}

export function calculateInfrastructureCost(nodes: Node[]): TotalCost {
  let totalMin = 0
  let totalMax = 0
  const breakdown: CostBreakdown[] = []

  nodes.forEach(node => {
    const componentId = node.data?.componentId as string
    if (!componentId) return

    const component = getComponentById(componentId)
    if (!component) return

    const cost = calculateNodeCost(node) ?? {
      min: component.estimatedCost.min,
      max: component.estimatedCost.max
    }

    totalMin += cost.min
    totalMax += cost.max

    breakdown.push({
      componentId: component.id,
      componentName: node.data?.label as string || component.name,
      minCost: cost.min,
      maxCost: cost.max,
      category: component.category
    })
  })

  return {
    min: totalMin,
    max: totalMax,
    breakdown,
    currency: 'USD'
  }
}

export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cost)
}

export function getCostRange(totalCost: TotalCost): string {
  if (totalCost.min === totalCost.max) {
    return formatCost(totalCost.min)
  }
  return `${formatCost(totalCost.min)} - ${formatCost(totalCost.max)}`
}

export function getCostByCategory(breakdown: CostBreakdown[]): Record<string, { min: number; max: number }> {
  const byCategory: Record<string, { min: number; max: number }> = {}

  breakdown.forEach(item => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = { min: 0, max: 0 }
    }
    byCategory[item.category].min += item.minCost
    byCategory[item.category].max += item.maxCost
  })

  return byCategory
}
