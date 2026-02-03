export interface CloudAgnosticMapping {
  genericId: string
  genericName: string
  category: string
  description: string
  providers: {
    aws?: {
      componentId: string
      defaultSize?: string
      defaultConfig?: Record<string, any>
      estimatedCost: { min: number; max: number }
    }
    azure?: {
      componentId: string
      defaultSize?: string
      defaultConfig?: Record<string, any>
      estimatedCost: { min: number; max: number }
    }
    gcp?: {
      componentId: string
      defaultSize?: string
      defaultConfig?: Record<string, any>
      estimatedCost: { min: number; max: number }
    }
  }
}

export const CLOUD_AGNOSTIC_MAPPINGS: CloudAgnosticMapping[] = [
  {
    genericId: 'generic-vm',
    genericName: 'Virtual Machine (Small)',
    category: 'compute',
    description: 'Small VM for web servers, APIs (2 vCPU, 4GB RAM)',
    providers: {
      aws: {
        componentId: 'ec2-instance',
        defaultSize: 't3.medium',
        defaultConfig: { instanceType: 't3.medium' },
        estimatedCost: { min: 30, max: 35 },
      },
      azure: {
        componentId: 'azure-vm',
        defaultSize: 'Standard_B2s',
        defaultConfig: { size: 'Standard_B2s' },
        estimatedCost: { min: 30, max: 35 },
      },
      gcp: {
        componentId: 'gcp-compute',
        defaultSize: 'e2-medium',
        defaultConfig: { machineType: 'e2-medium' },
        estimatedCost: { min: 24, max: 28 },
      },
    },
  },
  {
    genericId: 'generic-vm-large',
    genericName: 'Virtual Machine (Large)',
    category: 'compute',
    description: 'Large VM for intensive workloads (8 vCPU, 32GB RAM)',
    providers: {
      aws: {
        componentId: 'ec2-instance',
        defaultSize: 'm5.2xlarge',
        defaultConfig: { instanceType: 'm5.2xlarge' },
        estimatedCost: { min: 280, max: 320 },
      },
      azure: {
        componentId: 'azure-vm',
        defaultSize: 'Standard_D8s_v3',
        defaultConfig: { size: 'Standard_D8s_v3' },
        estimatedCost: { min: 290, max: 330 },
      },
      gcp: {
        componentId: 'gcp-compute',
        defaultSize: 'n2-standard-8',
        defaultConfig: { machineType: 'n2-standard-8' },
        estimatedCost: { min: 243, max: 280 },
      },
    },
  },
  {
    genericId: 'generic-database',
    genericName: 'Relational Database (PostgreSQL)',
    category: 'database',
    description: 'Managed PostgreSQL database with high availability',
    providers: {
      aws: {
        componentId: 'rds',
        defaultSize: 'db.t3.medium',
        defaultConfig: {
          engine: 'postgres',
          engineVersion: '14.7',
          instanceClass: 'db.t3.medium',
          multiAZ: true,
        },
        estimatedCost: { min: 140, max: 160 },
      },
      azure: {
        componentId: 'azure-sql',
        defaultSize: 'Standard_S2',
        defaultConfig: {
          edition: 'Standard',
          tier: 'S2',
        },
        estimatedCost: { min: 149, max: 170 },
      },
      gcp: {
        componentId: 'cloud-sql',
        defaultSize: 'db-n1-standard-2',
        defaultConfig: {
          databaseVersion: 'POSTGRES_14',
          tier: 'db-n1-standard-2',
        },
        estimatedCost: { min: 135, max: 155 },
      },
    },
  },
  {
    genericId: 'generic-storage',
    genericName: 'Object Storage',
    category: 'storage',
    description: 'Scalable object storage for files, backups, static content',
    providers: {
      aws: {
        componentId: 's3',
        defaultConfig: { storageClass: 'STANDARD', encryption: true },
        estimatedCost: { min: 0, max: 100 },
      },
      azure: {
        componentId: 'azure-storage',
        defaultConfig: { accountKind: 'StorageV2', tier: 'Standard', encryption: true },
        estimatedCost: { min: 0, max: 100 },
      },
      gcp: {
        componentId: 'gcs',
        defaultConfig: { storageClass: 'STANDARD', encryption: true },
        estimatedCost: { min: 0, max: 100 },
      },
    },
  },
  {
    genericId: 'generic-load-balancer',
    genericName: 'Load Balancer',
    category: 'networking',
    description: 'Application load balancer with HTTPS/TLS',
    providers: {
      aws: {
        componentId: 'alb',
        defaultConfig: { scheme: 'internet-facing', ipAddressType: 'ipv4' },
        estimatedCost: { min: 22, max: 30 },
      },
      azure: {
        componentId: 'azure-lb',
        defaultConfig: { sku: 'Standard', tier: 'Regional' },
        estimatedCost: { min: 18, max: 25 },
      },
      gcp: {
        componentId: 'gcp-lb',
        defaultConfig: { loadBalancingScheme: 'EXTERNAL' },
        estimatedCost: { min: 18, max: 25 },
      },
    },
  },
  {
    genericId: 'generic-vpc',
    genericName: 'Virtual Private Cloud',
    category: 'networking',
    description: 'Isolated virtual network',
    providers: {
      aws: {
        componentId: 'vpc',
        defaultConfig: { cidrBlock: '10.0.0.0/16' },
        estimatedCost: { min: 0, max: 0 },
      },
      azure: {
        componentId: 'azure-vnet',
        defaultConfig: { addressSpace: '10.0.0.0/16' },
        estimatedCost: { min: 0, max: 0 },
      },
      gcp: {
        componentId: 'gcp-vpc',
        defaultConfig: { autoCreateSubnetworks: false },
        estimatedCost: { min: 0, max: 0 },
      },
    },
  },
  {
    genericId: 'generic-cache',
    genericName: 'Cache (Redis)',
    category: 'database',
    description: 'In-memory cache for session state and frequent queries',
    providers: {
      aws: {
        componentId: 'elasticache',
        defaultSize: 'cache.t3.micro',
        defaultConfig: { engine: 'redis', nodeType: 'cache.t3.micro' },
        estimatedCost: { min: 12, max: 15 },
      },
      azure: {
        componentId: 'azure-redis',
        defaultSize: 'Basic C0',
        defaultConfig: { sku: 'Basic', capacity: 0 },
        estimatedCost: { min: 16, max: 20 },
      },
      gcp: {
        componentId: 'memorystore',
        defaultSize: 'basic-1gb',
        defaultConfig: { tier: 'BASIC', memorySizeGb: 1 },
        estimatedCost: { min: 13, max: 16 },
      },
    },
  },
  {
    genericId: 'generic-cdn',
    genericName: 'Content Delivery Network',
    category: 'networking',
    description: 'Global CDN for static content delivery',
    providers: {
      aws: {
        componentId: 'cloudfront',
        defaultConfig: { priceClass: 'PriceClass_All' },
        estimatedCost: { min: 1, max: 50 },
      },
      azure: {
        componentId: 'azure-cdn',
        defaultConfig: { sku: 'Standard_Microsoft' },
        estimatedCost: { min: 0.81, max: 50 },
      },
      gcp: {
        componentId: 'cloud-cdn',
        defaultConfig: { cacheMode: 'CACHE_ALL_STATIC' },
        estimatedCost: { min: 0.75, max: 50 },
      },
    },
  },
]

