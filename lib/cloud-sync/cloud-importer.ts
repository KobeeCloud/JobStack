import { Node, Edge } from '@xyflow/react'

export interface CloudResource {
  id: string
  type: string // e.g., 'AWS::EC2::Instance', 'Azure::VirtualMachine'
  name: string
  provider: 'aws' | 'azure' | 'gcp'
  region: string
  properties: Record<string, any>
  status: 'running' | 'stopped' | 'terminated' | 'unknown'
  cost?: number
  tags?: Record<string, string>
}

export interface CloudConnection {
  id: string
  projectId: string
  provider: 'aws' | 'azure' | 'gcp'
  region: string
  credentials: string // Encrypted
  isActive: boolean
  lastSyncAt?: string
}

export interface DriftReport {
  id: string
  projectId: string
  changes: DriftChange[]
  detectedAt: string
  severity: 'critical' | 'warning' | 'info'
}

export interface DriftChange {
  resourceId: string
  resourceType: string
  changeType: 'added' | 'removed' | 'modified'
  diagramState: any
  actualState: any
  diff: Record<string, { from: any; to: any }>
}

/**
 * Import resources from AWS (simulated - requires AWS SDK in production)
 */
export async function importFromAWS(
  _region: string,
  _credentials?: { accessKeyId: string; secretAccessKey: string }
): Promise<CloudResource[]> {
  // In production, use AWS SDK:
  // import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2'
  // import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds'

  // Simulated response for demo
  return [
    {
      id: 'i-0123456789abcdef0',
      type: 'AWS::EC2::Instance',
      name: 'web-server-1',
      provider: 'aws',
      region: 'us-east-1',
      properties: {
        instanceType: 't3.medium',
        imageId: 'ami-0c55b159cbfafe1f0',
        vpcId: 'vpc-12345678',
        subnetId: 'subnet-12345678',
      },
      status: 'running',
      cost: 35.04, // monthly
      tags: {
        Environment: 'production',
        Application: 'web',
      },
    },
    {
      id: 'db-instance-1',
      type: 'AWS::RDS::DBInstance',
      name: 'prod-database',
      provider: 'aws',
      region: 'us-east-1',
      properties: {
        engine: 'postgres',
        engineVersion: '14.7',
        dbInstanceClass: 'db.t3.medium',
        allocatedStorage: 100,
        multiAZ: true,
      },
      status: 'running',
      cost: 145.00, // monthly
      tags: {
        Environment: 'production',
      },
    },
  ]
}

/**
 * Import resources from Azure (simulated - requires Azure SDK in production)
 */
export async function importFromAzure(
  _subscriptionId: string,
  _resourceGroup: string,
  _credentials?: { clientId: string; clientSecret: string; tenantId: string }
): Promise<CloudResource[]> {
  // In production, use Azure SDK:
  // import { ComputeManagementClient } from '@azure/arm-compute'
  // import { SqlManagementClient } from '@azure/arm-sql'

  // Simulated response for demo
  return [
    {
      id: '/subscriptions/xxx/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/vm-web-01',
      type: 'Microsoft.Compute/virtualMachines',
      name: 'vm-web-01',
      provider: 'azure',
      region: 'westeurope',
      properties: {
        vmSize: 'Standard_B2s',
        osType: 'Linux',
        imagePublisher: 'Canonical',
        imageOffer: 'UbuntuServer',
      },
      status: 'running',
      cost: 30.37, // monthly
      tags: {
        environment: 'production',
        application: 'web',
      },
    },
    {
      id: '/subscriptions/xxx/resourceGroups/rg-prod/providers/Microsoft.Sql/servers/sql-prod/databases/db-main',
      type: 'Microsoft.Sql/databases',
      name: 'db-main',
      provider: 'azure',
      region: 'westeurope',
      properties: {
        edition: 'Standard',
        requestedServiceObjectiveName: 'S2',
        maxSizeBytes: 268435456000,
      },
      status: 'running',
      cost: 149.00, // monthly
      tags: {
        environment: 'production',
      },
    },
  ]
}

/**
 * Import resources from GCP (simulated - requires GCP SDK in production)
 */
export async function importFromGCP(
  _projectId: string,
  _region: string,
  _credentials?: { clientEmail: string; privateKey: string }
): Promise<CloudResource[]> {
  // In production, use GCP SDK:
  // import { Compute } from '@google-cloud/compute'
  // import { SQL } from '@google-cloud/sql'

  // Simulated response for demo
  return [
    {
      id: '1234567890123456789',
      type: 'compute.v1.instance',
      name: 'web-server-gcp',
      provider: 'gcp',
      region: 'us-central1',
      properties: {
        machineType: 'e2-medium',
        zone: 'us-central1-a',
        diskType: 'pd-standard',
        diskSizeGb: 100,
      },
      status: 'running',
      cost: 24.27, // monthly
      tags: {
        environment: 'production',
      },
    },
  ]
}

