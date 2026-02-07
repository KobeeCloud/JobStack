import { Node, Edge } from '@xyflow/react'

/**
 * Infrastructure Drift Detection
 * Compares a Terraform state file against diagram nodes to detect drift.
 */

interface TerraformStateResource {
  type: string
  name: string
  provider: string
  instances: {
    attributes: Record<string, unknown>
    schema_version?: number
  }[]
}

interface TerraformState {
  version: number
  resources: TerraformStateResource[]
}

export interface DriftResult {
  status: 'in-sync' | 'drifted' | 'error'
  summary: {
    totalInState: number
    totalInDiagram: number
    matched: number
    missingInDiagram: string[]
    missingInState: string[]
    attributeDifferences: AttributeDiff[]
  }
  timestamp: string
}

export interface AttributeDiff {
  resourceId: string
  resourceName: string
  attribute: string
  stateValue: unknown
  diagramValue: unknown
}

// Map Terraform resource types to diagram component types
const TF_TO_DIAGRAM_MAP: Record<string, string> = {
  'aws_instance': 'aws-ec2',
  'aws_vpc': 'aws-vpc',
  'aws_subnet': 'aws-subnet',
  'aws_s3_bucket': 'aws-s3',
  'aws_rds_instance': 'aws-rds',
  'aws_lambda_function': 'aws-lambda',
  'aws_ecs_cluster': 'aws-ecs',
  'aws_eks_cluster': 'aws-eks',
  'aws_lb': 'aws-alb',
  'aws_security_group': 'aws-security-group',
  'azurerm_virtual_machine': 'azure-vm',
  'azurerm_linux_virtual_machine': 'azure-vm',
  'azurerm_virtual_network': 'azure-vnet',
  'azurerm_subnet': 'azure-subnet',
  'azurerm_storage_account': 'azure-blob',
  'azurerm_mssql_database': 'azure-sql',
  'azurerm_kubernetes_cluster': 'azure-aks',
  'azurerm_function_app': 'azure-functions',
  'azurerm_app_service': 'azure-app-service',
  'azurerm_network_security_group': 'azure-nsg',
  'azurerm_cosmosdb_account': 'azure-cosmosdb',
  'azurerm_key_vault': 'azure-keyvault',
  'google_compute_instance': 'gcp-compute',
  'google_compute_network': 'gcp-vpc',
  'google_compute_subnetwork': 'gcp-subnet',
  'google_storage_bucket': 'gcp-storage',
  'google_sql_database_instance': 'gcp-cloud-sql',
  'google_container_cluster': 'gcp-gke',
  'google_cloudfunctions_function': 'gcp-functions',
}

export function parseTerraformState(stateJson: string): TerraformState | null {
  try {
    const state = JSON.parse(stateJson)
    if (!state.resources || !Array.isArray(state.resources)) {
      return null
    }
    return state as TerraformState
  } catch {
    return null
  }
}

export function detectDrift(
  state: TerraformState,
  nodes: Node[],
  _edges: Edge[]
): DriftResult {
  const timestamp = new Date().toISOString()

  // Build a map of diagram nodes by their terraform type + name
  const diagramNodeMap = new Map<string, Node>()
  for (const node of nodes) {
    const data = node.data as { terraformType?: string; terraformName?: string; label?: string }
    const key = data.terraformType && data.terraformName
      ? `${data.terraformType}.${data.terraformName}`
      : null

    if (key) {
      diagramNodeMap.set(key, node)
    }
  }

  // Build a map of diagram nodes by component type for fallback matching
  const diagramByType = new Map<string, Node[]>()
  for (const node of nodes) {
    const type = node.type || ''
    if (!diagramByType.has(type)) diagramByType.set(type, [])
    diagramByType.get(type)!.push(node)
  }

  const matched: string[] = []
  const missingInDiagram: string[] = []
  const missingInState: string[] = []
  const attributeDifferences: AttributeDiff[] = []

  // Check state resources against diagram
  for (const resource of state.resources) {
    if (resource.type === 'terraform_data') continue // skip data resources

    const stateKey = `${resource.type}.${resource.name}`
    const diagramNode = diagramNodeMap.get(stateKey)

    if (diagramNode) {
      matched.push(stateKey)

      // Compare key attributes
      if (resource.instances.length > 0) {
        const attrs = resource.instances[0].attributes
        const nodeData = diagramNode.data as Record<string, unknown>

        // Compare commonly tracked attributes
        const trackedAttrs = ['instance_type', 'machine_type', 'size', 'sku_name', 'engine_version']
        for (const attr of trackedAttrs) {
          if (attrs[attr] !== undefined && nodeData[attr] !== undefined) {
            if (String(attrs[attr]) !== String(nodeData[attr])) {
              attributeDifferences.push({
                resourceId: stateKey,
                resourceName: resource.name,
                attribute: attr,
                stateValue: attrs[attr],
                diagramValue: nodeData[attr],
              })
            }
          }
        }
      }
    } else {
      // Try fallback matching by component type
      const diagramType = TF_TO_DIAGRAM_MAP[resource.type]
      if (diagramType && diagramByType.has(diagramType)) {
        const candidateNodes = diagramByType.get(diagramType)!
        const nameMatch = candidateNodes.find(n => {
          const label = ((n.data as { label?: string })?.label || '').toLowerCase()
          return label === resource.name.toLowerCase() ||
                 label.replace(/[-_]/g, '') === resource.name.replace(/[-_]/g, '')
        })

        if (nameMatch) {
          matched.push(stateKey)
        } else {
          missingInDiagram.push(`${resource.type}.${resource.name}`)
        }
      } else {
        missingInDiagram.push(`${resource.type}.${resource.name}`)
      }
    }
  }

  // Check diagram nodes not in state
  const stateKeys = new Set(state.resources.map(r => `${r.type}.${r.name}`))
  for (const node of nodes) {
    const data = node.data as { terraformType?: string; terraformName?: string; label?: string; imported?: boolean }
    if (data.imported && data.terraformType && data.terraformName) {
      const key = `${data.terraformType}.${data.terraformName}`
      if (!stateKeys.has(key)) {
        missingInState.push(`${data.terraformType}.${data.terraformName} (${data.label || 'unnamed'})`)
      }
    }
  }

  const hasDrift = missingInDiagram.length > 0 ||
                   missingInState.length > 0 ||
                   attributeDifferences.length > 0

  return {
    status: hasDrift ? 'drifted' : 'in-sync',
    summary: {
      totalInState: state.resources.length,
      totalInDiagram: nodes.length,
      matched: matched.length,
      missingInDiagram,
      missingInState,
      attributeDifferences,
    },
    timestamp,
  }
}
