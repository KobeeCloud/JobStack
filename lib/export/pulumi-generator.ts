import { Node, Edge } from '@xyflow/react'

/**
 * Pulumi TypeScript Generator
 * Converts diagram to Pulumi infrastructure-as-code
 */

interface PulumiResource {
  name: string
  type: string
  properties: Record<string, unknown>
  dependencies: string[]
}

// Map our component types to Pulumi resource types
const PULUMI_MAPPINGS: Record<string, { package: string; type: string; imports: string[] }> = {
  // AWS
  'aws-vpc': { package: '@pulumi/aws', type: 'aws.ec2.Vpc', imports: ['aws'] },
  'aws-subnet': { package: '@pulumi/aws', type: 'aws.ec2.Subnet', imports: ['aws'] },
  'aws-security-group': { package: '@pulumi/aws', type: 'aws.ec2.SecurityGroup', imports: ['aws'] },
  'aws-ec2': { package: '@pulumi/aws', type: 'aws.ec2.Instance', imports: ['aws'] },
  'aws-lambda': { package: '@pulumi/aws', type: 'aws.lambda.Function', imports: ['aws'] },
  'aws-s3': { package: '@pulumi/aws', type: 'aws.s3.Bucket', imports: ['aws'] },
  'aws-rds': { package: '@pulumi/aws', type: 'aws.rds.Instance', imports: ['aws'] },
  'aws-dynamodb': { package: '@pulumi/aws', type: 'aws.dynamodb.Table', imports: ['aws'] },
  'aws-alb': { package: '@pulumi/aws', type: 'aws.lb.LoadBalancer', imports: ['aws'] },
  'aws-eks': { package: '@pulumi/aws', type: 'aws.eks.Cluster', imports: ['aws'] },
  'aws-ecs': { package: '@pulumi/aws', type: 'aws.ecs.Cluster', imports: ['aws'] },
  'aws-api-gateway': { package: '@pulumi/aws', type: 'aws.apigateway.RestApi', imports: ['aws'] },
  'aws-cloudfront': { package: '@pulumi/aws', type: 'aws.cloudfront.Distribution', imports: ['aws'] },
  'aws-sqs': { package: '@pulumi/aws', type: 'aws.sqs.Queue', imports: ['aws'] },
  'aws-sns': { package: '@pulumi/aws', type: 'aws.sns.Topic', imports: ['aws'] },

  // Azure
  'azure-vnet': { package: '@pulumi/azure-native', type: 'azure.network.VirtualNetwork', imports: ['azure'] },
  'azure-subnet': { package: '@pulumi/azure-native', type: 'azure.network.Subnet', imports: ['azure'] },
  'azure-nsg': { package: '@pulumi/azure-native', type: 'azure.network.NetworkSecurityGroup', imports: ['azure'] },
  'azure-vm': { package: '@pulumi/azure-native', type: 'azure.compute.VirtualMachine', imports: ['azure'] },
  'azure-functions': { package: '@pulumi/azure-native', type: 'azure.web.WebApp', imports: ['azure'] },
  'azure-app-service': { package: '@pulumi/azure-native', type: 'azure.web.WebApp', imports: ['azure'] },
  'azure-blob': { package: '@pulumi/azure-native', type: 'azure.storage.StorageAccount', imports: ['azure'] },
  'azure-sql': { package: '@pulumi/azure-native', type: 'azure.sql.Server', imports: ['azure'] },
  'azure-cosmosdb': { package: '@pulumi/azure-native', type: 'azure.documentdb.DatabaseAccount', imports: ['azure'] },
  'azure-aks': { package: '@pulumi/azure-native', type: 'azure.containerservice.ManagedCluster', imports: ['azure'] },
  'azure-app-gw': { package: '@pulumi/azure-native', type: 'azure.network.ApplicationGateway', imports: ['azure'] },
  'azure-keyvault': { package: '@pulumi/azure-native', type: 'azure.keyvault.Vault', imports: ['azure'] },

  // GCP
  'gcp-vpc': { package: '@pulumi/gcp', type: 'gcp.compute.Network', imports: ['gcp'] },
  'gcp-subnet': { package: '@pulumi/gcp', type: 'gcp.compute.Subnetwork', imports: ['gcp'] },
  'gcp-firewall': { package: '@pulumi/gcp', type: 'gcp.compute.Firewall', imports: ['gcp'] },
  'gcp-compute': { package: '@pulumi/gcp', type: 'gcp.compute.Instance', imports: ['gcp'] },
  'gcp-functions': { package: '@pulumi/gcp', type: 'gcp.cloudfunctions.Function', imports: ['gcp'] },
  'gcp-cloud-run': { package: '@pulumi/gcp', type: 'gcp.cloudrun.Service', imports: ['gcp'] },
  'gcp-storage': { package: '@pulumi/gcp', type: 'gcp.storage.Bucket', imports: ['gcp'] },
  'gcp-cloud-sql': { package: '@pulumi/gcp', type: 'gcp.sql.DatabaseInstance', imports: ['gcp'] },
  'gcp-gke': { package: '@pulumi/gcp', type: 'gcp.container.Cluster', imports: ['gcp'] },
  'gcp-pubsub': { package: '@pulumi/gcp', type: 'gcp.pubsub.Topic', imports: ['gcp'] },
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .toLowerCase()
}

