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
        componentId: 'aws-ec2',
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
        componentId: 'gcp-compute-instance',
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
        componentId: 'aws-ec2',
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
        componentId: 'gcp-compute-instance',
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
        componentId: 'aws-rds',
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
        componentId: 'gcp-cloud-sql',
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
        componentId: 'aws-s3',
        defaultConfig: { storageClass: 'STANDARD', encryption: true },
        estimatedCost: { min: 0, max: 100 },
      },
      azure: {
        componentId: 'azure-blob',
        defaultConfig: { accountKind: 'StorageV2', tier: 'Standard', encryption: true },
        estimatedCost: { min: 0, max: 100 },
      },
      gcp: {
        componentId: 'gcp-cloud-storage',
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
        componentId: 'aws-alb',
        defaultConfig: { scheme: 'internet-facing', ipAddressType: 'ipv4' },
        estimatedCost: { min: 22, max: 30 },
      },
      azure: {
        componentId: 'azure-lb',
        defaultConfig: { sku: 'Standard', tier: 'Regional' },
        estimatedCost: { min: 18, max: 25 },
      },
      gcp: {
        componentId: 'gcp-cloud-lb',
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
        componentId: 'aws-vpc',
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
        componentId: 'aws-elasticache',
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
        componentId: 'gcp-memorystore',
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
        componentId: 'aws-cloudfront',
        defaultConfig: { priceClass: 'PriceClass_All' },
        estimatedCost: { min: 1, max: 50 },
      },
      azure: {
        componentId: 'azure-cdn',
        defaultConfig: { sku: 'Standard_Microsoft' },
        estimatedCost: { min: 0.81, max: 50 },
      },
      gcp: {
        componentId: 'gcp-cloud-cdn',
        defaultConfig: { cacheMode: 'CACHE_ALL_STATIC' },
        estimatedCost: { min: 0.75, max: 50 },
      },
    },
  },
  {
    genericId: 'generic-container-orchestrator',
    genericName: 'Kubernetes Cluster',
    category: 'compute',
    description: 'Managed Kubernetes for container orchestration',
    providers: {
      aws: {
        componentId: 'aws-eks',
        defaultConfig: { kubernetes_version: '1.31' },
        estimatedCost: { min: 73, max: 3000 },
      },
      azure: {
        componentId: 'azure-aks',
        defaultConfig: { kubernetes_version: '1.31', sku_tier: 'Free' },
        estimatedCost: { min: 73, max: 3000 },
      },
      gcp: {
        componentId: 'gcp-gke',
        defaultConfig: { clusterVersion: '1.31' },
        estimatedCost: { min: 73, max: 3000 },
      },
    },
  },
  {
    genericId: 'generic-serverless-function',
    genericName: 'Serverless Function',
    category: 'compute',
    description: 'Event-driven serverless compute — pay per invocation',
    providers: {
      aws: {
        componentId: 'aws-lambda',
        defaultConfig: { runtime: 'nodejs20.x', memorySize: 256 },
        estimatedCost: { min: 0, max: 50 },
      },
      azure: {
        componentId: 'azure-functions',
        defaultConfig: { runtime: 'node', sku: 'Y1' },
        estimatedCost: { min: 0, max: 50 },
      },
      gcp: {
        componentId: 'gcp-cloud-functions',
        defaultConfig: { runtime: 'nodejs20', memoryMb: 256 },
        estimatedCost: { min: 0, max: 50 },
      },
    },
  },
  {
    genericId: 'generic-message-queue',
    genericName: 'Message Queue',
    category: 'messaging',
    description: 'Managed message queue for async decoupled processing',
    providers: {
      aws: {
        componentId: 'aws-sqs',
        defaultConfig: { fifo: false },
        estimatedCost: { min: 0, max: 25 },
      },
      azure: {
        componentId: 'azure-service-bus',
        defaultConfig: { sku: 'Standard' },
        estimatedCost: { min: 10, max: 50 },
      },
      gcp: {
        componentId: 'gcp-pubsub',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 25 },
      },
    },
  },
  {
    genericId: 'generic-api-gateway',
    genericName: 'API Gateway',
    category: 'networking',
    description: 'Managed API gateway with throttling and auth',
    providers: {
      aws: {
        componentId: 'aws-api-gateway',
        defaultConfig: { apiType: 'REST' },
        estimatedCost: { min: 3, max: 100 },
      },
      azure: {
        componentId: 'azure-app-gw',
        defaultConfig: { sku: 'Standard_v2' },
        estimatedCost: { min: 18, max: 200 },
      },
      gcp: {
        componentId: 'gcp-cloud-lb',
        defaultConfig: { loadBalancingScheme: 'EXTERNAL' },
        estimatedCost: { min: 18, max: 100 },
      },
    },
  },
  {
    genericId: 'generic-nosql-database',
    genericName: 'NoSQL Database',
    category: 'database',
    description: 'Managed NoSQL/document database with global distribution',
    providers: {
      aws: {
        componentId: 'dynamodb',
        defaultConfig: { billingMode: 'PAY_PER_REQUEST' },
        estimatedCost: { min: 0, max: 500 },
      },
      azure: {
        componentId: 'azure-cosmos',
        defaultConfig: { kind: 'GlobalDocumentDB', consistencyLevel: 'Session' },
        estimatedCost: { min: 25, max: 1000 },
      },
      gcp: {
        componentId: 'gcp-firestore',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 500 },
      },
    },
  },
  {
    genericId: 'generic-secret-store',
    genericName: 'Secret Store',
    category: 'security',
    description: 'Managed secrets and key management',
    providers: {
      aws: {
        componentId: 'aws-secrets-manager',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 10 },
      },
      azure: {
        componentId: 'azure-key-vault',
        defaultConfig: { sku: 'standard' },
        estimatedCost: { min: 0, max: 10 },
      },
      gcp: {
        componentId: 'gcp-secret-manager',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 10 },
      },
    },
  },
  {
    genericId: 'generic-dns',
    genericName: 'DNS Service',
    category: 'networking',
    description: 'Managed DNS with global routing and health checks',
    providers: {
      aws: {
        componentId: 'aws-route53',
        defaultConfig: {},
        estimatedCost: { min: 0.5, max: 10 },
      },
      azure: {
        componentId: 'azure-traffic-manager',
        defaultConfig: {},
        estimatedCost: { min: 0.5, max: 10 },
      },
      gcp: {
        componentId: 'gcp-cloud-dns',
        defaultConfig: {},
        estimatedCost: { min: 0.2, max: 10 },
      },
    },
  },
  {
    genericId: 'generic-container-apps',
    genericName: 'Serverless Containers',
    category: 'compute',
    description: 'Serverless container hosting — run containers without managing clusters',
    providers: {
      aws: {
        componentId: 'aws-ecs',
        defaultConfig: { launchType: 'FARGATE' },
        estimatedCost: { min: 10, max: 500 },
      },
      azure: {
        componentId: 'azure-container-apps',
        defaultConfig: { revision_mode: 'Single' },
        estimatedCost: { min: 0, max: 500 },
      },
      gcp: {
        componentId: 'gcp-cloud-run',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 500 },
      },
    },
  },
  {
    genericId: 'generic-firewall',
    genericName: 'Network Security / Firewall',
    category: 'security',
    description: 'Network security rules and firewalling',
    providers: {
      aws: {
        componentId: 'aws-security-group',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 0 },
      },
      azure: {
        componentId: 'azure-nsg',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 0 },
      },
      gcp: {
        componentId: 'gcp-firewall',
        defaultConfig: {},
        estimatedCost: { min: 0, max: 0 },
      },
    },
  },
]

