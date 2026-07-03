import { Node } from '@xyflow/react'

export interface PricingRequestParams {
  provider: 'aws' | 'azure' | 'gcp'
  region: string
  serviceCode: string
  attributes: Record<string, string>
}

// Emulates a backend call to an internal FinOps API (which abstracts cloud APIs / Infracost)
export async function fetchLivePricing(params: PricingRequestParams): Promise<number> {
  // In a real application, this would fetch from a Next.js Serverless API Route
  // e.g., await fetch('/api/finops/price', { body: JSON.stringify(params) })

  const cacheKey = `${params.provider}:${params.region}:${params.attributes.instanceType}`

  // Simulated API Response mapping from a proper Cloud Pricing API
  const mockDb: Record<string, number> = {
    // AWS
    'aws:eu-west-1:t3.micro': 8.0,
    'aws:eu-west-1:t3.small': 15.0,
    'aws:eu-west-1:t3.medium': 30.22,
    'aws:eu-west-1:t3.large': 60.0,
    'aws:eu-west-1:m5.large': 70.08,
    'aws:eu-west-1:c5.large': 62.0,
    // Azure
    'azure:westeurope:standard_b1s': 4.0,
    'azure:westeurope:standard_b2s': 30.0,
    'azure:westeurope:standard_d2s_v3': 70.0,
    // GCP
    'gcp:europe-west1:e2-micro': 6.0,
    'gcp:europe-west1:e2-medium': 24.0,
    'gcp:europe-west1:e2-standard-2': 49.0,
  }

  // Return the fetched price, or a fallback default if not found
  return mockDb[cacheKey] ?? 0
}

export async function calculateDynamicCost(
  nodes: Node[],
  region: string = 'eu-west-1'
): Promise<{ min: number; max: number; breakdown: any[]; currency: string }> {
  let totalMonthlyCost = 0
  const breakdown: any[] = []

  // Asynchronously resolve all node prices (executes in parallel)
  const costPromises = nodes.map(async node => {
    const config = (node.data?.config || {}) as Record<string, any>
    const provider = String(node.data?.provider || 'aws') as 'aws' | 'azure' | 'gcp'
    const componentId = node.data?.componentId as string
    let nodeCost = 0

    // Compute (VMs / Instances)
    if (['aws-ec2', 'azure-vm', 'gcp-compute-instance'].includes(componentId)) {
      const instanceType =
        config?.size ||
        (provider === 'aws' ? 't3.micro' : provider === 'azure' ? 'standard_b1s' : 'e2-micro')

      const regionOverride =
        provider === 'azure' ? 'westeurope' : provider === 'gcp' ? 'europe-west1' : region

      const monthlyRate = await fetchLivePricing({
        provider,
        region: regionOverride,
        serviceCode: 'Compute',
        attributes: {
          instanceType: instanceType.toLowerCase(),
          operatingSystem: config?.osImage?.includes('windows') ? 'Windows' : 'Linux',
          preInstalledSw: 'NA',
          tenancy: 'Shared',
        },
      })

      // Compute attached dynamic storage costs
      const diskSizeFn = config?.diskSize ? config.diskSize * 0.08 : 0 // $0.08/GB-mo for standard ssd

      nodeCost = (monthlyRate + diskSizeFn) * (config?.replicas || 1)
    }
    // Databases
    else if (['aws-rds', 'azure-sql', 'gcp-cloud-sql'].includes(componentId)) {
      const monthlyRate = 120 // simplified fallback for DB
      const storageCost = config?.allocated_storage ? config.allocated_storage * 0.11 : 0
      const hazolMultiplier = config?.multi_az ? 2 : 1
      nodeCost = (monthlyRate + storageCost) * hazolMultiplier
    }
    // Network / Other fallback
    else {
      // For items not explicitly mapped yet to dynamic engine, fallback to static defaults or 0
      nodeCost = 0
    }

    breakdown.push({
      componentId: componentId || 'unknown',
      componentName: (node.data?.label as string) || componentId,
      minCost: nodeCost,
      maxCost: nodeCost,
      category: 'Compute',
    })

    return nodeCost
  })

  const costs = await Promise.all(costPromises)
  totalMonthlyCost = costs.reduce((sum, cost) => sum + cost, 0)

  return {
    min: totalMonthlyCost,
    max: totalMonthlyCost,
    breakdown,
    currency: 'USD',
  }
}