function generatePulumiResource(node: Node): PulumiResource | null {
  const type = node.type || ''
  const mapping = PULUMI_MAPPINGS[type]
  
  if (!mapping) return null

  const name = sanitizeName(String(node.data?.label || node.id))
  
  return {
    name,
    type: mapping.type,
    properties: {
      tags: {
        Name: node.data?.label || name,
        ManagedBy: 'Pulumi',
        GeneratedFrom: 'JobStack',
      },
    },
    dependencies: [],
  }
}

export function generatePulumi(nodes: Node[], edges: Edge[]): string {
  const resources: PulumiResource[] = []
  const imports = new Set<string>()
  const nodeIdToName = new Map<string, string>()

  // Generate resources
  for (const node of nodes) {
    const resource = generatePulumiResource(node)
    if (resource) {
      const mapping = PULUMI_MAPPINGS[node.type || '']
      if (mapping) {
        mapping.imports.forEach(i => imports.add(i))
      }
      resources.push(resource)
      nodeIdToName.set(node.id, resource.name)
    }
  }

  // Add dependencies from edges
  for (const edge of edges) {
    const sourceName = nodeIdToName.get(edge.source)
    const targetName = nodeIdToName.get(edge.target)
    if (sourceName && targetName) {
      const targetResource = resources.find(r => r.name === targetName)
      if (targetResource) {
        targetResource.dependencies.push(sourceName)
      }
    }
  }

  // Generate code
  const lines: string[] = []

  // Imports
  lines.push('import * as pulumi from "@pulumi/pulumi";')
  if (imports.has('aws')) lines.push('import * as aws from "@pulumi/aws";')
  if (imports.has('azure')) lines.push('import * as azure from "@pulumi/azure-native";')
  if (imports.has('gcp')) lines.push('import * as gcp from "@pulumi/gcp";')
  lines.push('')

  // Config
  lines.push('// Configuration')
  lines.push('const config = new pulumi.Config();')
  lines.push('')

  // Resources
  lines.push('// Resources')
  for (const resource of resources) {
    lines.push(`const ${resource.name} = new ${resource.type}("${resource.name}", {`)
    
    for (const [key, value] of Object.entries(resource.properties)) {
      if (typeof value === 'object') {
        lines.push(`  ${key}: ${JSON.stringify(value, null, 2).split('\n').join('\n  ')},`)
      } else {
        lines.push(`  ${key}: ${JSON.stringify(value)},`)
      }
    }
    
    if (resource.dependencies.length > 0) {
      lines.push(`}, { dependsOn: [${resource.dependencies.join(', ')}] });`)
    } else {
      lines.push('});')
    }
    lines.push('')
  }

  // Exports
  lines.push('// Exports')
  for (const resource of resources) {
    lines.push(`export const ${resource.name}Id = ${resource.name}.id;`)
  }

  return lines.join('\n')
}