export function getCloudAgnosticComponent(genericId: string): CloudAgnosticMapping | undefined {
  return CLOUD_AGNOSTIC_MAPPINGS.find((m) => m.genericId === genericId)
}

export function getComponentForProvider(
  genericId: string,
  provider: 'aws' | 'azure' | 'gcp'
): CloudAgnosticMapping['providers'][typeof provider] | undefined {
  const mapping = getCloudAgnosticComponent(genericId)
  return mapping?.providers[provider]
}

export function compareCostsAcrossProviders(genericId: string): {
  aws: { min: number; max: number } | null
  azure: { min: number; max: number } | null
  gcp: { min: number; max: number } | null
  cheapest: 'aws' | 'azure' | 'gcp' | null
} {
  const mapping = getCloudAgnosticComponent(genericId)
  if (!mapping) {
    return { aws: null, azure: null, gcp: null, cheapest: null }
  }

  const costs = {
    aws: mapping.providers.aws?.estimatedCost || null,
    azure: mapping.providers.azure?.estimatedCost || null,
    gcp: mapping.providers.gcp?.estimatedCost || null,
  }

  // Find cheapest by average cost
  const averages: Array<{ provider: 'aws' | 'azure' | 'gcp'; avgCost: number }> = []
  if (costs.aws) averages.push({ provider: 'aws', avgCost: (costs.aws.min + costs.aws.max) / 2 })
  if (costs.azure)
    averages.push({ provider: 'azure', avgCost: (costs.azure.min + costs.azure.max) / 2 })
  if (costs.gcp) averages.push({ provider: 'gcp', avgCost: (costs.gcp.min + costs.gcp.max) / 2 })

  averages.sort((a, b) => a.avgCost - b.avgCost)

  return {
    ...costs,
    cheapest: averages[0]?.provider || null,
  }
}

