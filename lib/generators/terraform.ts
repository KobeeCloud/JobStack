import { Node, Edge } from '@xyflow/react'
import { getComponentById } from '@/lib/catalog'
import {
  buildNodeMap as buildNodeMapShared,
  getNodeComponentId as getNodeComponentIdShared,
  getNodeDepth as getNodeDepthShared,
  findAncestorByTfResource as findAncestorByTfResourceShared,
  uniqueName,
  detectCycles,
} from '@/lib/generators/core/graph-utils'

export interface TerraformOutput {
  code: string
  filename: string
  provider: string
}

export interface TerraformError {
  nodeId: string
  nodeLabel: string
  error: string
}

export interface TerraformResult {
  success: boolean
  files: TerraformOutput[]
  errors: TerraformError[]
  warnings: string[]
  skippedCount: number
}

interface NodeData {
  label?: string
  componentId?: string
  component?: string
  config?: Record<string, any>
  [key: string]: unknown
}

type NodeMap = Map<string, Node<NodeData>>

// ─── Helpers ────────────────────────────────────────────────────────────────

function getNodeComponentId(node: Node<NodeData>): string | undefined {
  return node.data?.componentId || node.data?.component
}

/** Sanitise a node label into a valid Terraform resource name */
function toTfName(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'resource'
  )
}

/**
 * Walk up the parentId chain until we find a node whose catalog component
 * maps to the given Terraform resource type (e.g. 'azurerm_resource_group').
 */
function findAncestorByTfResource(
  nodeId: string,
  nodeMap: NodeMap,
  tfResource: string
): Node<NodeData> | null {
  let current = nodeMap.get(nodeId)
  while (current?.parentId) {
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    const parentCompId = getNodeComponentId(parent)
    if (parentCompId) {
      const parentComp = getComponentById(parentCompId)
      if (parentComp?.terraform?.resource === tfResource) return parent
    }
    current = parent
  }
  return null
}

/** Return the depth of a node in the hierarchy (0 = root, higher = deeper) */
function getNodeDepth(node: Node<NodeData>, nodeMap: NodeMap): number {
  let depth = 0
  let current = node
  while (current.parentId) {
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    depth++
    current = parent
  }
  return depth
}

// ─── Emit helpers ────────────────────────────────────────────────────────────

function emitBlock(key: string, obj: Record<string, unknown>): string {
  let s = `  ${key} {\n`
  Object.entries(obj).forEach(([k, v]) => {
    s += `    ${k} = ${JSON.stringify(v)}\n`
  })
  s += `  }\n`
  return s
}

// ─── Azure-specific hierarchy helpers ────────────────────────────────────────

/**
 * For every Azure resource, derive resource_group_name from its ancestor RG.
 * Falls back to var.azure_resource_group if the node is not inside any RG.
 */
function getAzureRgRef(node: Node<NodeData>, nodeMap: NodeMap): string {
  const rgNode = findAncestorByTfResource(node.id, nodeMap, 'azurerm_resource_group')
  if (rgNode) {
    const rgName = toTfName(String(rgNode.data?.label || 'resource_group'))
    return `azurerm_resource_group.${rgName}.name`
  }
  return 'var.azure_resource_group'
}

function getAzureVnetRef(node: Node<NodeData>, nodeMap: NodeMap): string | null {
  const vnetNode = findAncestorByTfResource(node.id, nodeMap, 'azurerm_virtual_network')
  if (vnetNode) {
    return `azurerm_virtual_network.${toTfName(String(vnetNode.data?.label || 'vnet'))}.name`
  }
  return null
}

function getAzureSubnetRef(node: Node<NodeData>, nodeMap: NodeMap): string | null {
  const subnetNode = findAncestorByTfResource(node.id, nodeMap, 'azurerm_subnet')
  if (subnetNode) {
    return `azurerm_subnet.${toTfName(String(subnetNode.data?.label || 'subnet'))}.id`
  }
  return null
}

/**
 * Generate an IMPLICIT azurerm_network_interface resource for a VM
 * that lives inside a subnet (and doesn't have an explicit NIC child node).
 */
function generateImplicitNic(
  vmNode: Node<NodeData>,
  vmName: string,
  nodeMap: NodeMap
): { nicTf: string; nicRefName: string } | null {
  // If there's already an explicit NIC child node, skip implicit generation
  const hasExplicitNic = Array.from(nodeMap.values()).some(n => {
    const compId = getNodeComponentId(n)
    const comp = compId ? getComponentById(compId) : null
    return (
      comp?.terraform?.resource === 'azurerm_network_interface' && n.parentId === vmNode.id
    )
  })
  if (hasExplicitNic) return null

  const subnetRef = getAzureSubnetRef(vmNode, nodeMap)
  if (!subnetRef) return null

  const rgRef = getAzureRgRef(vmNode, nodeMap)
  const nicRefName = `nic_${vmName}`

  let nicTf = `resource "azurerm_network_interface" "${nicRefName}" {\n`
  nicTf += `  name                = "\${var.project_name}-nic-${vmName}"\n`
  nicTf += `  location            = var.azure_location\n`
  nicTf += `  resource_group_name = ${rgRef}\n\n`
  nicTf += `  ip_configuration {\n`
  nicTf += `    name                          = "internal"\n`
  nicTf += `    subnet_id                     = ${subnetRef}\n`
  nicTf += `    private_ip_address_allocation = "Dynamic"\n`
  nicTf += `  }\n`
  nicTf += `}\n\n`

  return { nicTf, nicRefName }
}

/** Build ip_configuration block for an explicit NIC node */
function buildNicIpConfigBlock(
  node: Node<NodeData>,
  nodeMap: NodeMap,
  userConfig: Record<string, any>
): string {
  const subnetRef = getAzureSubnetRef(node, nodeMap) || 'var.subnet_id'
  const allocation = userConfig.private_ip_address_allocation || 'Dynamic'

  let block = `  ip_configuration {\n`
  block += `    name                          = "internal"\n`
  block += `    subnet_id                     = ${subnetRef}\n`
  block += `    private_ip_address_allocation = "${allocation}"\n`
  if (allocation === 'Static' && userConfig.private_ip_address) {
    block += `    private_ip_address            = "${userConfig.private_ip_address}"\n`
  }
  block += `  }\n`
  return block
}

// ─── OS image map ────────────────────────────────────────────────────────────