/**
 * Convert cloud resources to diagram nodes
 */
export function convertResourcesToNodes(resources: CloudResource[]): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []

  let xOffset = 100
  let yOffset = 100

  for (const resource of resources) {
    const componentId = mapResourceTypeToComponent(resource.type, resource.provider)

    nodes.push({
      id: resource.id,
      type: 'custom',
      position: { x: xOffset, y: yOffset },
      data: {
        label: resource.name,
        component: componentId,
        config: {
          ...resource.properties,
          region: resource.region,
          tags: resource.tags,
          imported: true,
          importedAt: new Date().toISOString(),
          status: resource.status,
        },
      },
    })

    xOffset += 250
    if (xOffset > 1000) {
      xOffset = 100
      yOffset += 200
    }
  }

  // TODO: In production, analyze resource relationships and create edges
  // For example: EC2 in VPC, RDS connected to EC2, etc.

  return { nodes, edges }
}

/**
 * Map cloud resource type to JobStack component ID
 */
function mapResourceTypeToComponent(resourceType: string, provider: string): string {
  const mappings: Record<string, Record<string, string>> = {
    aws: {
      'AWS::EC2::Instance': 'ec2-instance',
      'AWS::RDS::DBInstance': 'rds',
      'AWS::S3::Bucket': 's3',
      'AWS::ELB::LoadBalancer': 'alb',
      'AWS::Lambda::Function': 'lambda',
      'AWS::VPC': 'vpc',
    },
    azure: {
      'Microsoft.Compute/virtualMachines': 'azure-vm',
      'Microsoft.Sql/databases': 'azure-sql',
      'Microsoft.Storage/storageAccounts': 'azure-storage',
      'Microsoft.Network/loadBalancers': 'azure-lb',
      'Microsoft.Network/virtualNetworks': 'azure-vnet',
    },
    gcp: {
      'compute.v1.instance': 'gcp-compute',
      'sqladmin.v1.instance': 'cloud-sql',
      'storage.v1.bucket': 'gcs',
      'compute.v1.forwardingRule': 'gcp-lb',
      'compute.v1.network': 'gcp-vpc',
    },
  }

  return mappings[provider]?.[resourceType] || 'generic-compute'
}

/**
 * Detect drift between diagram and actual cloud state
 */
export async function detectDrift(
  diagramNodes: Node[],
  actualResources: CloudResource[]
): Promise<DriftChange[]> {
  const driftChanges: DriftChange[] = []

  // Find resources added in cloud but not in diagram
  const diagramResourceIds = new Set(
    diagramNodes.filter((n) => (n.data.config as any)?.imported).map((n) => n.id)
  )

  for (const resource of actualResources) {
    if (!diagramResourceIds.has(resource.id)) {
      driftChanges.push({
        resourceId: resource.id,
        resourceType: resource.type,
        changeType: 'added',
        diagramState: null,
        actualState: resource,
        diff: {},
      })
    }
  }

  // Find resources removed from cloud but still in diagram
  const actualResourceIds = new Set(actualResources.map((r) => r.id))
  for (const node of diagramNodes) {
    const config = node.data.config as any
    if (config?.imported && !actualResourceIds.has(node.id)) {
      driftChanges.push({
        resourceId: node.id,
        resourceType: String(node.data.component || 'unknown'),
        changeType: 'removed',
        diagramState: node,
        actualState: null,
        diff: {},
      })
    }
  }

  // Find modified resources (simplified - compare status only)
  for (const node of diagramNodes) {
    const config = node.data.config as any
    if (!config?.imported) continue

    const actualResource = actualResources.find((r) => r.id === node.id)
    if (!actualResource) continue

    if (config.status !== actualResource.status) {
      driftChanges.push({
        resourceId: node.id,
        resourceType: actualResource.type,
        changeType: 'modified',
        diagramState: { status: config.status },
        actualState: { status: actualResource.status },
        diff: {
          status: { from: config.status, to: actualResource.status },
        },
      })
    }
  }

  return driftChanges
}

/**
 * Get estimated cost from actual cloud resources
 */
export function calculateActualCost(resources: CloudResource[]): number {
  return resources.reduce((total, resource) => total + (resource.cost || 0), 0)
}

/**
 * Check if cloud credentials are valid (simulated)
 */
export async function validateCloudCredentials(
  provider: 'aws' | 'azure' | 'gcp',
  _credentials: any
): Promise<{ valid: boolean; message: string }> {
  // In production, make actual API calls to validate credentials
  // For now, simulate success
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    valid: true,
    message: `Successfully connected to ${provider.toUpperCase()}`,
  }
}
