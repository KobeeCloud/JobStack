import { Node, Edge } from '@xyflow/react'

// Simple UUID generator
function generateId(): string {
  return 'tf-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

/**
 * Terraform Import Parser
 * Reverse-engineers Terraform files into visual diagram components
 */

interface TerraformResource {
  type: string
  name: string
  provider: string
  attributes: Record<string, unknown>
  dependencies: string[]
}

interface TerraformVariable {
  name: string
  type?: string
  default?: unknown
  description?: string
}

interface TerraformOutput {
  name: string
  value: string
  description?: string
}

interface TerraformModule {
  name: string
  source: string
  variables: Record<string, unknown>
}

interface ParsedTerraform {
  resources: TerraformResource[]
  variables: TerraformVariable[]
  outputs: TerraformOutput[]
  modules: TerraformModule[]
  providers: string[]
}

// Mapping Terraform resource types to our component types
const RESOURCE_MAPPINGS: Record<string, { componentType: string; category: string }> = {
  // AWS Resources
  'aws_instance': { componentType: 'aws-ec2', category: 'compute' },
  'aws_lambda_function': { componentType: 'aws-lambda', category: 'compute' },
  'aws_ecs_cluster': { componentType: 'aws-ecs', category: 'compute' },
  'aws_ecs_service': { componentType: 'aws-ecs', category: 'compute' },
  'aws_eks_cluster': { componentType: 'aws-eks', category: 'compute' },
  'aws_s3_bucket': { componentType: 'aws-s3', category: 'storage' },
  'aws_rds_instance': { componentType: 'aws-rds', category: 'database' },
  'aws_rds_cluster': { componentType: 'aws-rds', category: 'database' },
  'aws_dynamodb_table': { componentType: 'aws-dynamodb', category: 'database' },
  'aws_elasticache_cluster': { componentType: 'aws-elasticache', category: 'database' },
  'aws_vpc': { componentType: 'aws-vpc', category: 'networking' },
  'aws_subnet': { componentType: 'aws-subnet', category: 'networking' },
  'aws_security_group': { componentType: 'aws-security-group', category: 'networking' },
  'aws_lb': { componentType: 'aws-alb', category: 'networking' },
  'aws_alb': { componentType: 'aws-alb', category: 'networking' },
  'aws_api_gateway_rest_api': { componentType: 'aws-api-gateway', category: 'networking' },
  'aws_cloudfront_distribution': { componentType: 'aws-cloudfront', category: 'networking' },
  'aws_route53_zone': { componentType: 'aws-route53', category: 'networking' },
  'aws_sqs_queue': { componentType: 'aws-sqs', category: 'integration' },
  'aws_sns_topic': { componentType: 'aws-sns', category: 'integration' },
  'aws_cognito_user_pool': { componentType: 'aws-cognito', category: 'security' },
  'aws_kms_key': { componentType: 'aws-kms', category: 'security' },

  // Azure Resources
  'azurerm_virtual_machine': { componentType: 'azure-vm', category: 'compute' },
  'azurerm_linux_virtual_machine': { componentType: 'azure-vm', category: 'compute' },
  'azurerm_windows_virtual_machine': { componentType: 'azure-vm', category: 'compute' },
  'azurerm_function_app': { componentType: 'azure-functions', category: 'compute' },
  'azurerm_app_service': { componentType: 'azure-app-service', category: 'compute' },
  'azurerm_kubernetes_cluster': { componentType: 'azure-aks', category: 'compute' },
  'azurerm_container_app': { componentType: 'azure-container-apps', category: 'compute' },
  'azurerm_storage_account': { componentType: 'azure-blob', category: 'storage' },
  'azurerm_mssql_server': { componentType: 'azure-sql', category: 'database' },
  'azurerm_mssql_database': { componentType: 'azure-sql', category: 'database' },
  'azurerm_cosmosdb_account': { componentType: 'azure-cosmosdb', category: 'database' },
  'azurerm_redis_cache': { componentType: 'azure-redis', category: 'database' },
  'azurerm_virtual_network': { componentType: 'azure-vnet', category: 'networking' },
  'azurerm_subnet': { componentType: 'azure-subnet', category: 'networking' },
  'azurerm_network_security_group': { componentType: 'azure-nsg', category: 'networking' },
  'azurerm_application_gateway': { componentType: 'azure-app-gw', category: 'networking' },
  'azurerm_lb': { componentType: 'azure-lb', category: 'networking' },
  'azurerm_public_ip': { componentType: 'azure-public-ip', category: 'networking' },
  'azurerm_frontdoor': { componentType: 'azure-front-door', category: 'networking' },
  'azurerm_dns_zone': { componentType: 'azure-dns', category: 'networking' },
  'azurerm_servicebus_namespace': { componentType: 'azure-service-bus', category: 'integration' },
  'azurerm_eventgrid_topic': { componentType: 'azure-event-grid', category: 'integration' },
  'azurerm_key_vault': { componentType: 'azure-keyvault', category: 'security' },
  'azurerm_active_directory_domain_service': { componentType: 'azure-ad', category: 'security' },

  // GCP Resources
  'google_compute_instance': { componentType: 'gcp-compute', category: 'compute' },
  'google_cloudfunctions_function': { componentType: 'gcp-functions', category: 'compute' },
  'google_cloud_run_service': { componentType: 'gcp-cloud-run', category: 'compute' },
  'google_container_cluster': { componentType: 'gcp-gke', category: 'compute' },
  'google_app_engine_application': { componentType: 'gcp-app-engine', category: 'compute' },
  'google_storage_bucket': { componentType: 'gcp-storage', category: 'storage' },
  'google_sql_database_instance': { componentType: 'gcp-cloud-sql', category: 'database' },
  'google_firestore_database': { componentType: 'gcp-firestore', category: 'database' },
  'google_spanner_instance': { componentType: 'gcp-spanner', category: 'database' },
  'google_compute_network': { componentType: 'gcp-vpc', category: 'networking' },
  'google_compute_subnetwork': { componentType: 'gcp-subnet', category: 'networking' },
  'google_compute_firewall': { componentType: 'gcp-firewall', category: 'networking' },
  'google_compute_global_address': { componentType: 'gcp-load-balancer', category: 'networking' },
  'google_pubsub_topic': { componentType: 'gcp-pubsub', category: 'integration' },
  'google_kms_key_ring': { componentType: 'gcp-kms', category: 'security' },
}

// Parse HCL-like Terraform syntax (simplified parser)
function parseTerraformHCL(content: string): ParsedTerraform {
  const result: ParsedTerraform = {
    resources: [],
    variables: [],
    outputs: [],
    modules: [],
    providers: [],
  }

  // Remove comments
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
    .replace(/#.*$/gm, '')             // Hash comments
    .replace(/\/\/.*$/gm, '')          // Double-slash comments

  // Parse resource blocks
  const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  let match

  while ((match = resourceRegex.exec(cleanContent)) !== null) {
    const [, type, name, body] = match
    const provider = type.split('_')[0]

    // Extract dependencies
    const dependencies: string[] = []
    const depRegex = /\$\{([^.]+)\.([^.]+)/g
    let depMatch
    while ((depMatch = depRegex.exec(body)) !== null) {
      dependencies.push(`${depMatch[1]}.${depMatch[2]}`)
    }

    // Also check for newer HCL2 references
    const refRegex = /([a-z_]+)\.([a-z_][a-z0-9_]*)\./g
    while ((depMatch = refRegex.exec(body)) !== null) {
      if (['resource', 'data', 'var', 'local'].includes(depMatch[1])) continue
      dependencies.push(`${depMatch[1]}.${depMatch[2]}`)
    }

    result.resources.push({
      type,
      name,
      provider: provider === 'azurerm' ? 'azure' : provider === 'google' ? 'gcp' : provider,
      attributes: parseAttributes(body),
      dependencies: [...new Set(dependencies)],
    })

    if (!result.providers.includes(provider)) {
      result.providers.push(provider)
    }
  }

  // Parse variable blocks
  const variableRegex = /variable\s+"([^"]+)"\s*\{([^}]*)\}/g
  while ((match = variableRegex.exec(cleanContent)) !== null) {
    const [, name, body] = match
    const attrs = parseAttributes(body)
    result.variables.push({
      name,
      type: attrs.type as string | undefined,
      default: attrs.default,
      description: attrs.description as string | undefined,
    })
  }

  // Parse output blocks
  const outputRegex = /output\s+"([^"]+)"\s*\{([^}]*)\}/g
  while ((match = outputRegex.exec(cleanContent)) !== null) {
    const [, name, body] = match
    const attrs = parseAttributes(body)
    result.outputs.push({
      name,
      value: attrs.value as string || '',
      description: attrs.description as string | undefined,
    })
  }

  // Parse module blocks
  const moduleRegex = /module\s+"([^"]+)"\s*\{([^}]*)\}/g
  while ((match = moduleRegex.exec(cleanContent)) !== null) {
    const [, name, body] = match
    const attrs = parseAttributes(body)
    result.modules.push({
      name,
      source: attrs.source as string || '',
      variables: attrs,
    })
  }

  return result
}