const OS_IMAGE_MAP: Record<string, { publisher: string; offer: string; sku: string; version: string }> = {
  'ubuntu-22.04': { publisher: 'Canonical', offer: '0001-com-ubuntu-server-jammy', sku: '22_04-lts-gen2', version: 'latest' },
  'ubuntu-20.04': { publisher: 'Canonical', offer: '0001-com-ubuntu-server-focal', sku: '20_04-lts-gen2', version: 'latest' },
  'windows-2022': { publisher: 'MicrosoftWindowsServer', offer: 'WindowsServer', sku: '2022-Datacenter', version: 'latest' },
  'windows-2019': { publisher: 'MicrosoftWindowsServer', offer: 'WindowsServer', sku: '2019-Datacenter', version: 'latest' },
  'rhel-9':       { publisher: 'RedHat', offer: 'RHEL', sku: '9-lvm-gen2', version: 'latest' },
  'rhel-8':       { publisher: 'RedHat', offer: 'RHEL', sku: '8-lvm-gen2', version: 'latest' },
  'debian-12':    { publisher: 'Debian', offer: 'debian-12', sku: '12', version: 'latest' },
  'debian-11':    { publisher: 'Debian', offer: 'debian-11', sku: '11', version: 'latest' },
  'centos-8':     { publisher: 'OpenLogic', offer: 'CentOS', sku: '8_5-gen2', version: 'latest' },
}

/**
 * Aliases for OS image keys — maps UI config panel values to OS_IMAGE_MAP keys.
 * Fixes BUG-6: the config panel uses 'windows-server-2022' but the map expects 'windows-2022'.
 */
const OS_IMAGE_ALIASES: Record<string, string> = {
  'windows-server-2022': 'windows-2022',
  'windows-server-2019': 'windows-2019',
}

