import { Node, Edge } from '@xyflow/react'

/**
 * Pulumi TypeScript Generator
 * Converts diagram to Pulumi infrastructure-as-code
 * Supports parent-child relationships (VPC->Subnet->Instance, etc.)
 */

interface PulumiResource {
  name: string
  varName: string
  type: string
  properties: Record<string, unknown>
  dependencies: string[]
  componentId: string
}

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
  'aws-nlb': { package: '@pulumi/aws', type: 'aws.lb.LoadBalancer', imports: ['aws'] },
  'aws-eks': { package: '@pulumi/aws', type: 'aws.eks.Cluster', imports: ['aws'] },
  'aws-ecs': { package: '@pulumi/aws', type: 'aws.ecs.Cluster', imports: ['aws'] },
  'aws-api-gateway': { package: '@pulumi/aws', type: 'aws.apigateway.RestApi', imports: ['aws'] },
  'aws-cloudfront': { package: '@pulumi/aws', type: 'aws.cloudfront.Distribution', imports: ['aws'] },
  'aws-sqs': { package: '@pulumi/aws', type: 'aws.sqs.Queue', imports: ['aws'] },
  'aws-sns': { package: '@pulumi/aws', type: 'aws.sns.Topic', imports: ['aws'] },
  'aws-nat-gateway': { package: '@pulumi/aws', type: 'aws.ec2.NatGateway', imports: ['aws'] },
  'aws-internet-gateway': { package: '@pulumi/aws', type: 'aws.ec2.InternetGateway', imports: ['aws'] },
  'aws-eip': { package: '@pulumi/aws', type: 'aws.ec2.Eip', imports: ['aws'] },
  'aws-route-table': { package: '@pulumi/aws', type: 'aws.ec2.RouteTable', imports: ['aws'] },
  'aws-ecr': { package: '@pulumi/aws', type: 'aws.ecr.Repository', imports: ['aws'] },
  'aws-efs': { package: '@pulumi/aws', type: 'aws.efs.FileSystem', imports: ['aws'] },
  'aws-elasticache': { package: '@pulumi/aws', type: 'aws.elasticache.Cluster', imports: ['aws'] },
  'aws-aurora': { package: '@pulumi/aws', type: 'aws.rds.Cluster', imports: ['aws'] },
  'aws-cognito': { package: '@pulumi/aws', type: 'aws.cognito.UserPool', imports: ['aws'] },
  'aws-iam-role': { package: '@pulumi/aws', type: 'aws.iam.Role', imports: ['aws'] },
  'aws-kms': { package: '@pulumi/aws', type: 'aws.kms.Key', imports: ['aws'] },
  'aws-secrets-manager': { package: '@pulumi/aws', type: 'aws.secretsmanager.Secret', imports: ['aws'] },
  'aws-waf': { package: '@pulumi/aws', type: 'aws.wafv2.WebAcl', imports: ['aws'] },
  'aws-kinesis': { package: '@pulumi/aws', type: 'aws.kinesis.Stream', imports: ['aws'] },
  'aws-step-functions': { package: '@pulumi/aws', type: 'aws.sfn.StateMachine', imports: ['aws'] },
  'aws-eventbridge': { package: '@pulumi/aws', type: 'aws.cloudwatch.EventBus', imports: ['aws'] },
  'aws-route53': { package: '@pulumi/aws', type: 'aws.route53.Zone', imports: ['aws'] },
  'aws-cloudwatch': { package: '@pulumi/aws', type: 'aws.cloudwatch.Dashboard', imports: ['aws'] },

  // Azure
  'azure-vnet': { package: '@pulumi/azure-native', type: 'azure.network.VirtualNetwork', imports: ['azure'] },
  'azure-subnet': { package: '@pulumi/azure-native', type: 'azure.network.Subnet', imports: ['azure'] },
  'azure-nsg': { package: '@pulumi/azure-native', type: 'azure.network.NetworkSecurityGroup', imports: ['azure'] },
  'azure-vm': { package: '@pulumi/azure-native', type: 'azure.compute.VirtualMachine', imports: ['azure'] },
  'azure-vmss': { package: '@pulumi/azure-native', type: 'azure.compute.VirtualMachineScaleSet', imports: ['azure'] },
  'azure-functions': { package: '@pulumi/azure-native', type: 'azure.web.WebApp', imports: ['azure'] },
  'azure-function': { package: '@pulumi/azure-native', type: 'azure.web.WebApp', imports: ['azure'] },
  'azure-app-service': { package: '@pulumi/azure-native', type: 'azure.web.WebApp', imports: ['azure'] },
  'azure-blob': { package: '@pulumi/azure-native', type: 'azure.storage.StorageAccount', imports: ['azure'] },
  'azure-storage-account': { package: '@pulumi/azure-native', type: 'azure.storage.StorageAccount', imports: ['azure'] },
  'azure-sql': { package: '@pulumi/azure-native', type: 'azure.sql.Server', imports: ['azure'] },
  'azure-cosmos': { package: '@pulumi/azure-native', type: 'azure.documentdb.DatabaseAccount', imports: ['azure'] },
  'azure-cosmosdb': { package: '@pulumi/azure-native', type: 'azure.documentdb.DatabaseAccount', imports: ['azure'] },
  'azure-mysql': { package: '@pulumi/azure-native', type: 'azure.dbformysql.Server', imports: ['azure'] },
  'azure-postgresql': { package: '@pulumi/azure-native', type: 'azure.dbforpostgresql.Server', imports: ['azure'] },
  'azure-aks': { package: '@pulumi/azure-native', type: 'azure.containerservice.ManagedCluster', imports: ['azure'] },
  'azure-acr': { package: '@pulumi/azure-native', type: 'azure.containerregistry.Registry', imports: ['azure'] },
  'azure-app-gw': { package: '@pulumi/azure-native', type: 'azure.network.ApplicationGateway', imports: ['azure'] },
  'azure-lb': { package: '@pulumi/azure-native', type: 'azure.network.LoadBalancer', imports: ['azure'] },
  'azure-key-vault': { package: '@pulumi/azure-native', type: 'azure.keyvault.Vault', imports: ['azure'] },
  'azure-keyvault': { package: '@pulumi/azure-native', type: 'azure.keyvault.Vault', imports: ['azure'] },
  'azure-redis': { package: '@pulumi/azure-native', type: 'azure.cache.Redis', imports: ['azure'] },
  'azure-service-bus': { package: '@pulumi/azure-native', type: 'azure.servicebus.Namespace', imports: ['azure'] },
  'azure-event-hub': { package: '@pulumi/azure-native', type: 'azure.eventhub.Namespace', imports: ['azure'] },
  'azure-firewall': { package: '@pulumi/azure-native', type: 'azure.network.AzureFirewall', imports: ['azure'] },
  'azure-bastion': { package: '@pulumi/azure-native', type: 'azure.network.BastionHost', imports: ['azure'] },
  'azure-public-ip': { package: '@pulumi/azure-native', type: 'azure.network.PublicIPAddress', imports: ['azure'] },
  'azure-nic': { package: '@pulumi/azure-native', type: 'azure.network.NetworkInterface', imports: ['azure'] },
  'azure-app-insights': { package: '@pulumi/azure-native', type: 'azure.insights.Component', imports: ['azure'] },
  'azure-log-analytics': { package: '@pulumi/azure-native', type: 'azure.operationalinsights.Workspace', imports: ['azure'] },

  // GCP
  'gcp-vpc': { package: '@pulumi/gcp', type: 'gcp.compute.Network', imports: ['gcp'] },
  'gcp-subnet': { package: '@pulumi/gcp', type: 'gcp.compute.Subnetwork', imports: ['gcp'] },
  'gcp-firewall-rule': { package: '@pulumi/gcp', type: 'gcp.compute.Firewall', imports: ['gcp'] },
  'gcp-compute-instance': { package: '@pulumi/gcp', type: 'gcp.compute.Instance', imports: ['gcp'] },
  'gcp-cloud-function': { package: '@pulumi/gcp', type: 'gcp.cloudfunctions.Function', imports: ['gcp'] },
  'gcp-cloud-run': { package: '@pulumi/gcp', type: 'gcp.cloudrun.Service', imports: ['gcp'] },
  'gcp-cloud-storage': { package: '@pulumi/gcp', type: 'gcp.storage.Bucket', imports: ['gcp'] },
  'gcp-cloud-sql': { package: '@pulumi/gcp', type: 'gcp.sql.DatabaseInstance', imports: ['gcp'] },
  'gcp-gke': { package: '@pulumi/gcp', type: 'gcp.container.Cluster', imports: ['gcp'] },
  'gcp-pubsub': { package: '@pulumi/gcp', type: 'gcp.pubsub.Topic', imports: ['gcp'] },
  'gcp-artifact-registry': { package: '@pulumi/gcp', type: 'gcp.artifactregistry.Repository', imports: ['gcp'] },
  'gcp-memorystore': { package: '@pulumi/gcp', type: 'gcp.redis.Instance', imports: ['gcp'] },
  'gcp-bigquery': { package: '@pulumi/gcp', type: 'gcp.bigquery.Dataset', imports: ['gcp'] },
  'gcp-lb': { package: '@pulumi/gcp', type: 'gcp.compute.ForwardingRule', imports: ['gcp'] },
  'gcp-cloud-dns': { package: '@pulumi/gcp', type: 'gcp.dns.ManagedZone', imports: ['gcp'] },
  'gcp-cloud-nat': { package: '@pulumi/gcp', type: 'gcp.compute.RouterNat', imports: ['gcp'] },
  'gcp-cloud-monitoring': { package: '@pulumi/gcp', type: 'gcp.monitoring.AlertPolicy', imports: ['gcp'] },
  'gcp-firestore': { package: '@pulumi/gcp', type: 'gcp.firestore.Database', imports: ['gcp'] },
  'gcp-cloud-spanner': { package: '@pulumi/gcp', type: 'gcp.spanner.Instance', imports: ['gcp'] },
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/^[0-9]/, '_$&').toLowerCase()
}