function parseAttributes(body: string): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}

  // Simple key = value parsing
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g
  let match
  while ((match = attrRegex.exec(body)) !== null) {
    attrs[match[1]] = match[2]
  }

  // Parse boolean values
  const boolRegex = /(\w+)\s*=\s*(true|false)/g
  while ((match = boolRegex.exec(body)) !== null) {
    attrs[match[1]] = match[2] === 'true'
  }

  // Parse number values
  const numRegex = /(\w+)\s*=\s*(\d+)/g
  while ((match = numRegex.exec(body)) !== null) {
    attrs[match[1]] = parseInt(match[2], 10)
  }

  return attrs
}

// Convert parsed Terraform to diagram nodes and edges
export function convertToNodes(parsed: ParsedTerraform): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const resourceIdMap = new Map<string, string>() // terraform_id -> node_id

  // Layout configuration
  const categoryPositions: Record<string, { x: number; y: number; count: number }> = {
    networking: { x: 100, y: 100, count: 0 },
    compute: { x: 400, y: 100, count: 0 },
    database: { x: 700, y: 100, count: 0 },
    storage: { x: 1000, y: 100, count: 0 },
    integration: { x: 400, y: 400, count: 0 },
    security: { x: 700, y: 400, count: 0 },
    default: { x: 100, y: 400, count: 0 },
  }

  // Create nodes for resources
  parsed.resources.forEach(resource => {
    const mapping = RESOURCE_MAPPINGS[resource.type]
    const nodeId = generateId()
    const terraformId = `${resource.type}.${resource.name}`
    resourceIdMap.set(terraformId, nodeId)

    const category = mapping?.category || 'default'
    const pos = categoryPositions[category]

    const node: Node = {
      id: nodeId,
      type: mapping?.componentType || 'generic',
      position: {
        x: pos.x + (pos.count % 3) * 250,
        y: pos.y + Math.floor(pos.count / 3) * 150
      },
      data: {
        label: resource.name,
        provider: resource.provider,
        terraformType: resource.type,
        terraformName: resource.name,
        attributes: resource.attributes,
        imported: true,
      },
    }

    categoryPositions[category].count++
    nodes.push(node)
  })

  // Create edges for dependencies
  parsed.resources.forEach(resource => {
    const terraformId = `${resource.type}.${resource.name}`
    const sourceId = resourceIdMap.get(terraformId)
    if (!sourceId) return

    resource.dependencies.forEach(dep => {
      const targetId = resourceIdMap.get(dep)
      if (targetId) {
        edges.push({
          id: generateId(),
          source: targetId,
          target: sourceId,
          type: 'smoothstep',
          animated: false,
          data: {
            label: 'depends_on',
          },
        })
      }
    })
  })

  // Create nodes for modules
  parsed.modules.forEach((module, index) => {
    const nodeId = generateId()
    nodes.push({
      id: nodeId,
      type: 'module',
      position: { x: 100 + index * 250, y: 600 },
      data: {
        label: module.name,
        source: module.source,
        variables: module.variables,
        imported: true,
      },
    })
  })

  return { nodes, edges }
}