// Keys handled explicitly — excluded from generic config dump
const VM_HANDLED_KEYS = new Set([
  'osImage', 'os_disk_type', 'os_disk_size_gb', 'admin_username', 'ssh_key_data',
  'availability_zone', 'identity_type', 'attachments', 'replicas', 'size', 'sku',
  'private_ip_address_allocation', 'private_ip_address',
])
const AZURE_EXPLICIT_KEYS = new Set(['resource_group_name', 'virtual_network_name', 'location', 'name'])

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateTerraformWithValidation(
  nodes: Node<NodeData>[],
  edges: Edge[],
  options?: { environment?: string; projectName?: string }
): TerraformResult {
  const environment = options?.environment || 'dev'
  const projectName = (options?.projectName || 'jobstack')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const outputs: TerraformOutput[] = []
  const errors: TerraformError[] = []
  const warnings: string[] = []
  const providers = new Set<string>()
  let skippedCount = 0

  if (!nodes || nodes.length === 0) {
    return {
      success: false,
      files: [],
      errors: [{ nodeId: '', nodeLabel: 'Diagram', error: 'No components found. Add components to generate Terraform.' }],
      warnings: [],
      skippedCount: 0,
    }
  }

  // Build nodeMap for O(1) ancestor lookup
  const nodeMap: NodeMap = new Map(nodes.map(n => [n.id, n]))

  const validNodes: Node<NodeData>[] = []

  nodes.forEach(node => {
    const componentId = getNodeComponentId(node)
    if (!componentId) {
      errors.push({ nodeId: node.id, nodeLabel: String(node.data?.label || 'Unknown'), error: 'Missing component ID' })
      skippedCount++
      return
    }
    const component = getComponentById(componentId)
    if (!component) {
      errors.push({ nodeId: node.id, nodeLabel: String(node.data?.label || componentId), error: `Unknown component: ${componentId}` })
      skippedCount++
      return
    }
    if (!component.terraform) {
      warnings.push(`${node.data?.label || component.name}: No Terraform support (skipped)`)
      skippedCount++
      return
    }
    validNodes.push(node)
    providers.add(component.terraform.provider)
  })

  if (validNodes.length === 0) {
    return {
      success: false,
      files: [],
      errors: errors.length > 0
        ? errors
        : [{ nodeId: '', nodeLabel: 'Diagram', error: 'No components with Terraform support. Add AWS/Azure/GCP components.' }],
      warnings,
      skippedCount,
    }
  }

  // Sort by hierarchy depth — parents always before children in output
  // Secondary sort by componentId + label ensures deterministic output
  validNodes.sort((a, b) => {
    const depthDiff = getNodeDepth(a, nodeMap) - getNodeDepth(b, nodeMap)
    if (depthDiff !== 0) return depthDiff
    const aCompId = getNodeComponentId(a) || ''
    const bCompId = getNodeComponentId(b) || ''
    if (aCompId !== bCompId) return aCompId.localeCompare(bCompId)
    const aLabel = String(a.data?.label || '')
    const bLabel = String(b.data?.label || '')
    return aLabel.localeCompare(bLabel)
  })

  // Track issued resource names to prevent collisions (BUG-1 fix)
  const issuedNames = new Set<string>()

  // Detect circular dependencies before generation
  const validNodeIds = validNodes.map(n => n.id)
  const cycles = detectCycles(validNodeIds, edges, nodeMap)
  for (const cycle of cycles) {
    const labels = cycle.map(id => nodeMap.get(id)?.data?.label || id).join(' → ')
    warnings.push(`Circular dependency detected: ${labels}. Generated code may need manual review.`)
  }

  // Pre-validate edges: warn about edges referencing skipped or unknown nodes
  const validNodeIdSet = new Set(validNodeIds)
  for (const edge of (edges || [])) {
    const srcExists = validNodeIdSet.has(edge.source)
    const tgtExists = validNodeIdSet.has(edge.target)
    if (!srcExists && !tgtExists) continue // both missing — likely non-terraform nodes
    if (!srcExists) {
      const tgtLabel = nodeMap.get(edge.target)?.data?.label || edge.target
      warnings.push(`Edge to "${tgtLabel}" has a source node (${edge.source}) that was skipped or is unknown.`)
    }
    if (!tgtExists) {
      const srcLabel = nodeMap.get(edge.source)?.data?.label || edge.source
      warnings.push(`Edge from "${srcLabel}" has a target node (${edge.target}) that was skipped or is unknown.`)
    }
  }

  // ── main.tf ────────────────────────────────────────────────────────────
  let mainTf = `# Generated by JobStack\n# Components: ${validNodes.length} | Skipped: ${skippedCount}\n# Environment: ${environment}\n\n`
  mainTf += 'terraform {\n  required_version = ">= 1.6"\n  required_providers {\n'
  if (providers.has('aws'))        mainTf += '    aws        = { source = "hashicorp/aws",             version = "~> 5.0" }\n'
  if (providers.has('gcp'))        mainTf += '    google     = { source = "hashicorp/google",          version = "~> 5.0" }\n'
  if (providers.has('azure'))      mainTf += '    azurerm    = { source = "hashicorp/azurerm",         version = "~> 3.0" }\n'
  if (providers.has('vercel'))     mainTf += '    vercel     = { source = "vercel/vercel",             version = "~> 1.0" }\n'
  if (providers.has('cloudflare')) mainTf += '    cloudflare = { source = "cloudflare/cloudflare",    version = "~> 4.0" }\n'
  mainTf += '  }\n}\n\n'

  if (providers.has('aws'))        mainTf += `provider "aws" {\n  region = var.aws_region\n}\n\n`
  if (providers.has('gcp'))        mainTf += `provider "google" {\n  project = var.gcp_project\n  region  = var.gcp_region\n}\n\n`
  if (providers.has('azure'))      mainTf += `provider "azurerm" {\n  features {}\n}\n\n`
  if (providers.has('vercel'))     mainTf += `provider "vercel" {\n  api_token = var.vercel_api_token\n}\n\n`
  if (providers.has('cloudflare')) mainTf += `provider "cloudflare" {\n  api_token = var.cloudflare_api_token\n}\n\n`

  outputs.push({ code: mainTf, filename: 'main.tf', provider: 'terraform' })

  // ── backend.tf ─────────────────────────────────────────────────────────
  const primaryProvider = providers.has('aws') ? 'aws'
    : providers.has('azure') ? 'azure'
    : providers.has('gcp') ? 'gcp'
    : 'local'

  let backendTf = `# backend.tf — Remote state configuration\n# Generated by JobStack for environment: ${environment}\n#\n# Uncomment ONE backend block, then run: terraform init\n\nterraform {\n`
  if (primaryProvider === 'aws') {
    backendTf += `  # --- AWS S3 Backend (recommended) ---\n  # backend "s3" {\n  #   bucket         = "${projectName}-terraform-state"\n  #   key            = "${projectName}/${environment}/terraform.tfstate"\n  #   region         = "eu-west-1"\n  #   dynamodb_table = "terraform-state-locks"\n  #   encrypt        = true\n  # }\n`
  } else if (primaryProvider === 'azure') {
    backendTf += `  # --- Azure Blob Storage Backend ---\n  # backend "azurerm" {\n  #   resource_group_name  = "rg-terraform-state"\n  #   storage_account_name = "tfstate${projectName.replace(/-/g, '')}"\n  #   container_name       = "tfstate"\n  #   key                  = "${projectName}.${environment}.tfstate"\n  # }\n`
  } else if (primaryProvider === 'gcp') {
    backendTf += `  # --- GCS Backend ---\n  # backend "gcs" {\n  #   bucket = "${projectName}-terraform-state"\n  #   prefix = "${projectName}/${environment}"\n  # }\n`
  }
  backendTf += `\n  # --- Local Backend (default, NOT recommended for production) ---\n  backend "local" {}\n}\n`
  outputs.push({ code: backendTf, filename: 'backend.tf', provider: 'terraform' })

  // ── variables.tf ───────────────────────────────────────────────────────
  let variablesTf = '# variables.tf\n# Declare all input variables here.\n\n'
  if (providers.has('aws'))
    variablesTf += `variable "aws_region" {\n  description = "AWS region to deploy resources"\n  type        = string\n  default     = "eu-west-1"\n}\n\n`
  if (providers.has('gcp')) {
    variablesTf += 'variable "gcp_project" {\n  description = "GCP project ID"\n  type        = string\n}\n\n'
    variablesTf += 'variable "gcp_region" {\n  description = "GCP region"\n  type        = string\n  default     = "europe-west1"\n}\n\n'
  }
  if (providers.has('azure')) {
    variablesTf += 'variable "azure_location" {\n  description = "Azure location"\n  type        = string\n  default     = "West Europe"\n}\n\n'
    variablesTf += `variable "azure_resource_group" {\n  description = "Fallback RG name (used only for nodes outside any Resource Group container)"\n  type        = string\n  default     = "rg-${projectName}"\n}\n\n`
  }
  if (providers.has('vercel'))
    variablesTf += 'variable "vercel_api_token" {\n  description = "Vercel API token"\n  type        = string\n  sensitive   = true\n}\n\n'
  if (providers.has('cloudflare'))
    variablesTf += 'variable "cloudflare_api_token" {\n  description = "Cloudflare API token"\n  type        = string\n  sensitive   = true\n}\n\n'
  variablesTf += `variable "environment" {\n  description = "Deployment environment (dev / staging / production)"\n  type        = string\n  default     = "${environment}"\n}\n\n`
  variablesTf += `variable "project_name" {\n  description = "Project name used as a naming prefix for all resources"\n  type        = string\n  default     = "${projectName}"\n}\n\n`
  outputs.push({ code: variablesTf, filename: 'variables.tf', provider: 'terraform' })

  // ── terraform.tfvars ───────────────────────────────────────────────────
  let tfvars = `# terraform.tfvars — ${environment} environment\n# Generated by JobStack\n# Usage: terraform plan  (this file is loaded automatically)\n\nenvironment  = "${environment}"\nproject_name = "${projectName}"\n`
  if (providers.has('aws'))        tfvars += `aws_region   = "eu-west-1"\n`
  if (providers.has('gcp'))        tfvars += `gcp_project  = "<your-gcp-project-id>"\ngcp_region   = "europe-west1"\n`
  if (providers.has('azure'))      tfvars += `azure_location       = "West Europe"\nazure_resource_group = "rg-${projectName}-${environment}"\n`
  outputs.push({ code: tfvars, filename: 'terraform.tfvars', provider: 'terraform' })

  // ── resources.tf ───────────────────────────────────────────────────────
  let resourcesTf = `# resources.tf\n# All infrastructure resources for environment: ${environment}\n# Resources are ordered by hierarchy depth (parents before children).\n# Implicit NICs are auto-generated when a VM sits inside a Subnet.\n\n`

  const noTagsResources = [
    'azurerm_subnet', 'azurerm_network_interface', 'azurerm_subscription',
    'aws_subnet', 'aws_security_group_rule', 'aws_route',
    'google_compute_subnetwork', 'google_compute_firewall',
    'vercel_', 'cloudflare_',
  ]

  // Track implicit NICs: vmNodeId → nicRefName
  const implicitNics = new Map<string, string>()
  let implicitNicsTf = ''

  // Pre-assign collision-safe names for all valid nodes (BUG-1 fix)
  const nodeIdToTfName = new Map<string, string>()
  validNodes.forEach(node => {
    const component = getComponentById(getNodeComponentId(node)!)!
    const safeName = uniqueName(String(node.data?.label || component.name), 'terraform', issuedNames)
    nodeIdToTfName.set(node.id, safeName)
  })

  validNodes.forEach(node => {
    const componentId = getNodeComponentId(node)!
    const component = getComponentById(componentId)!
    const resourceType = component.terraform!.resource
    if (
      resourceType === 'azurerm_linux_virtual_machine' ||
      resourceType === 'azurerm_windows_virtual_machine'
    ) {
      const vmName = nodeIdToTfName.get(node.id)!
      const result = generateImplicitNic(node, vmName, nodeMap)
      if (result) {
        implicitNicsTf += result.nicTf
        implicitNics.set(node.id, result.nicRefName)
      }
    }
  })

  if (implicitNicsTf) {
    resourcesTf += `# ─── Implicit Network Interfaces (auto-generated from diagram hierarchy) ───────\n`
    resourcesTf += implicitNicsTf
    resourcesTf += `# ─── Catalog Resources ──────────────────────────────────────────────────────────\n\n`
  }

  validNodes.forEach(node => {
    const componentId = getNodeComponentId(node)!
    const component = getComponentById(componentId)!
    const resourceName = nodeIdToTfName.get(node.id)!
    const resourceType = component.terraform!.resource
    const userConfig = { ...component.terraform!.defaultConfig, ...(node.data.config || {}) }

    resourcesTf += `resource "${resourceType}" "${resourceName}" {\n`

    // ── name / location ────────────────────────────────────────────────
    if (resourceType.startsWith('azurerm_') || resourceType.startsWith('google_')) {
      resourcesTf += `  name = "\${var.project_name}-${resourceName}"\n`
    }
    if (resourceType.startsWith('azurerm_') && resourceType !== 'azurerm_subscription') {
      resourcesTf += `  location            = var.azure_location\n`
      // resource_group_name from hierarchy
      const rgRef = getAzureRgRef(node, nodeMap)
      resourcesTf += `  resource_group_name = ${rgRef}\n`
    }
    if (resourceType.startsWith('google_')) {
      resourcesTf += `  project = var.gcp_project\n`
    }

    // ── Subnet → vnet reference ────────────────────────────────────────
    if (resourceType === 'azurerm_subnet') {
      const vnetRef = getAzureVnetRef(node, nodeMap)
      if (vnetRef) {
        resourcesTf += `  virtual_network_name = ${vnetRef}\n`
      }
    }

    // ── VM: NIC IDs + os_disk + image + admin ──────────────────────────
    const isLinuxVm = resourceType === 'azurerm_linux_virtual_machine'
    const isWindowsVm = resourceType === 'azurerm_windows_virtual_machine'
    if (isLinuxVm || isWindowsVm) {
      // VM size
      const vmSize = userConfig.size || userConfig.sku || 'Standard_B2s'
      resourcesTf += `  size = "${vmSize}"\n`

      // NIC reference
      const nicRef = implicitNics.get(node.id)
      if (nicRef) {
        resourcesTf += `  network_interface_ids = [azurerm_network_interface.${nicRef}.id]\n`
      }

      // Admin credentials
      const adminUser = userConfig.admin_username || 'azureuser'
      resourcesTf += `  admin_username = "${adminUser}"\n`
      if (isLinuxVm) {
        const sshKey = userConfig.ssh_key_data
        if (sshKey) {
          resourcesTf += `  admin_ssh_key {\n    username   = "${adminUser}"\n    public_key = "${sshKey}"\n  }\n`
        } else {
          resourcesTf += `  admin_ssh_key {\n    username   = "${adminUser}"\n    public_key = file("~/.ssh/id_rsa.pub")\n  }\n`
        }
      } else {
        const adminPass = userConfig.admin_password || 'REPLACE_ME_Pa\$\$word123!'
        resourcesTf += `  admin_password = "${adminPass}"\n`
      }

      // os_disk
      const osDiskType = userConfig.os_disk_type || 'Premium_LRS'
      const osDiskSizeGb = userConfig.os_disk_size_gb || 64
      resourcesTf += `  os_disk {\n    caching              = "ReadWrite"\n    storage_account_type = "${osDiskType}"\n    disk_size_gb         = ${osDiskSizeGb}\n  }\n`

      // source_image_reference
      const osImage: string = userConfig.osImage || 'ubuntu-22.04'
      const resolvedKey = OS_IMAGE_ALIASES[osImage] || osImage
      const img = OS_IMAGE_MAP[resolvedKey]
      if (!img) {
        warnings.push(`${node.data?.label || resourceName}: Unknown OS image "${osImage}"; defaulting to Ubuntu 22.04`)
      }
      const finalImg = img || OS_IMAGE_MAP['ubuntu-22.04']
      resourcesTf += `  source_image_reference {\n    publisher = "${finalImg.publisher}"\n    offer     = "${finalImg.offer}"\n    sku       = "${finalImg.sku}"\n    version   = "${finalImg.version}"\n  }\n`

      // Availability Zone
      if (userConfig.availability_zone) {
        resourcesTf += `  zone = "${userConfig.availability_zone}"\n`
      }

      // Managed Identity
      if (userConfig.identity_type) {
        resourcesTf += `  identity {\n    type = "${userConfig.identity_type}"\n  }\n`
      }
    }

    // ── NIC: ip_configuration ─────────────────────────────────────────
    if (resourceType === 'azurerm_network_interface') {
      resourcesTf += buildNicIpConfigBlock(node, nodeMap, userConfig)
    }

    // ── Azure NSG: security_rule blocks ───────────────────────────────
    if (resourceType === 'azurerm_network_security_group') {
      const rules = (userConfig.security_rules ?? []) as Record<string, unknown>[]
      for (const rule of rules) {
        resourcesTf += `  security_rule {\n`
        resourcesTf += `    name                       = ${JSON.stringify(rule.name ?? '')}\n`
        resourcesTf += `    priority                   = ${rule.priority ?? 100}\n`
        resourcesTf += `    direction                  = ${JSON.stringify(rule.direction ?? 'Inbound')}\n`
        resourcesTf += `    access                     = ${JSON.stringify(rule.access ?? 'Allow')}\n`
        resourcesTf += `    protocol                   = ${JSON.stringify(rule.protocol ?? 'Tcp')}\n`
        resourcesTf += `    source_port_range          = ${JSON.stringify(rule.source_port_range ?? '*')}\n`
        resourcesTf += `    destination_port_range     = ${JSON.stringify(rule.destination_port_range ?? '*')}\n`
        resourcesTf += `    source_address_prefix      = ${JSON.stringify(rule.source_address_prefix ?? '*')}\n`
        resourcesTf += `    destination_address_prefix = ${JSON.stringify(rule.destination_address_prefix ?? '*')}\n`
        if (rule.description) {
          resourcesTf += `    description                = ${JSON.stringify(rule.description)}\n`
        }
        resourcesTf += `  }\n`
      }
    }

    // ── Azure AKS: default_node_pool + identity blocks ────────────────
    if (resourceType === 'azurerm_kubernetes_cluster') {
      const vmSize = userConfig.vm_size || 'Standard_D2s_v3'
      const nodeCount = userConfig.node_count ?? 2
      const minCount = userConfig.min_count
      const maxCount = userConfig.max_count
      const autoscale = userConfig.enable_auto_scaling ?? (minCount != null && maxCount != null)
      resourcesTf += `  default_node_pool {\n`
      resourcesTf += `    name                = "system"\n`
      resourcesTf += `    vm_size             = "${vmSize}"\n`
      if (autoscale && minCount != null && maxCount != null) {
        resourcesTf += `    auto_scaling_enabled = true\n`
        resourcesTf += `    min_count           = ${minCount}\n`
        resourcesTf += `    max_count           = ${maxCount}\n`
      } else {
        resourcesTf += `    node_count          = ${nodeCount}\n`
      }
      resourcesTf += `    os_disk_size_gb     = ${userConfig.os_disk_size_gb ?? 128}\n`
      resourcesTf += `    type                = "VirtualMachineScaleSets"\n`
      resourcesTf += `  }\n`
      const identityType = userConfig.identity_type || 'SystemAssigned'
      resourcesTf += `  identity {\n    type = "${identityType}"\n  }\n`
      if (userConfig.kubernetes_version) {
        resourcesTf += `  kubernetes_version = "${userConfig.kubernetes_version}"\n`
      }
      if (userConfig.dns_prefix) {
        resourcesTf += `  dns_prefix = "${userConfig.dns_prefix}"\n`
      }
      if (userConfig.network_plugin) {
        resourcesTf += `  network_profile {\n`
        resourcesTf += `    network_plugin = "${userConfig.network_plugin}"\n`
        if (userConfig.network_policy) {
          resourcesTf += `    network_policy = "${userConfig.network_policy}"\n`
        }
        if (userConfig.load_balancer_sku) {
          resourcesTf += `    load_balancer_sku = "${userConfig.load_balancer_sku}"\n`
        }
        resourcesTf += `  }\n`
      }
    }

    // ── AWS EKS: role_arn + vpc_config ────────────────────────────────
    if (resourceType === 'aws_eks_cluster') {
      resourcesTf += `  role_arn = aws_iam_role.eks_cluster_role.arn\n`
      resourcesTf += `  vpc_config {\n`
      resourcesTf += `    endpoint_private_access = ${userConfig.endpoint_private_access ?? true}\n`
      resourcesTf += `    endpoint_public_access  = ${userConfig.endpoint_public_access ?? true}\n`
      resourcesTf += `  }\n`
      if (userConfig.kubernetes_version) {
        resourcesTf += `  version = "${userConfig.kubernetes_version}"\n`
      }
    }

    // ── GCP GKE: remove_default_node_pool + node_config ───────────────
    if (resourceType === 'google_container_cluster') {
      resourcesTf += `  remove_default_node_pool = ${userConfig.remove_default_node_pool ?? true}\n`
      resourcesTf += `  initial_node_count       = ${userConfig.initial_node_count ?? 1}\n`
      resourcesTf += `  deletion_protection      = ${userConfig.deletion_protection ?? false}\n`
      if (userConfig.machine_type || userConfig.disk_size_gb) {
        resourcesTf += `  node_config {\n`
        if (userConfig.machine_type) {
          resourcesTf += `    machine_type = "${userConfig.machine_type}"\n`
        }
        if (userConfig.disk_size_gb) {
          resourcesTf += `    disk_size_gb = ${userConfig.disk_size_gb}\n`
        }
        if (userConfig.disk_type) {
          resourcesTf += `    disk_type = "${userConfig.disk_type}"\n`
        }
        resourcesTf += `  }\n`
      }
      if (userConfig.min_count != null || userConfig.max_count != null) {
        resourcesTf += `  cluster_autoscaling {\n    enabled = true\n    resource_limits {\n      resource_type = "cpu"\n      minimum       = 1\n      maximum       = ${userConfig.max_count ?? 10}\n    }\n    resource_limits {\n      resource_type = "memory"\n      minimum       = 1\n      maximum       = ${(userConfig.max_count ?? 10) * 4}\n    }\n  }\n`
      }
      if (userConfig.network && userConfig.network !== 'default') {
        resourcesTf += `  network    = "${userConfig.network}"\n`
      }
      if (userConfig.subnetwork && userConfig.subnetwork !== 'default') {
        resourcesTf += `  subnetwork = "${userConfig.subnetwork}"\n`
      }
      if (userConfig.kubernetes_version) {
        resourcesTf += `  min_master_version = "${userConfig.kubernetes_version}"\n`
      }
    }

    // ── Generic config keys (skip already-handled ones) ────────────────
    const K8S_HANDLED_KEYS = new Set([
      // AKS
      'vm_size', 'node_count', 'min_count', 'max_count', 'enable_auto_scaling',
      'os_disk_size_gb', 'identity_type', 'kubernetes_version', 'dns_prefix',
      'network_plugin', 'network_policy', 'load_balancer_sku', 'sku_tier',
      // EKS
      'endpoint_private_access', 'endpoint_public_access', 'instance_types',
      'desired_size', 'min_size', 'max_size',
      // GKE
      'initial_node_count', 'remove_default_node_pool', 'deletion_protection',
      'machine_type', 'disk_size_gb', 'disk_type', 'auto_repair', 'auto_upgrade',
      'network', 'subnetwork',
    ])
    const handledKeys = new Set([
      ...Array.from(AZURE_EXPLICIT_KEYS),
      ...Array.from(VM_HANDLED_KEYS),
      ...Array.from(K8S_HANDLED_KEYS),
      'size', 'sku',
      'security_rules', // handled above as security_rule blocks
    ])

    Object.entries(userConfig).forEach(([key, value]) => {
      if (handledKeys.has(key)) return
      if (value === null || value === undefined) return
      if (isLinuxVm || isWindowsVm) return // VM keys all handled above
      if (typeof value === 'object' && !Array.isArray(value)) {
        resourcesTf += emitBlock(key, value as Record<string, unknown>)
      } else {
        resourcesTf += `  ${key} = ${JSON.stringify(value)}\n`
      }
    })

    // ── Tags ──────────────────────────────────────────────────────────
    const supportsTags = resourceType.startsWith('aws_') || resourceType.startsWith('azurerm_') || resourceType.startsWith('google_')
    const excludeTags = noTagsResources.some(prefix => resourceType.startsWith(prefix))
    if (supportsTags && !excludeTags) {
      resourcesTf += `  tags = {\n    Name        = "\${var.project_name}-${resourceName}"\n    Environment = var.environment\n    ManagedBy   = "JobStack"\n  }\n`
    }

    resourcesTf += `}\n\n`
  })

  // ── Attachment node associations ─────────────────────────────────────────
  // AttachmentNodes (NSG, Route Table, Firewall badges located inside containers)
  // are linked to their parent via parentId — generate the Azure association resources.

  let associationsTf = ''

  nodes
    .filter(n => n.type === 'attachment' && n.parentId)
    .forEach(attachNode => {
      const attachCompId = getNodeComponentId(attachNode)
      if (!attachCompId) return

      const parentNode = nodeMap.get(attachNode.parentId!)
      if (!parentNode) return

      const parentCompId = getNodeComponentId(parentNode)
      if (!parentCompId) return

      const parentComp = getComponentById(parentCompId)
      const parentTfResource = parentComp?.terraform?.resource
      if (!parentTfResource) return

      const attachName = toTfName(String(attachNode.data?.label || attachCompId))
      const parentName  = toTfName(String(parentNode.data?.label  || parentCompId))

      if (associationsTf === '')
        associationsTf += `# ─── Attachment Associations (auto-generated from diagram) ───────────\n\n`

      // Azure NSG → Subnet
      if (attachCompId === 'azure-nsg' && parentTfResource === 'azurerm_subnet') {
        associationsTf += `resource "azurerm_subnet_network_security_group_association" "nsg_assoc_${attachName}" {\n`
        associationsTf += `  subnet_id                 = azurerm_subnet.${parentName}.id\n`
        associationsTf += `  network_security_group_id = azurerm_network_security_group.${attachName}.id\n`
        associationsTf += `}\n\n`
      }
      // Azure Route Table → Subnet
      if (attachCompId === 'azure-route-table' && parentTfResource === 'azurerm_subnet') {
        associationsTf += `resource "azurerm_subnet_route_table_association" "rt_assoc_${attachName}" {\n`
        associationsTf += `  subnet_id      = azurerm_subnet.${parentName}.id\n`
        associationsTf += `  route_table_id = azurerm_route_table.${attachName}.id\n`
        associationsTf += `}\n\n`
      }
      // Azure NSG → NIC
      if (attachCompId === 'azure-nsg' && parentTfResource === 'azurerm_network_interface') {
        associationsTf += `resource "azurerm_network_interface_security_group_association" "nsg_nic_${attachName}_${parentName}" {\n`
        associationsTf += `  network_interface_id      = azurerm_network_interface.${parentName}.id\n`
        associationsTf += `  network_security_group_id = azurerm_network_security_group.${attachName}.id\n`
        associationsTf += `}\n\n`
      }
    })

  if (associationsTf) resourcesTf += associationsTf

  // ── Flow edges: LB/AppGW/ALB → backend pool / target group / listener ────

  const lbListeners = new Set<string>()
  let flowTf = ''

  ;(edges || []).forEach(edge => {
    const srcNode = nodeMap.get(edge.source)
    const tgtNode = nodeMap.get(edge.target)
    if (!srcNode || !tgtNode) return

    const srcCompId = getNodeComponentId(srcNode)
    const tgtCompId = getNodeComponentId(tgtNode)
    if (!srcCompId || !tgtCompId) return

    const srcComp = getComponentById(srcCompId)
    const tgtComp = getComponentById(tgtCompId)
    if (!srcComp?.terraform || !tgtComp?.terraform) return

    const srcResource = srcComp.terraform.resource
    const tgtResource = tgtComp.terraform.resource

    const srcName = toTfName(String(srcNode.data?.label || srcCompId))
    const tgtName = toTfName(String(tgtNode.data?.label || tgtCompId))

    if (flowTf === '')
      flowTf += `# ─── Traffic Flow Resources (auto-generated from edge connections) ──\n\n`

    // Azure Load Balancer → VM
    if (
      srcResource === 'azurerm_lb' &&
      (tgtResource === 'azurerm_linux_virtual_machine' || tgtResource === 'azurerm_windows_virtual_machine')
    ) {
      const poolName = `pool_${srcName}`
      const nicRef   = implicitNics.get(tgtNode.id) || `nic_${tgtName}`

      if (!lbListeners.has(`${srcName}_pool`)) {
        lbListeners.add(`${srcName}_pool`)
        flowTf += `resource "azurerm_lb_backend_address_pool" "${poolName}" {\n`
        flowTf += `  loadbalancer_id = azurerm_lb.${srcName}.id\n`
        flowTf += `  name            = "BackendPool"\n`
        flowTf += `}\n\n`
      }
      flowTf += `resource "azurerm_network_interface_backend_address_pool_association" "bap_${nicRef}" {\n`
      flowTf += `  network_interface_id    = azurerm_network_interface.${nicRef}.id\n`
      flowTf += `  ip_configuration_name   = "internal"\n`
      flowTf += `  backend_address_pool_id = azurerm_lb_backend_address_pool.${poolName}.id\n`
      flowTf += `}\n\n`
    }

    // AWS ALB → EC2: target group + attachment + listener (once per LB)
    if (srcResource === 'aws_lb' && tgtResource === 'aws_instance') {
      const vpcNode = findAncestorByTfResource(tgtNode.id, nodeMap, 'aws_vpc')
      const vpcRef  = vpcNode
        ? `aws_vpc.${toTfName(String(vpcNode.data?.label || 'vpc'))}.id`
        : 'var.vpc_id'
      const tgName = `tg_${srcName}_${tgtName}`

      flowTf += `resource "aws_lb_target_group" "${tgName}" {\n`
      flowTf += `  name     = "\${var.project_name}-${tgName}"\n`
      flowTf += `  port     = 80\n`
      flowTf += `  protocol = "HTTP"\n`
      flowTf += `  vpc_id   = ${vpcRef}\n`
      flowTf += `  health_check {\n    path                = "/"\n    healthy_threshold   = 2\n    unhealthy_threshold = 3\n  }\n`
      flowTf += `}\n\n`

      flowTf += `resource "aws_lb_target_group_attachment" "attach_${srcName}_${tgtName}" {\n`
      flowTf += `  target_group_arn = aws_lb_target_group.${tgName}.arn\n`
      flowTf += `  target_id        = aws_instance.${tgtName}.id\n`
      flowTf += `  port             = 80\n`
      flowTf += `}\n\n`

      if (!lbListeners.has(srcNode.id)) {
        lbListeners.add(srcNode.id)
        flowTf += `resource "aws_lb_listener" "listener_${srcName}" {\n`
        flowTf += `  load_balancer_arn = aws_lb.${srcName}.arn\n`
        flowTf += `  port              = "80"\n`
        flowTf += `  protocol          = "HTTP"\n\n`
        flowTf += `  default_action {\n    type = "forward"\n    target_group_arn = aws_lb_target_group.${tgName}.arn\n  }\n`
        flowTf += `}\n\n`
      }
    }

    // AWS API Gateway → Lambda: invoke permission
    if (srcResource === 'aws_api_gateway_rest_api' && tgtResource === 'aws_lambda_function') {
      flowTf += `resource "aws_lambda_permission" "perm_apigw_${tgtName}" {\n`
      flowTf += `  statement_id  = "AllowExecutionFromAPIGateway"\n`
      flowTf += `  action        = "lambda:InvokeFunction"\n`
      flowTf += `  function_name = aws_lambda_function.${tgtName}.function_name\n`
      flowTf += `  principal     = "apigateway.amazonaws.com"\n`
      flowTf += `  source_arn    = "\${aws_api_gateway_rest_api.${srcName}.execution_arn}/*/*"\n`
      flowTf += `}\n\n`
    }
  })

  if (flowTf) resourcesTf += flowTf

  // ── Peering edges: VNet↔VNet, VPC↔VPC, GCP Network↔Network ──────────────

  const PEERING_TF_RESOURCES = new Set([
    'azurerm_virtual_network', 'aws_vpc', 'google_compute_network',
  ])
  let peeringTf = ''

  ;(edges || []).forEach(edge => {
    const srcNode = nodeMap.get(edge.source)
    const tgtNode = nodeMap.get(edge.target)
    if (!srcNode || !tgtNode) return

    const srcCompId = getNodeComponentId(srcNode)
    const tgtCompId = getNodeComponentId(tgtNode)
    if (!srcCompId || !tgtCompId) return

    const srcComp = getComponentById(srcCompId)
    const tgtComp = getComponentById(tgtCompId)
    if (!srcComp?.terraform || !tgtComp?.terraform) return

    if (
      !PEERING_TF_RESOURCES.has(srcComp.terraform.resource) ||
      !PEERING_TF_RESOURCES.has(tgtComp.terraform.resource)
    ) return

    const srcName = toTfName(String(srcNode.data?.label || srcCompId))
    const tgtName = toTfName(String(tgtNode.data?.label || tgtCompId))

    if (peeringTf === '')
      peeringTf += `# ─── Network Peering (auto-generated from diagram peering edges) ────\n\n`

    if (srcComp.terraform.resource === 'azurerm_virtual_network') {
      const srcRg = getAzureRgRef(srcNode, nodeMap)
      const tgtRg = getAzureRgRef(tgtNode, nodeMap)

      peeringTf += `resource "azurerm_virtual_network_peering" "peer_${srcName}_to_${tgtName}" {\n`
      peeringTf += `  name                         = "peer-${srcName}-to-${tgtName}"\n`
      peeringTf += `  resource_group_name          = ${srcRg}\n`
      peeringTf += `  virtual_network_name         = azurerm_virtual_network.${srcName}.name\n`
      peeringTf += `  remote_virtual_network_id    = azurerm_virtual_network.${tgtName}.id\n`
      peeringTf += `  allow_virtual_network_access = true\n`
      peeringTf += `  allow_forwarded_traffic      = false\n`
      peeringTf += `}\n\n`

      peeringTf += `resource "azurerm_virtual_network_peering" "peer_${tgtName}_to_${srcName}" {\n`
      peeringTf += `  name                         = "peer-${tgtName}-to-${srcName}"\n`
      peeringTf += `  resource_group_name          = ${tgtRg}\n`
      peeringTf += `  virtual_network_name         = azurerm_virtual_network.${tgtName}.name\n`
      peeringTf += `  remote_virtual_network_id    = azurerm_virtual_network.${srcName}.id\n`
      peeringTf += `  allow_virtual_network_access = true\n`
      peeringTf += `  allow_forwarded_traffic      = false\n`
      peeringTf += `}\n\n`
    }

    if (srcComp.terraform.resource === 'aws_vpc') {
      peeringTf += `resource "aws_vpc_peering_connection" "peer_${srcName}_${tgtName}" {\n`
      peeringTf += `  peer_vpc_id = aws_vpc.${tgtName}.id\n`
      peeringTf += `  vpc_id      = aws_vpc.${srcName}.id\n`
      peeringTf += `  auto_accept = true\n`
      peeringTf += `  tags = { Name = "peer-${srcName}-${tgtName}", Environment = var.environment }\n`
      peeringTf += `}\n\n`
    }

    if (srcComp.terraform.resource === 'google_compute_network') {
      peeringTf += `resource "google_compute_network_peering" "peer_${srcName}_to_${tgtName}" {\n`
      peeringTf += `  name         = "peer-${srcName}-to-${tgtName}"\n`
      peeringTf += `  network      = google_compute_network.${srcName}.self_link\n`
      peeringTf += `  peer_network = google_compute_network.${tgtName}.self_link\n`
      peeringTf += `}\n\n`

      peeringTf += `resource "google_compute_network_peering" "peer_${tgtName}_to_${srcName}" {\n`
      peeringTf += `  name         = "peer-${tgtName}-to-${srcName}"\n`
      peeringTf += `  network      = google_compute_network.${tgtName}.self_link\n`
      peeringTf += `  peer_network = google_compute_network.${srcName}.self_link\n`
      peeringTf += `}\n\n`
    }
  })

  if (peeringTf) resourcesTf += peeringTf

  outputs.push({ code: resourcesTf, filename: 'resources.tf', provider: 'terraform' })

  // ── connections.tf — dependency edges → connection string locals ───────────
  // App → Data-store edges (edgeType: 'dependency') produce Terraform locals
  // with the resolved endpoint/connection string. Reference them in app_settings.

  const DATA_TF_RESOURCES = new Set([
    'azurerm_mssql_server', 'azurerm_cosmosdb_account', 'azurerm_storage_account',
    'azurerm_key_vault', 'azurerm_redis_cache', 'azurerm_servicebus_namespace',
    'aws_db_instance', 'aws_dynamodb_table', 'aws_elasticache_cluster', 'aws_s3_bucket',
    'aws_secretsmanager_secret', 'aws_sqs_queue',
    'google_sql_database_instance', 'google_storage_bucket',
  ])

  let dependencyLocals = ''

  ;(edges || []).forEach(edge => {
    if ((edge.data as any)?.edgeType !== 'dependency') return

    const srcNode = nodeMap.get(edge.source)
    const tgtNode = nodeMap.get(edge.target)
    if (!srcNode || !tgtNode) return

    const srcCompId = getNodeComponentId(srcNode)
    const tgtCompId = getNodeComponentId(tgtNode)
    if (!srcCompId || !tgtCompId) return

    const tgtComp = getComponentById(tgtCompId)
    if (!tgtComp?.terraform || !DATA_TF_RESOURCES.has(tgtComp.terraform.resource)) return

    const srcName = toTfName(String(srcNode.data?.label || srcCompId))
    const tgtName = toTfName(String(tgtNode.data?.label || tgtCompId))

    if (dependencyLocals === '') {
      dependencyLocals += `# connections.tf\n# Service dependency connection strings — auto-generated from diagram edges.\n`
      dependencyLocals += `# Reference these locals in your app_settings / environment_variables blocks.\n\n`
      dependencyLocals += `locals {\n`
    }

    switch (tgtComp.terraform.resource) {
      case 'azurerm_mssql_server':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = "Server=tcp:\${azurerm_mssql_server.${tgtName}.fully_qualified_domain_name},1433;User ID=\${var.db_admin_username};Password=\${var.db_admin_password};Encrypt=true;"\n`
        break
      case 'azurerm_cosmosdb_account':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = azurerm_cosmosdb_account.${tgtName}.connection_strings[0]\n`
        break
      case 'azurerm_redis_cache':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = azurerm_redis_cache.${tgtName}.primary_connection_string\n`
        break
      case 'azurerm_key_vault':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = azurerm_key_vault.${tgtName}.vault_uri\n`
        break
      case 'azurerm_storage_account':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = azurerm_storage_account.${tgtName}.primary_blob_endpoint\n`
        break
      case 'aws_dynamodb_table':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = aws_dynamodb_table.${tgtName}.arn\n`
        break
      case 'aws_db_instance':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = aws_db_instance.${tgtName}.endpoint\n`
        break
      case 'aws_s3_bucket':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = aws_s3_bucket.${tgtName}.bucket_domain_name\n`
        break
      case 'aws_sqs_queue':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = aws_sqs_queue.${tgtName}.url\n`
        break
      case 'aws_secretsmanager_secret':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = aws_secretsmanager_secret.${tgtName}.arn\n`
        break
      case 'google_sql_database_instance':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = google_sql_database_instance.${tgtName}.connection_name\n`
        break
      case 'google_storage_bucket':
        dependencyLocals += `  conn_${srcName}_to_${tgtName} = google_storage_bucket.${tgtName}.url\n`
        break
    }
  })

  if (dependencyLocals) {
    dependencyLocals += `}\n`
    outputs.push({ code: dependencyLocals, filename: 'connections.tf', provider: 'terraform' })
  }

  // ── outputs.tf ─────────────────────────────────────────────────────────
  let outputsTf = '# outputs.tf\n# Exports useful resource attributes for use in other configurations.\n\n'

  implicitNics.forEach((nicRefName) => {
    outputsTf += `output "${nicRefName}_id" {\n  value = azurerm_network_interface.${nicRefName}.id\n}\n\n`
  })

  validNodes.forEach(node => {
    const componentId = getNodeComponentId(node)!
    const component = getComponentById(componentId)!
    const resourceName = nodeIdToTfName.get(node.id) || toTfName(String(node.data?.label || component.name))
    const resourceType = component.terraform!.resource
    outputsTf += `output "${resourceName}_id" {\n  value = ${resourceType}.${resourceName}.id\n}\n\n`
  })

  outputs.push({ code: outputsTf, filename: 'outputs.tf', provider: 'terraform' })

  return { success: errors.length === 0, files: outputs, errors, warnings, skippedCount }
}

export function generateTerraform(
  nodes: Node<NodeData>[],
  edges: Edge[],
  options?: { environment?: string; projectName?: string }
): TerraformOutput[] {
  const result = generateTerraformWithValidation(nodes, edges, options)
  if (!result.success && result.files.length === 0) {
    throw new Error(result.errors.map(e => e.error).join('; ') || 'Cannot generate Terraform')
  }
  return result.files
}

export function generateTerraformReadme(nodes: Node<NodeData>[]): string {
  const validNodes = nodes.filter(n => {
    const id = getNodeComponentId(n)
    return id && getComponentById(id)?.terraform
  })
  const cost = calculateTotalCost(nodes)
  return (
    '# Infrastructure as Code - JobStack\n\n' +
    '## Overview\n' +
    `Components: ${validNodes.length}\n` +
    `Estimated Cost: $${cost.min} - $${cost.max}/month\n\n` +
    '## Quick Start\n' +
    '```bash\nterraform init\nterraform plan\nterraform apply\n```\n'
  )
}

function calculateTotalCost(nodes: Node<NodeData>[]): { min: number; max: number } {
  let min = 0
  let max = 0
  nodes.forEach(node => {
    const id = getNodeComponentId(node)
    if (id) {
      const c = getComponentById(id)
      if (c) { min += c.estimatedCost.min; max += c.estimatedCost.max }
    }
  })
  return { min, max }
}
