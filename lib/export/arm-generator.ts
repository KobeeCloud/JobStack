import { Node, Edge } from '@xyflow/react'
import {
  buildNodeMap,
  getNodeComponentId,
  findAncestorName,
  findConnectedNames,
} from '@/lib/generators/core/graph-utils'

/**
 * Azure ARM Template Generator
 * Converts diagram to Azure Resource Manager templates
 * Supports parent-child relationships (VNet->Subnet->VM, etc.)
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

const ARM_MAPPINGS: Record<
  string,
  { type: string; apiVersion: string; defaultProps: Record<string, unknown> }
> = {
  'azure-vnet': {
    type: 'Microsoft.Network/virtualNetworks',
    apiVersion: '2023-05-01',
    defaultProps: {
      addressSpace: { addressPrefixes: ['10.0.0.0/16'] },
      enableDdosProtection: false,
    },
  },
  'azure-subnet': {
    type: 'Microsoft.Network/virtualNetworks/subnets',
    apiVersion: '2023-05-01',
    defaultProps: { addressPrefix: '10.0.1.0/24' },
  },
  'azure-nsg': {
    type: 'Microsoft.Network/networkSecurityGroups',
    apiVersion: '2023-05-01',
    defaultProps: { securityRules: [] },
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
          version: 'latest',
        },
      },
    },
  },
  'azure-vmss': {
    type: 'Microsoft.Compute/virtualMachineScaleSets',
    apiVersion: '2023-07-01',
    defaultProps: { sku: { name: 'Standard_B2s', tier: 'Standard', capacity: 2 } },
  },
  'azure-functions': {
    type: 'Microsoft.Web/sites',
    apiVersion: '2023-01-01',
    defaultProps: { kind: 'functionapp,linux', siteConfig: { linuxFxVersion: 'Node|18' } },
  },
  'azure-function': {
    type: 'Microsoft.Web/sites',
    apiVersion: '2023-01-01',
    defaultProps: { kind: 'functionapp,linux', siteConfig: { linuxFxVersion: 'Node|18' } },
  },
  'azure-app-service': {
    type: 'Microsoft.Web/sites',
    apiVersion: '2023-01-01',
    defaultProps: { kind: 'app,linux', siteConfig: { linuxFxVersion: 'NODE|18-lts' } },
  },
  'azure-blob': {
    type: 'Microsoft.Storage/storageAccounts',
    apiVersion: '2023-01-01',
    defaultProps: {
      kind: 'StorageV2',
      sku: { name: 'Standard_LRS' },
      minimumTlsVersion: 'TLS1_2',
      supportsHttpsTrafficOnly: true,
    },
  },
  'azure-storage-account': {
    type: 'Microsoft.Storage/storageAccounts',
    apiVersion: '2023-01-01',
    defaultProps: { kind: 'StorageV2', sku: { name: 'Standard_LRS' }, minimumTlsVersion: 'TLS1_2' },
  },
  'azure-sql': {
    type: 'Microsoft.Sql/servers',
    apiVersion: '2023-05-01-preview',
    defaultProps: { version: '12.0', minimalTlsVersion: '1.2' },
  },
  'azure-cosmos': {
    type: 'Microsoft.DocumentDB/databaseAccounts',
    apiVersion: '2023-09-15',
    defaultProps: {
      kind: 'GlobalDocumentDB',
      databaseAccountOfferType: 'Standard',
      consistencyPolicy: { defaultConsistencyLevel: 'Session' },
    },
  },
  'azure-cosmosdb': {
    type: 'Microsoft.DocumentDB/databaseAccounts',
    apiVersion: '2023-09-15',
    defaultProps: {
      kind: 'GlobalDocumentDB',
      databaseAccountOfferType: 'Standard',
      consistencyPolicy: { defaultConsistencyLevel: 'Session' },
    },
  },
  'azure-mysql': {
    type: 'Microsoft.DBforMySQL/flexibleServers',
    apiVersion: '2023-06-30',
    defaultProps: { sku: { name: 'Standard_B1ms', tier: 'Burstable' }, version: '8.0.21' },
  },
  'azure-postgresql': {
    type: 'Microsoft.DBforPostgreSQL/flexibleServers',
    apiVersion: '2023-06-01-preview',
    defaultProps: { sku: { name: 'Standard_B1ms', tier: 'Burstable' }, version: '15' },
  },
  'azure-aks': {
    type: 'Microsoft.ContainerService/managedClusters',
    apiVersion: '2023-08-01',
    defaultProps: {
      kubernetesVersion: '1.28',
      dnsPrefix: 'aks',
      agentPoolProfiles: [{ name: 'default', count: 3, vmSize: 'Standard_DS2_v2', mode: 'System' }],
    },
  },
  'azure-acr': {
    type: 'Microsoft.ContainerRegistry/registries',
    apiVersion: '2023-07-01',
    defaultProps: { sku: { name: 'Standard' }, adminUserEnabled: false },
  },
  'azure-container-instance': {
    type: 'Microsoft.ContainerInstance/containerGroups',
    apiVersion: '2023-05-01',
    defaultProps: { osType: 'Linux' },
  },
  'azure-container-apps': {
    type: 'Microsoft.App/containerApps',
    apiVersion: '2023-05-01',
    defaultProps: { configuration: { ingress: { external: true, targetPort: 80 } } },
  },
  'azure-app-gw': {
    type: 'Microsoft.Network/applicationGateways',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard_v2', tier: 'Standard_v2' } },
  },
  'azure-lb': {
    type: 'Microsoft.Network/loadBalancers',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard' } },
  },
  'azure-front-door': {
    type: 'Microsoft.Network/frontDoors',
    apiVersion: '2021-06-01',
    defaultProps: {},
  },
  'azure-traffic-manager': {
    type: 'Microsoft.Network/trafficManagerProfiles',
    apiVersion: '2022-04-01',
    defaultProps: { trafficRoutingMethod: 'Performance' },
  },
  'azure-key-vault': {
    type: 'Microsoft.KeyVault/vaults',
    apiVersion: '2023-07-01',
    defaultProps: {
      sku: { name: 'standard', family: 'A' },
      enableSoftDelete: true,
      softDeleteRetentionInDays: 90,
    },
  },
  'azure-keyvault': {
    type: 'Microsoft.KeyVault/vaults',
    apiVersion: '2023-07-01',
    defaultProps: { sku: { name: 'standard', family: 'A' }, enableSoftDelete: true },
  },
  'azure-redis': {
    type: 'Microsoft.Cache/Redis',
    apiVersion: '2023-08-01',
    defaultProps: {
      sku: { name: 'Basic', family: 'C', capacity: 0 },
      enableNonSslPort: false,
      minimumTlsVersion: '1.2',
    },
  },
  'azure-service-bus': {
    type: 'Microsoft.ServiceBus/namespaces',
    apiVersion: '2022-10-01-preview',
    defaultProps: { sku: { name: 'Standard', tier: 'Standard' } },
  },
  'azure-event-hub': {
    type: 'Microsoft.EventHub/namespaces',
    apiVersion: '2023-01-01-preview',
    defaultProps: { sku: { name: 'Standard', tier: 'Standard', capacity: 1 } },
  },
  'azure-event-grid': {
    type: 'Microsoft.EventGrid/topics',
    apiVersion: '2023-06-01-preview',
    defaultProps: { inputSchema: 'EventGridSchema' },
  },
  'azure-public-ip': {
    type: 'Microsoft.Network/publicIPAddresses',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard' }, publicIPAllocationMethod: 'Static' },
  },
  'azure-nic': {
    type: 'Microsoft.Network/networkInterfaces',
    apiVersion: '2023-05-01',
    defaultProps: {},
  },
  'azure-firewall': {
    type: 'Microsoft.Network/azureFirewalls',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'AZFW_VNet', tier: 'Standard' } },
  },
  'azure-bastion': {
    type: 'Microsoft.Network/bastionHosts',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard' } },
  },
  'azure-nat-gateway': {
    type: 'Microsoft.Network/natGateways',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard' } },
  },
  'azure-vpn-gateway': {
    type: 'Microsoft.Network/vpnGateways',
    apiVersion: '2023-05-01',
    defaultProps: {},
  },
  'azure-cdn': {
    type: 'Microsoft.Cdn/profiles',
    apiVersion: '2023-05-01',
    defaultProps: { sku: { name: 'Standard_Microsoft' } },
  },
  'azure-dns': {
    type: 'Microsoft.Network/dnsZones',
    apiVersion: '2023-07-01-preview',
    defaultProps: {},
  },
  'azure-app-insights': {
    type: 'Microsoft.Insights/components',
    apiVersion: '2020-02-02',
    defaultProps: { kind: 'web', Application_Type: 'web' },
  },
  'azure-monitor': {
    type: 'Microsoft.Insights/actionGroups',
    apiVersion: '2023-01-01',
    defaultProps: { enabled: true, groupShortName: 'alerts' },
  },
  'azure-log-analytics': {
    type: 'Microsoft.OperationalInsights/workspaces',
    apiVersion: '2022-10-01',
    defaultProps: { sku: { name: 'PerGB2018' }, retentionInDays: 30 },
  },
  'azure-cognitive-services': {
    type: 'Microsoft.CognitiveServices/accounts',
    apiVersion: '2023-05-01',
    defaultProps: { kind: 'OpenAI', sku: { name: 'S0' } },
  },
  'azure-machine-learning': {
    type: 'Microsoft.MachineLearningServices/workspaces',
    apiVersion: '2023-06-01-preview',
    defaultProps: {},
  },
  'azure-databricks': {
    type: 'Microsoft.Databricks/workspaces',
    apiVersion: '2023-02-01',
    defaultProps: { sku: { name: 'standard' } },
  },
  'azure-waf': {
    type: 'Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies',
    apiVersion: '2023-05-01',
    defaultProps: { policySettings: { mode: 'Prevention', state: 'Enabled' } },
  },
  'azure-logic-app': {
    type: 'Microsoft.Logic/workflows',
    apiVersion: '2019-05-01',
    defaultProps: {},
  },
}

function sanitizeARMName(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9-]/g, '')
  // Truncate but ensure uniqueness will be handled by caller
  return cleaned.substring(0, 24) || 'resource'
}

// Removed duplicate getNodeComponentId — now imported from shared core
// Removed duplicate buildNodeMap — now imported from shared core

function findAncestor(
  nodeId: string,
  targetComponentId: string,
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string | null {
  return findAncestorName(nodeId, targetComponentId, nodeMap, nodeIdToName)
}

function findConnected(
  nodeId: string,
  targetTypes: string[],
  edges: Edge[],
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string[] {
  return findConnectedNames(nodeId, targetTypes, edges, nodeMap, nodeIdToName)
}

export function generateARM(nodes: Node[], edges: Edge[] = []): string {
  const template: ARMTemplate = {
    $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    parameters: {
      location: {
        type: 'string',
        defaultValue: '[resourceGroup().location]',
        metadata: { description: 'Location for all resources' },
      },
      environment: {
        type: 'string',
        defaultValue: 'development',
        allowedValues: ['development', 'staging', 'production'],
        metadata: { description: 'Deployment environment' },
      },
    },
    variables: { resourcePrefix: "[concat('js-', parameters('environment'), '-')]" },
    resources: [],
    outputs: {},
  }

  const nodeMap = buildNodeMap(nodes)
  const nodeIdToName = new Map<string, string>()

  // First pass: assign collision-safe names (BUG-1 fix)
  const issuedArmNames = new Set<string>()
  for (const node of nodes) {
    if (!ARM_MAPPINGS[getNodeComponentId(node)]) continue
    const baseName = sanitizeARMName(String(node.data?.label || node.id))
    let name = baseName
    let counter = 1
    while (issuedArmNames.has(name)) {
      name = sanitizeARMName(`${baseName}${counter++}`)
    }
    issuedArmNames.add(name)
    nodeIdToName.set(node.id, name)
  }

  // Second pass: generate resources with context
  for (const node of nodes) {
    const componentId = getNodeComponentId(node)
    const mapping = ARM_MAPPINGS[componentId]
    if (!mapping) continue

    const baseName = nodeIdToName.get(node.id)!
    const resourceName = `[concat(variables('resourcePrefix'), '${baseName}')]`
    const cfg = (node.data as any)?.config || {}
    const deps: string[] = []

    const props: Record<string, unknown> = { ...mapping.defaultProps, ...cfg }

    // --- Parent-child context ---
    const vnetRef = findAncestor(node.id, 'azure-vnet', nodeMap, nodeIdToName)
    const subnetRef = findAncestor(node.id, 'azure-subnet', nodeMap, nodeIdToName)
    const _rgRef = findAncestor(node.id, 'azure-resource-group', nodeMap, nodeIdToName)

    // Subnet inside VNet -> subnet is a sub-resource of VNet
    if (componentId === 'azure-subnet' && vnetRef) {
      deps.push(
        `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef}'))]`
      )
    }

    // VM inside Subnet -> needs networkProfile with subnet reference
    if (componentId === 'azure-vm' && subnetRef) {
      const nsgNames = findConnected(node.id, ['azure-nsg'], edges, nodeMap, nodeIdToName)
      const subnetResourceId = vnetRef
        ? `[resourceId('Microsoft.Network/virtualNetworks/subnets', concat(variables('resourcePrefix'), '${vnetRef}'), concat(variables('resourcePrefix'), '${subnetRef}'))]`
        : `[resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet', concat(variables('resourcePrefix'), '${subnetRef}'))]`

      props.networkProfile = {
        networkInterfaces: [
          {
            id: `[resourceId('Microsoft.Network/networkInterfaces', concat(variables('resourcePrefix'), '${baseName}-nic'))]`,
          },
        ],
      }
      // Add a NIC resource for this VM
      const nicProps: Record<string, unknown> = {
        ipConfigurations: [
          {
            name: 'ipconfig1',
            properties: {
              privateIPAllocationMethod: 'Dynamic',
              subnet: { id: subnetResourceId },
            },
          },
        ],
      }
      if (nsgNames.length > 0) {
        nicProps.networkSecurityGroup = {
          id: `[resourceId('Microsoft.Network/networkSecurityGroups', concat(variables('resourcePrefix'), '${nsgNames[0]}'))]`,
        }
      }
      template.resources.push({
        type: 'Microsoft.Network/networkInterfaces',
        apiVersion: '2023-05-01',
        name: `[concat(variables('resourcePrefix'), '${baseName}-nic')]`,
        location: "[parameters('location')]",
        properties: nicProps,
        dependsOn: [
          // BUG-5 fix: only add VNet dep if a VNet reference actually exists
          ...(vnetRef
            ? [
                `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef}'))]`,
              ]
            : []),
          ...nsgNames.map(
            nsg =>
              `[resourceId('Microsoft.Network/networkSecurityGroups', concat(variables('resourcePrefix'), '${nsg}'))]`
          ),
        ],
        tags: {
          Environment: "[parameters('environment')]",
          ManagedBy: 'ARM',
          GeneratedFrom: 'JobStack',
        },
      })
      deps.push(
        `[resourceId('Microsoft.Network/networkInterfaces', concat(variables('resourcePrefix'), '${baseName}-nic'))]`
      )
    }

    // AKS inside Subnet/VNet -> agentPool with vnetSubnetID
    if (componentId === 'azure-aks' && subnetRef) {
      const subnetResourceId = vnetRef
        ? `[resourceId('Microsoft.Network/virtualNetworks/subnets', concat(variables('resourcePrefix'), '${vnetRef}'), concat(variables('resourcePrefix'), '${subnetRef}'))]`
        : `[resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet', concat(variables('resourcePrefix'), '${subnetRef}'))]`
      if (Array.isArray(props.agentPoolProfiles)) {
        ;(props.agentPoolProfiles as any[])[0].vnetSubnetID = subnetResourceId
      }
      deps.push(
        `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef || 'vnet'}'))]`
      )
    }

    // App Service / Functions connected to VNet
    if (['azure-app-service', 'azure-function', 'azure-functions'].includes(componentId)) {
      const sqlNames = findConnected(node.id, ['azure-sql'], edges, nodeMap, nodeIdToName)
      const cosmosNames = findConnected(
        node.id,
        ['azure-cosmos', 'azure-cosmosdb'],
        edges,
        nodeMap,
        nodeIdToName
      )
      const kvNames = findConnected(
        node.id,
        ['azure-key-vault', 'azure-keyvault'],
        edges,
        nodeMap,
        nodeIdToName
      )
      deps.push(
        ...sqlNames.map(
          n => `[resourceId('Microsoft.Sql/servers', concat(variables('resourcePrefix'), '${n}'))]`
        ),
        ...cosmosNames.map(
          n =>
            `[resourceId('Microsoft.DocumentDB/databaseAccounts', concat(variables('resourcePrefix'), '${n}'))]`
        ),
        ...kvNames.map(
          n =>
            `[resourceId('Microsoft.KeyVault/vaults', concat(variables('resourcePrefix'), '${n}'))]`
        )
      )
    }

    // NSG connected to Subnet
    if (componentId === 'azure-nsg') {
      const _subnetConns = findConnected(node.id, ['azure-subnet'], edges, nodeMap, nodeIdToName)
      // Just add dependencies
      if (vnetRef)
        deps.push(
          `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef}'))]`
        )
    }

    // Load Balancer / App Gateway connected to resources
    if (['azure-lb', 'azure-app-gw'].includes(componentId)) {
      const pubIps = findConnected(node.id, ['azure-public-ip'], edges, nodeMap, nodeIdToName)
      if (pubIps.length > 0) {
        deps.push(
          ...pubIps.map(
            p =>
              `[resourceId('Microsoft.Network/publicIPAddresses', concat(variables('resourcePrefix'), '${p}'))]`
          )
        )
      }
      if (subnetRef) {
        deps.push(
          `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef || 'vnet'}'))]`
        )
      }
    }

    // Firewall / Bastion inside VNet
    if (['azure-firewall', 'azure-bastion'].includes(componentId) && vnetRef) {
      deps.push(
        `[resourceId('Microsoft.Network/virtualNetworks', concat(variables('resourcePrefix'), '${vnetRef}'))]`
      )
      const pubIps = findConnected(node.id, ['azure-public-ip'], edges, nodeMap, nodeIdToName)
      deps.push(
        ...pubIps.map(
          p =>
            `[resourceId('Microsoft.Network/publicIPAddresses', concat(variables('resourcePrefix'), '${p}'))]`
        )
      )
    }

    // App Insights connected to apps
    if (componentId === 'azure-app-insights') {
      const laNames = findConnected(node.id, ['azure-log-analytics'], edges, nodeMap, nodeIdToName)
      if (laNames.length > 0) {
        props.WorkspaceResourceId = `[resourceId('Microsoft.OperationalInsights/workspaces', concat(variables('resourcePrefix'), '${laNames[0]}'))]`
        deps.push(
          `[resourceId('Microsoft.OperationalInsights/workspaces', concat(variables('resourcePrefix'), '${laNames[0]}'))]`
        )
      }
    }

    // ACR connected to AKS
    if (componentId === 'azure-acr') {
      const aksNames = findConnected(node.id, ['azure-aks'], edges, nodeMap, nodeIdToName)
      // Just dependency
      deps.push(
        ...aksNames.map(
          a =>
            `[resourceId('Microsoft.ContainerService/managedClusters', concat(variables('resourcePrefix'), '${a}'))]`
        )
      )
    }

    const resource: ARMResource = {
      type: mapping.type,
      apiVersion: mapping.apiVersion,
      name: resourceName,
      location: "[parameters('location')]",
      properties: props,
      tags: {
        Environment: "[parameters('environment')]",
        ManagedBy: 'ARM',
        GeneratedFrom: 'JobStack',
        DisplayName: String(node.data?.label || baseName),
      },
    }

    if (deps.length > 0) resource.dependsOn = [...new Set(deps)]

    template.resources.push(resource)

    // Outputs — BUG-3 fix: use concat() without nested brackets
    if (
      [
        'azure-vnet',
        'azure-blob',
        'azure-storage-account',
        'azure-sql',
        'azure-aks',
        'azure-keyvault',
        'azure-key-vault',
        'azure-app-service',
        'azure-function',
        'azure-functions',
        'azure-cosmos',
        'azure-cosmosdb',
      ].includes(componentId)
    ) {
      template.outputs[`${baseName}Id`] = {
        type: 'string',
        value: `[resourceId('${mapping.type}', concat(variables('resourcePrefix'), '${baseName}'))]`,
      }
    }
  }

  // Add remaining edge deps
  for (const edge of edges) {
    const src = nodeIdToName.get(edge.source)
    const tgt = nodeIdToName.get(edge.target)
    if (src && tgt) {
      const targetResource = template.resources.find(r => r.name.includes(tgt))
      if (targetResource) {
        const sourceResource = template.resources.find(r => r.name.includes(src))
        if (sourceResource) {
          if (!targetResource.dependsOn) targetResource.dependsOn = []
          const depRef = `[resourceId('${sourceResource.type}', concat(variables('resourcePrefix'), '${src}'))]`
          if (!targetResource.dependsOn.includes(depRef)) targetResource.dependsOn.push(depRef)
        }
      }
    }
  }

  return JSON.stringify(template, null, 2)
}