// Main import function
export function importTerraform(content: string): {
  nodes: Node[]
  edges: Edge[]
  parsed: ParsedTerraform
  warnings: string[]
} {
  const warnings: string[] = []

  try {
    const parsed = parseTerraformHCL(content)

    // Check for unmapped resources
    parsed.resources.forEach(resource => {
      if (!RESOURCE_MAPPINGS[resource.type]) {
        warnings.push(`Unknown resource type: ${resource.type} (mapped to generic node)`)
      }
    })

    const { nodes, edges } = convertToNodes(parsed)

    if (nodes.length === 0) {
      warnings.push('No resources found in Terraform file')
    }

    return { nodes, edges, parsed, warnings }
  } catch (error) {
    warnings.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      nodes: [],
      edges: [],
      parsed: { resources: [], variables: [], outputs: [], modules: [], providers: [] },
      warnings
    }
  }
}

// Import from multiple files (e.g., a directory)
export function importTerraformFiles(files: { name: string; content: string }[]): {
  nodes: Node[]
  edges: Edge[]
  warnings: string[]
} {
  const allNodes: Node[] = []
  const allEdges: Edge[] = []
  const allWarnings: string[] = []

  files.forEach(file => {
    const { nodes, edges, warnings } = importTerraform(file.content)

    // Add file context to warnings
    warnings.forEach(w => allWarnings.push(`[${file.name}] ${w}`))

    // Offset positions for each file to avoid overlap
    const offset = allNodes.length * 50
    nodes.forEach(node => {
      node.position.y += offset
    })

    allNodes.push(...nodes)
    allEdges.push(...edges)
  })

  return { nodes: allNodes, edges: allEdges, warnings: allWarnings }
}