export function convertDiagramToProvider(
  nodes: any[],
  edges: any[],
  targetProvider: 'aws' | 'azure' | 'gcp'
): { nodes: any[]; edges: any[] } {
  const convertedNodes = nodes.map((node) => {
    // Check if this is a generic component
    const genericMapping = CLOUD_AGNOSTIC_MAPPINGS.find(
      (m) => m.genericId === node.data.component
    )

    if (genericMapping) {
      const providerMapping = genericMapping.providers[targetProvider]
      if (providerMapping) {
        return {
          ...node,
          data: {
            ...node.data,
            component: providerMapping.componentId,
            config: {
              ...(node.data.config || {}),
              ...providerMapping.defaultConfig,
              size: providerMapping.defaultSize || node.data.config?.size,
            },
          },
        }
      }
    }

    // Try to convert specific components
    const componentId = String(node.data.component || '')
    const converted = tryConvertComponent(componentId, targetProvider)

    if (converted) {
      return {
        ...node,
        data: {
          ...node.data,
          component: converted.componentId,
          config: {
            ...(node.data.config || {}),
            ...converted.defaultConfig,
          },
        },
      }
    }

    return node
  })

  return {
    nodes: convertedNodes,
    edges, // Edges remain the same
  }
}

function tryConvertComponent(
  sourceComponentId: string,
  targetProvider: 'aws' | 'azure' | 'gcp'
): { componentId: string; defaultConfig: Record<string, any> } | null {
  const conversions: Record<
    string,
    { aws?: string; azure?: string; gcp?: string }
  > = {
    // VMs
    'ec2-instance': { aws: 'ec2-instance', azure: 'azure-vm', gcp: 'gcp-compute' },
    'azure-vm': { aws: 'ec2-instance', azure: 'azure-vm', gcp: 'gcp-compute' },
    'gcp-compute': { aws: 'ec2-instance', azure: 'azure-vm', gcp: 'gcp-compute' },

    // Databases
    rds: { aws: 'rds', azure: 'azure-sql', gcp: 'cloud-sql' },
    'azure-sql': { aws: 'rds', azure: 'azure-sql', gcp: 'cloud-sql' },
    'cloud-sql': { aws: 'rds', azure: 'azure-sql', gcp: 'cloud-sql' },

    // Storage
    s3: { aws: 's3', azure: 'azure-storage', gcp: 'gcs' },
    'azure-storage': { aws: 's3', azure: 'azure-storage', gcp: 'gcs' },
    gcs: { aws: 's3', azure: 'azure-storage', gcp: 'gcs' },

    // Load Balancers
    alb: { aws: 'alb', azure: 'azure-lb', gcp: 'gcp-lb' },
    'azure-lb': { aws: 'alb', azure: 'azure-lb', gcp: 'gcp-lb' },
    'gcp-lb': { aws: 'alb', azure: 'azure-lb', gcp: 'gcp-lb' },

    // VPC/VNet
    vpc: { aws: 'vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },
    'azure-vnet': { aws: 'vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },
    'gcp-vpc': { aws: 'vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },
  }

  const targetComponentId = conversions[sourceComponentId]?.[targetProvider]
  if (!targetComponentId) return null

  return {
    componentId: targetComponentId,
    defaultConfig: {},
  }
}
