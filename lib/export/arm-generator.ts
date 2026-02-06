import { Node, Edge } from '@xyflow/react'

/**
 * Azure ARM Template Generator
 * Converts diagram to Azure Resource Manager templates
 */

interface ARMResource {
  type: string
  apiVersion: string
  name: string
  location: string
  properties: Record<string, unknown>
  dependsOn?: string[]
  tags?: Record<string, string>
}

interface ARMTemplate {
  $schema: string
  contentVersion: string
  parameters: Record<string, unknown>
  variables: Record<string, unknown>
  resources: ARMResource[]
  outputs: Record<string, unknown>
}

// Map our component types to ARM resource types
const ARM_MAPPINGS: Record<string, { type: string; apiVersion: string; defaultProps: Record<string, unknown> }> = {
  'azure-vnet': { 
    type: 'Microsoft.Network/virtualNetworks', 
    apiVersion: '2023-05-01',
    defaultProps: { 
      addressSpace: { addressPrefixes: ['10.0.0.0/16'] },
      enableDdosProtection: false
    } 
  },
  'azure-subnet': { 
    type: 'Microsoft.Network/virtualNetworks/subnets', 
    apiVersion: '2023-05-01',
    defaultProps: { 
      addressPrefix: '10.0.1.0/24' 
    } 
  },
  'azure-nsg': { 
    type: 'Microsoft.Network/networkSecurityGroups', 
    apiVersion: '2023-05-01',
    defaultProps: { 
      securityRules: [] 
    } 
  },
  'azure-vm': { 
    type: 'Microsoft.Compute/virtualMachines', 
    apiVersion: '2023-07-01',
    defaultProps: { 
      hardwareProfile: { vmSize: 'Standard_B2s' },
      storageProfile: {
        imageReference: {
          publisher: 'Canonical',
          offer: 'UbuntuServer',
          sku: '22.04-LTS',
          version: 'latest'
        }
      }
    } 
  },
  'azure-functions': { 
    type: 'Microsoft.Web/sites', 
    apiVersion: '2023-01-01',
    defaultProps: { 
      kind: 'functionapp,linux',
      siteConfig: {
        linuxFxVersion: 'Node|18'
      }
    } 
  },
  'azure-app-service': { 
    type: 'Microsoft.Web/sites', 
    apiVersion: '2023-01-01',
    defaultProps: { 
      kind: 'app,linux',
      siteConfig: {
        linuxFxVersion: 'NODE|18-lts'
      }
    } 
  },
  'azure-blob': { 
    type: 'Microsoft.Storage/storageAccounts', 
    apiVersion: '2023-01-01',
    defaultProps: { 
      kind: 'StorageV2',
      sku: { name: 'Standard_LRS' },
      minimumTlsVersion: 'TLS1_2',
      supportsHttpsTrafficOnly: true
    } 
  },
  'azure-sql': { 
    type: 'Microsoft.Sql/servers', 
    apiVersion: '2023-05-01-preview',
    defaultProps: { 
      version: '12.0',
      minimalTlsVersion: '1.2'
    } 
  },
  'azure-cosmosdb': { 
    type: 'Microsoft.DocumentDB/databaseAccounts', 
    apiVersion: '2023-09-15',
    defaultProps: { 
      kind: 'GlobalDocumentDB',
      databaseAccountOfferType: 'Standard',
      consistencyPolicy: {
        defaultConsistencyLevel: 'Session'
      }
    } 
  },
  'azure-aks': { 
    type: 'Microsoft.ContainerService/managedClusters', 
    apiVersion: '2023-08-01',
    defaultProps: { 
      kubernetesVersion: '1.28',
      dnsPrefix: 'aks',
      agentPoolProfiles: [{
        name: 'default',
        count: 3,
        vmSize: 'Standard_DS2_v2',
        mode: 'System'
      }]
    } 
  },
  'azure-app-gw': { 
    type: 'Microsoft.Network/applicationGateways', 
    apiVersion: '2023-05-01',
    defaultProps: { 
      sku: {
        name: 'Standard_v2',
        tier: 'Standard_v2'
      }
    } 
  },
  'azure-keyvault': { 
    type: 'Microsoft.KeyVault/vaults', 
    apiVersion: '2023-07-01',
    defaultProps: { 
      sku: { name: 'standard', family: 'A' },
      enableSoftDelete: true,
      softDeleteRetentionInDays: 90
    } 
  },
  'azure-redis': { 
    type: 'Microsoft.Cache/Redis', 
    apiVersion: '2023-08-01',
    defaultProps: { 
      sku: { name: 'Basic', family: 'C', capacity: 0 },
      enableNonSslPort: false,
      minimumTlsVersion: '1.2'
    } 
  },
  'azure-service-bus': { 
    type: 'Microsoft.ServiceBus/namespaces', 
    apiVersion: '2022-10-01-preview',
    defaultProps: { 
      sku: { name: 'Standard', tier: 'Standard' }
    } 
  },
  'azure-event-grid': { 
    type: 'Microsoft.EventGrid/topics', 
    apiVersion: '2023-06-01-preview',
    defaultProps: { 
      inputSchema: 'EventGridSchema'
    } 
  },
  'azure-container-apps': { 
    type: 'Microsoft.App/containerApps', 
    apiVersion: '2023-05-01',
    defaultProps: { 
      configuration: {
        ingress: {
          external: true,
          targetPort: 80
        }
      }
    } 
  },
}