function getNodeComponentId(node: Node): string {
  return (node.data as any)?.componentId || (node.data as any)?.component || node.type || ''
}

function buildNodeMap(nodes: Node[]): Map<string, Node> {
  const m = new Map<string, Node>()
  for (const n of nodes) m.set(n.id, n)
  return m
}

function findAncestor(nodeId: string, targetComponentId: string, nodeMap: Map<string, Node>): Node | null {
  let current = nodeMap.get(nodeId)
  while (current?.parentId) {
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    if (getNodeComponentId(parent) === targetComponentId) return parent
    current = parent
  }
  return null
}

function findConnectedNodes(nodeId: string, targetTypes: string[], edges: Edge[], nodeMap: Map<string, Node>): Node[] {
  const results: Node[] = []
  for (const edge of edges) {
    const otherId = edge.source === nodeId ? edge.target : edge.target === nodeId ? edge.source : null
    if (!otherId) continue
    const other = nodeMap.get(otherId)
    if (other && targetTypes.includes(getNodeComponentId(other))) results.push(other)
  }
  return results
}

export function generatePulumi(nodes: Node[], edges: Edge[]): string {
  const resources: PulumiResource[] = []
  const imports = new Set<string>()
  const nodeMap = buildNodeMap(nodes)
  const nodeIdToVar = new Map<string, string>()

  // First pass: assign variable names and collect imports
  for (const node of nodes) {
    const componentId = getNodeComponentId(node)
    const mapping = PULUMI_MAPPINGS[componentId]
    if (!mapping) continue
    const varName = sanitizeName(String(node.data?.label || node.id))
    nodeIdToVar.set(node.id, varName)
    mapping.imports.forEach(i => imports.add(i))
  }

  // Second pass: generate resources with context
  for (const node of nodes) {
    const componentId = getNodeComponentId(node)
    const mapping = PULUMI_MAPPINGS[componentId]
    if (!mapping) continue

    const varName = nodeIdToVar.get(node.id)!
    const cfg = (node.data as any)?.config || {}
    const deps: string[] = []
    const props: Record<string, unknown> = { ...cfg }

    // --- AWS parent-child context ---
    if (componentId.startsWith('aws-')) {
      const vpcNode = findAncestor(node.id, 'aws-vpc', nodeMap)
      const subnetNode = findAncestor(node.id, 'aws-subnet', nodeMap)
      const vpcVar = vpcNode ? nodeIdToVar.get(vpcNode.id) : null
      const subnetVar = subnetNode ? nodeIdToVar.get(subnetNode.id) : null

      if (componentId === 'aws-subnet' && vpcVar) {
        props.vpcId = `REF:${vpcVar}.id`; deps.push(vpcVar)
        if (!props.cidrBlock) props.cidrBlock = '10.0.1.0/24'
      }
      if (['aws-security-group', 'aws-route-table', 'aws-nacl', 'aws-internet-gateway'].includes(componentId)) {
        const vpc = vpcVar || findConnectedNodes(node.id, ['aws-vpc'], edges, nodeMap).map(n => nodeIdToVar.get(n.id))[0]
        if (vpc) { props.vpcId = `REF:${vpc}.id`; deps.push(vpc) }
      }
      if (['aws-ec2', 'aws-rds', 'aws-aurora', 'aws-elasticache', 'aws-nat-gateway'].includes(componentId) && subnetVar) {
        props.subnetId = `REF:${subnetVar}.id`; deps.push(subnetVar)
        if (vpcVar) deps.push(vpcVar)
      }
      if (['aws-alb', 'aws-nlb'].includes(componentId) && subnetVar) {
        props.subnets = `REF_ARRAY:[${subnetVar}.id]`; deps.push(subnetVar)
      }
      if (componentId === 'aws-eks' && subnetVar) {
        props.vpcConfig = { subnetIds: `REF_ARRAY:[${subnetVar}.id]` }; deps.push(subnetVar)
      }
      if (componentId === 'aws-lambda' && subnetVar) {
        const sgs = findConnectedNodes(node.id, ['aws-security-group'], edges, nodeMap).map(n => nodeIdToVar.get(n.id)!).filter(Boolean)
        props.vpcConfig = { subnetIds: `REF_ARRAY:[${subnetVar}.id]`, securityGroupIds: sgs.length > 0 ? `REF_ARRAY:[${sgs.map(s => s + '.id').join(', ')}]` : '[]' }
        deps.push(subnetVar, ...sgs)
      }

      // Edge-based: security groups
      if (['aws-ec2', 'aws-rds', 'aws-aurora', 'aws-ecs', 'aws-eks', 'aws-elasticache'].includes(componentId)) {
        const sgNodes = findConnectedNodes(node.id, ['aws-security-group'], edges, nodeMap)
        const sgVars = sgNodes.map(n => nodeIdToVar.get(n.id)!).filter(Boolean)
        if (sgVars.length > 0) {
          props.vpcSecurityGroupIds = `REF_ARRAY:[${sgVars.map(s => s + '.id').join(', ')}]`
          deps.push(...sgVars)
        }
      }
      if (componentId === 'aws-nat-gateway') {
        const eipNodes = findConnectedNodes(node.id, ['aws-eip'], edges, nodeMap)
        if (eipNodes.length > 0) {
          const eipVar = nodeIdToVar.get(eipNodes[0].id)
          if (eipVar) { props.allocationId = `REF:${eipVar}.id`; deps.push(eipVar) }
        }
      }
    }

    // --- Azure parent-child context ---
    if (componentId.startsWith('azure-')) {
      const vnetNode = findAncestor(node.id, 'azure-vnet', nodeMap)
      const subnetNode = findAncestor(node.id, 'azure-subnet', nodeMap)
      const vnetVar = vnetNode ? nodeIdToVar.get(vnetNode.id) : null
      const subnetVar = subnetNode ? nodeIdToVar.get(subnetNode.id) : null

      if (componentId === 'azure-subnet' && vnetVar) {
        props.virtualNetworkName = `REF:${vnetVar}.name`; deps.push(vnetVar)
        if (!props.addressPrefix) props.addressPrefix = '10.0.1.0/24'
      }
      if (['azure-vm', 'azure-vmss', 'azure-aks', 'azure-container-instance'].includes(componentId) && subnetVar) {
        props._subnetId = `REF:${subnetVar}.id`; deps.push(subnetVar)
        if (vnetVar) deps.push(vnetVar)
      }
      if (['azure-firewall', 'azure-bastion'].includes(componentId) && vnetVar) {
        deps.push(vnetVar)
      }

      // Edge-based: NSG
      const nsgNodes = findConnectedNodes(node.id, ['azure-nsg'], edges, nodeMap)
      if (nsgNodes.length > 0) {
        const nsgVar = nodeIdToVar.get(nsgNodes[0].id)
        if (nsgVar) deps.push(nsgVar)
      }
    }

    // --- GCP parent-child context ---
    if (componentId.startsWith('gcp-')) {
      const vpcNode = findAncestor(node.id, 'gcp-vpc', nodeMap)
      const subnetNode = findAncestor(node.id, 'gcp-subnet', nodeMap)
      const vpcVar = vpcNode ? nodeIdToVar.get(vpcNode.id) : null
      const subnetVar = subnetNode ? nodeIdToVar.get(subnetNode.id) : null

      if (componentId === 'gcp-subnet' && vpcVar) {
        props.network = `REF:${vpcVar}.id`; deps.push(vpcVar)
        if (!props.ipCidrRange) props.ipCidrRange = '10.0.1.0/24'
      }
      if (componentId === 'gcp-firewall-rule' && vpcVar) {
        props.network = `REF:${vpcVar}.selfLink`; deps.push(vpcVar)
      }
      if (['gcp-compute-instance', 'gcp-cloud-sql', 'gcp-gke', 'gcp-memorystore'].includes(componentId) && subnetVar) {
        props._subnetwork = `REF:${subnetVar}.id`; deps.push(subnetVar)
        if (vpcVar) deps.push(vpcVar)
      }
    }

    // Tags
    if (componentId.startsWith('aws-')) {
      props.tags = { ...(props.tags as any || {}), Name: node.data?.label || varName, ManagedBy: 'Pulumi', GeneratedFrom: 'JobStack' }
    }

    // Edge-based deps from remaining edges
    for (const edge of edges) {
      const otherId = edge.source === node.id ? edge.target : edge.target === node.id ? edge.source : null
      if (otherId) {
        const otherVar = nodeIdToVar.get(otherId)
        if (otherVar && !deps.includes(otherVar)) deps.push(otherVar)
      }
    }

    resources.push({ name: String(node.data?.label || node.id), varName, type: mapping.type, properties: props, dependencies: [...new Set(deps)], componentId })
  }

  // Generate code
  const lines: string[] = []
  lines.push('import * as pulumi from "@pulumi/pulumi";')
  if (imports.has('aws')) lines.push('import * as aws from "@pulumi/aws";')
  if (imports.has('azure')) lines.push('import * as azure from "@pulumi/azure-native";')
  if (imports.has('gcp')) lines.push('import * as gcp from "@pulumi/gcp";')
  lines.push('')
  lines.push('// Configuration')
  lines.push('const config = new pulumi.Config();')
  if (imports.has('azure')) {
    lines.push('const resourceGroupName = config.require("resourceGroupName");')
    lines.push('const location = config.get("location") || "westeurope";')
  }
  lines.push('')
  lines.push('// ========== Resources ==========')
  lines.push('')

  for (const resource of resources) {
    const propsStr = formatProperties(resource.properties, resource.dependencies, 2, resource.componentId.startsWith('azure-'))
    lines.push(`const ${resource.varName} = new ${resource.type}("${resource.varName}", ${propsStr});`)
    lines.push('')
  }

  lines.push('// ========== Exports ==========')
  for (const resource of resources) {
    lines.push(`export const ${resource.varName}Id = ${resource.varName}.id;`)
  }

  return lines.join('\n')
}