export function getCloudAgnosticComponent(genericId: string): CloudAgnosticMapping | undefined {
  return CLOUD_AGNOSTIC_MAPPINGS.find(m => m.genericId === genericId)
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
  const convertedNodes = nodes.map(node => {
    // Check if this is a generic component
    const genericMapping = CLOUD_AGNOSTIC_MAPPINGS.find(m => m.genericId === node.data.component)

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
  const conversions: Record<string, { aws?: string; azure?: string; gcp?: string }> = {
    // VMs
    'aws-ec2': { aws: 'aws-ec2', azure: 'azure-vm', gcp: 'gcp-compute-instance' },
    'azure-vm': { aws: 'aws-ec2', azure: 'azure-vm', gcp: 'gcp-compute-instance' },
    'gcp-compute-instance': { aws: 'aws-ec2', azure: 'azure-vm', gcp: 'gcp-compute-instance' },
    'gcp-compute-engine': { aws: 'aws-ec2', azure: 'azure-vm', gcp: 'gcp-compute-engine' },

    // Databases (relational)
    'aws-rds': { aws: 'aws-rds', azure: 'azure-sql', gcp: 'gcp-cloud-sql' },
    'azure-sql': { aws: 'aws-rds', azure: 'azure-sql', gcp: 'gcp-cloud-sql' },
    'gcp-cloud-sql': { aws: 'aws-rds', azure: 'azure-sql', gcp: 'gcp-cloud-sql' },

    // NoSQL / Document DB
    'azure-cosmos': { aws: 'aws-dynamodb', azure: 'azure-cosmos', gcp: 'gcp-firestore' },

    // Object Storage
    'aws-s3': { aws: 'aws-s3', azure: 'azure-blob', gcp: 'gcp-cloud-storage' },
    'azure-blob': { aws: 'aws-s3', azure: 'azure-blob', gcp: 'gcp-cloud-storage' },
    'gcp-cloud-storage': { aws: 'aws-s3', azure: 'azure-blob', gcp: 'gcp-cloud-storage' },

    // Load Balancers
    'aws-alb': { aws: 'aws-alb', azure: 'azure-lb', gcp: 'gcp-lb' },
    'aws-nlb': { aws: 'aws-nlb', azure: 'azure-lb', gcp: 'gcp-lb' },
    'azure-lb': { aws: 'aws-alb', azure: 'azure-lb', gcp: 'gcp-lb' },
    'gcp-lb': { aws: 'aws-alb', azure: 'azure-lb', gcp: 'gcp-lb' },

    // VPC/VNet
    'aws-vpc': { aws: 'aws-vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },
    'azure-vnet': { aws: 'aws-vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },
    'gcp-vpc': { aws: 'aws-vpc', azure: 'azure-vnet', gcp: 'gcp-vpc' },

    // Subnets
    'aws-subnet': { aws: 'aws-subnet', azure: 'azure-subnet', gcp: 'gcp-subnet' },
    'azure-subnet': { aws: 'aws-subnet', azure: 'azure-subnet', gcp: 'gcp-subnet' },
    'gcp-subnet': { aws: 'aws-subnet', azure: 'azure-subnet', gcp: 'gcp-subnet' },

    // Container Orchestration (Kubernetes)
    'aws-eks': { aws: 'aws-eks', azure: 'azure-aks', gcp: 'gcp-gke' },
    'azure-aks': { aws: 'aws-eks', azure: 'azure-aks', gcp: 'gcp-gke' },
    'gcp-gke': { aws: 'aws-eks', azure: 'azure-aks', gcp: 'gcp-gke' },

    // Container Services (non-K8s)
    'aws-ecs': { aws: 'aws-ecs', azure: 'azure-aks', gcp: 'gcp-cloud-run' },
    'gcp-cloud-run': { aws: 'aws-ecs', azure: 'azure-app-service', gcp: 'gcp-cloud-run' },

    // Serverless Functions
    'aws-lambda': { aws: 'aws-lambda', azure: 'azure-functions', gcp: 'gcp-cloud-function' },
    'azure-functions': { aws: 'aws-lambda', azure: 'azure-functions', gcp: 'gcp-cloud-function' },
    'gcp-cloud-function': {
      aws: 'aws-lambda',
      azure: 'azure-functions',
      gcp: 'gcp-cloud-function',
    },

    // Message Queues
    'aws-sqs': { aws: 'aws-sqs', azure: 'azure-service-bus', gcp: 'gcp-pubsub' },
    'azure-service-bus': { aws: 'aws-sqs', azure: 'azure-service-bus', gcp: 'gcp-pubsub' },
    'gcp-pubsub': { aws: 'aws-sqs', azure: 'azure-service-bus', gcp: 'gcp-pubsub' },

    // Notification / Event Topics
    'aws-sns': { aws: 'aws-sns', azure: 'azure-event-hub', gcp: 'gcp-pubsub' },
    'azure-event-hub': { aws: 'aws-sns', azure: 'azure-event-hub', gcp: 'gcp-pubsub' },

    // API Gateway
    'aws-api-gateway': { aws: 'aws-api-gateway', azure: 'azure-app-gw', gcp: 'gcp-lb' },
    'azure-app-gw': { aws: 'aws-api-gateway', azure: 'azure-app-gw', gcp: 'gcp-lb' },

    // CDN
    'aws-cloudfront': { aws: 'aws-cloudfront', azure: 'azure-front-door', gcp: 'gcp-cloud-cdn' },
    'azure-front-door': { aws: 'aws-cloudfront', azure: 'azure-front-door', gcp: 'gcp-cloud-cdn' },
    'gcp-cloud-cdn': { aws: 'aws-cloudfront', azure: 'azure-front-door', gcp: 'gcp-cloud-cdn' },

    // DNS
    'aws-route53': { aws: 'aws-route53', azure: 'azure-traffic-manager', gcp: 'gcp-cloud-dns' },
    'azure-traffic-manager': {
      aws: 'aws-route53',
      azure: 'azure-traffic-manager',
      gcp: 'gcp-cloud-dns',
    },

    // Secret Store
    'aws-secrets-manager': {
      aws: 'aws-secrets-manager',
      azure: 'azure-key-vault',
      gcp: 'gcp-secret-manager',
    },
    'azure-key-vault': {
      aws: 'aws-secrets-manager',
      azure: 'azure-key-vault',
      gcp: 'gcp-secret-manager',
    },

    // Cache
    'aws-elasticache': { aws: 'aws-elasticache', azure: 'azure-redis', gcp: 'gcp-memorystore' },

    // Firewall / NSG
    'aws-security-group': {
      aws: 'aws-security-group',
      azure: 'azure-nsg',
      gcp: 'gcp-firewall-rule',
    },
    'azure-nsg': { aws: 'aws-security-group', azure: 'azure-nsg', gcp: 'gcp-firewall-rule' },
    'gcp-firewall-rule': {
      aws: 'aws-security-group',
      azure: 'azure-nsg',
      gcp: 'gcp-firewall-rule',
    },

    // NAT Gateway
    'aws-nat-gateway': { aws: 'aws-nat-gateway', azure: 'azure-nat-gateway', gcp: 'gcp-cloud-nat' },
    'azure-nat-gateway': {
      aws: 'aws-nat-gateway',
      azure: 'azure-nat-gateway',
      gcp: 'gcp-cloud-nat',
    },
    'gcp-cloud-nat': { aws: 'aws-nat-gateway', azure: 'azure-nat-gateway', gcp: 'gcp-cloud-nat' },

    // PaaS / App Service
    'azure-app-service': { aws: 'aws-ecs', azure: 'azure-app-service', gcp: 'gcp-cloud-run' },

    // Event Streaming
    'aws-kinesis': { aws: 'aws-kinesis', azure: 'azure-event-hub', gcp: 'gcp-pubsub' },
    'aws-eventbridge': { aws: 'aws-eventbridge', azure: 'azure-event-hub', gcp: 'gcp-pubsub' },

    // Identity
    'aws-cognito': { aws: 'aws-cognito', azure: 'azure-ad', gcp: 'gcp-firebase' },
    'azure-ad': { aws: 'aws-cognito', azure: 'azure-ad', gcp: 'gcp-firebase' },
  }

  const targetComponentId = conversions[sourceComponentId]?.[targetProvider]
  if (!targetComponentId) return null

  return {
    componentId: targetComponentId,
    defaultConfig: {},
  }
}