function sanitizeARMName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 24)
}

export function generateARM(nodes: Node[], edges: Edge[]): string {
  const template: ARMTemplate = {
    $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    parameters: {
      location: {
        type: 'string',
        defaultValue: '[resourceGroup().location]',
        metadata: {
          description: 'Location for all resources'
        }
      },
      environment: {
        type: 'string',
        defaultValue: 'development',
        allowedValues: ['development', 'staging', 'production'],
        metadata: {
          description: 'Deployment environment'
        }
      }
    },
    variables: {
      resourcePrefix: "[concat('js-', parameters('environment'), '-')]"
    },
    resources: [],
    outputs: {}
  }

  const nodeIdToName = new Map<string, string>()

  // Generate resources
  for (const node of nodes) {
    const type = node.type || ''
    const mapping = ARM_MAPPINGS[type]
    
    if (!mapping) continue

    const baseName = sanitizeARMName(String(node.data?.label || node.id))
    const resourceName = `[concat(variables('resourcePrefix'), '${baseName}')]`
    nodeIdToName.set(node.id, baseName)

    const resource: ARMResource = {
      type: mapping.type,
      apiVersion: mapping.apiVersion,
      name: resourceName,
      location: "[parameters('location')]",
      properties: { ...mapping.defaultProps },
      tags: {
        Environment: "[parameters('environment')]",
        ManagedBy: 'ARM',
        GeneratedFrom: 'JobStack',
        DisplayName: String(node.data?.label || baseName)
      }
    }

    template.resources.push(resource)

    // Add outputs for key resources
    if (['azure-vnet', 'azure-blob', 'azure-sql', 'azure-aks', 'azure-keyvault'].includes(type)) {
      template.outputs[`${baseName}Id`] = {
        type: 'string',
        value: `[resourceId('${mapping.type}', ${resourceName})]`
      }
    }
  }

  // Add dependencies from edges
  for (const edge of edges) {
    const sourceName = nodeIdToName.get(edge.source)
    const targetName = nodeIdToName.get(edge.target)
    if (sourceName && targetName) {
      const targetResource = template.resources.find(r => 
        r.name.includes(targetName)
      )
      if (targetResource) {
        if (!targetResource.dependsOn) {
          targetResource.dependsOn = []
        }
        const sourceResource = template.resources.find(r => 
          r.name.includes(sourceName)
        )
        if (sourceResource) {
          targetResource.dependsOn.push(
            `[resourceId('${sourceResource.type}', concat(variables('resourcePrefix'), '${sourceName}'))]`
          )
        }
      }
    }
  }

  return JSON.stringify(template, null, 2)
}