function formatProperties(props: Record<string, unknown>, deps: string[], indent: number, isAzure: boolean): string {
  const pad = ' '.repeat(indent)
  const entries: string[] = []

  // Azure resources need resourceGroupName and location
  if (isAzure) {
    entries.push(`${pad}resourceGroupName: resourceGroupName,`)
    entries.push(`${pad}location: location,`)
  }

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('_')) continue // internal markers
    if (typeof value === 'string' && value.startsWith('REF:')) {
      const ref = value.substring(4)
      entries.push(`${pad}${key}: ${ref},`)
    } else if (typeof value === 'string' && value.startsWith('REF_ARRAY:')) {
      const ref = value.substring(10).replace(/^\[/, '[').replace(/\]$/, ']')
      entries.push(`${pad}${key}: ${ref},`)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const inner = formatNestedObject(value as Record<string, unknown>, indent + 2)
      entries.push(`${pad}${key}: ${inner},`)
    } else {
      entries.push(`${pad}${key}: ${JSON.stringify(value)},`)
    }
  }

  let result = '{\n' + entries.join('\n') + '\n' + ' '.repeat(indent - 2) + '}'

  if (deps.length > 0) {
    result += `, { dependsOn: [${deps.join(', ')}] }`
  }

  return result
}

function formatNestedObject(obj: Record<string, unknown>, indent: number): string {
  const pad = ' '.repeat(indent)
  const entries: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('REF:')) {
      entries.push(`${pad}${key}: ${value.substring(4)},`)
    } else if (typeof value === 'string' && value.startsWith('REF_ARRAY:')) {
      entries.push(`${pad}${key}: ${value.substring(10)},`)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      entries.push(`${pad}${key}: ${formatNestedObject(value as Record<string, unknown>, indent + 2)},`)
    } else {
      entries.push(`${pad}${key}: ${JSON.stringify(value)},`)
    }
  }
  return '{\n' + entries.join('\n') + '\n' + ' '.repeat(indent - 2) + '}'
}
