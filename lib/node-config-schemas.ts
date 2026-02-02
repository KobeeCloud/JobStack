// Configuration schemas for different component types
import { z } from 'zod'

// ==========================================
// COMPUTE CONFIGURATION
// ==========================================
export const vmConfigSchema = z.object({
  size: z.string().optional(), // VM size (e.g., Standard_D2s_v3)
  osImage: z.string().optional(), // OS image (e.g., ubuntu-22.04, windows-server-2022)
  replicas: z.number().min(1).max(100).optional().default(1),
  diskSize: z.number().min(30).max(4096).optional(), // GB
  diskType: z.enum(['standard_hdd', 'standard_ssd', 'premium_ssd']).optional(),
  publicIp: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
  labels: z.record(z.string()).optional(),
})

// ==========================================
// NETWORKING CONFIGURATION
// ==========================================
export const vnetConfigSchema = z.object({
  addressSpace: z.string().optional(), // CIDR (e.g., 10.0.0.0/16)
  dnsServers: z.array(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

export const subnetConfigSchema = z.object({
  addressPrefix: z.string().optional(), // CIDR (e.g., 10.0.1.0/24)
  serviceEndpoints: z.array(z.string()).optional(),
  delegations: z.array(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

export const nsgConfigSchema = z.object({
  rules: z.array(z.object({
    name: z.string(),
    priority: z.number().min(100).max(4096),
    direction: z.enum(['inbound', 'outbound']),
    access: z.enum(['allow', 'deny']),
    protocol: z.enum(['tcp', 'udp', 'icmp', '*']),
    sourcePort: z.string(), // e.g., "80", "80-90", "*"
    destinationPort: z.string(),
    sourceAddress: z.string(),
    destinationAddress: z.string(),
  })).optional(),
  attachedTo: z.array(z.string()).optional(), // IDs of subnets or NICs
  tags: z.record(z.string()).optional(),
})

export const nicConfigSchema = z.object({
  privateIpAddress: z.string().optional(),
  privateIpAllocationMethod: z.enum(['static', 'dynamic']).optional().default('dynamic'),
  enableAcceleratedNetworking: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
})

export const publicIpConfigSchema = z.object({
  allocationMethod: z.enum(['static', 'dynamic']).optional().default('dynamic'),
  sku: z.enum(['basic', 'standard']).optional().default('standard'),
  domainNameLabel: z.string().optional(),
  tags: z.record(z.string()).optional(),
})

export const loadBalancerConfigSchema = z.object({
  sku: z.enum(['basic', 'standard', 'gateway']).optional().default('standard'),
  frontendIpConfigs: z.array(z.object({
    name: z.string(),
    publicIpId: z.string().optional(),
    privateIpAddress: z.string().optional(),
  })).optional(),
  backendPools: z.array(z.object({
    name: z.string(),
    vmIds: z.array(z.string()),
  })).optional(),
  probes: z.array(z.object({
    name: z.string(),
    protocol: z.enum(['tcp', 'http', 'https']),
    port: z.number(),
    path: z.string().optional(),
  })).optional(),
  rules: z.array(z.object({
    name: z.string(),
    protocol: z.enum(['tcp', 'udp', 'all']),
    frontendPort: z.number(),
    backendPort: z.number(),
  })).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// STORAGE CONFIGURATION
// ==========================================
export const storageAccountConfigSchema = z.object({
  accountTier: z.enum(['standard', 'premium']).optional().default('standard'),
  replicationType: z.enum(['lrs', 'grs', 'ragrs', 'zrs', 'gzrs', 'ragzrs']).optional().default('lrs'),
  kind: z.enum(['storage', 'storagev2', 'blobstorage', 'blockblobstorage', 'filestorage']).optional().default('storagev2'),
  accessTier: z.enum(['hot', 'cool']).optional().default('hot'),
  enableHttpsOnly: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

export const diskConfigSchema = z.object({
  size: z.number().min(1).max(65536).optional(), // GB
  sku: z.enum(['standard_hdd', 'standard_ssd', 'premium_ssd', 'ultrassd']).optional().default('premium_ssd'),
  createOption: z.enum(['empty', 'copy', 'fromimage', 'import', 'restore']).optional().default('empty'),
  diskIops: z.number().optional(),
  diskMbps: z.number().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
export const sqlServerConfigSchema = z.object({
  version: z.string().optional(), // e.g., "12.0"
  adminUsername: z.string().optional(),
  enablePublicNetworkAccess: z.boolean().optional().default(false),
  minTlsVersion: z.enum(['1.0', '1.1', '1.2']).optional().default('1.2'),
  tags: z.record(z.string()).optional(),
})

export const sqlDatabaseConfigSchema = z.object({
  sku: z.string().optional(), // e.g., "S0", "P1", "GP_Gen5_2"
  maxSizeGb: z.number().optional(),
  collation: z.string().optional(),
  zoneRedundant: z.boolean().optional().default(false),
  backupRetentionDays: z.number().min(1).max(35).optional().default(7),
  tags: z.record(z.string()).optional(),
})

export const cosmosDbConfigSchema = z.object({
  offerType: z.enum(['standard']).optional().default('standard'),
  kind: z.enum(['GlobalDocumentDB', 'MongoDB', 'Cassandra', 'Gremlin', 'Table']).optional().default('GlobalDocumentDB'),
  consistencyLevel: z.enum(['eventual', 'consistentprefix', 'session', 'boundedstale', 'strong']).optional().default('session'),
  maxStalenessSeconds: z.number().optional(),
  maxIntervalInSeconds: z.number().optional(),
  enableAutomaticFailover: z.boolean().optional().default(true),
  enableMultipleWriteLocations: z.boolean().optional().default(false),
  geoLocations: z.array(z.object({
    location: z.string(),
    failoverPriority: z.number(),
  })).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// CONTAINER CONFIGURATION
// ==========================================
export const aksConfigSchema = z.object({
  kubernetesVersion: z.string().optional(),
  dnsPrefix: z.string().optional(),
  defaultNodePool: z.object({
    name: z.string(),
    vmSize: z.string(),
    nodeCount: z.number().min(1).max(100),
    minCount: z.number().optional(),
    maxCount: z.number().optional(),
    enableAutoScaling: z.boolean().optional().default(false),
    maxPods: z.number().optional(),
    osDiskSizeGb: z.number().optional(),
  }).optional(),
  networkProfile: z.object({
    networkPlugin: z.enum(['azure', 'kubenet']).optional().default('azure'),
    networkPolicy: z.enum(['azure', 'calico']).optional(),
    serviceCidr: z.string().optional(),
    dnsServiceIp: z.string().optional(),
    dockerBridgeCidr: z.string().optional(),
  }).optional(),
  enableRbac: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

export const aciConfigSchema = z.object({
  osType: z.enum(['linux', 'windows']).optional().default('linux'),
  restartPolicy: z.enum(['always', 'onfailure', 'never']).optional().default('always'),
  containers: z.array(z.object({
    name: z.string(),
    image: z.string(),
    cpu: z.number(),
    memory: z.number(),
    ports: z.array(z.number()).optional(),
    environmentVariables: z.record(z.string()).optional(),
  })).optional(),
  ipAddressType: z.enum(['public', 'private']).optional().default('public'),
  dnsNameLabel: z.string().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// PAAS / APP SERVICES CONFIGURATION
// ==========================================
export const appServiceConfigSchema = z.object({
  sku: z.string().optional(), // e.g., "B1", "S1", "P1v2"
  alwaysOn: z.boolean().optional().default(true),
  httpVersion: z.string().optional().default('2.0'),
  minTlsVersion: z.string().optional().default('1.2'),
  enableHttps: z.boolean().optional().default(true),
  runtime: z.string().optional(), // e.g., "node|18-lts", "python|3.11", "dotnet|7.0"
  appSettings: z.record(z.string()).optional(),
  connectionStrings: z.array(z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
  })).optional(),
  tags: z.record(z.string()).optional(),
})

export const functionAppConfigSchema = z.object({
  sku: z.string().optional(), // e.g., "Y1" (consumption), "EP1" (elastic premium)
  runtime: z.string().optional(), // e.g., "node", "python", "dotnet"
  runtimeVersion: z.string().optional(),
  alwaysOn: z.boolean().optional(),
  appSettings: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// GENERIC CONFIGURATION
// ==========================================
export const genericConfigSchema = z.object({
  replicas: z.number().min(1).max(100).optional().default(1),
  tags: z.record(z.string()).optional(),
  labels: z.record(z.string()).optional(),
  customProperties: z.record(z.any()).optional(),
})

// Map component IDs to their config schemas
export const CONFIG_SCHEMAS: Record<string, z.ZodSchema> = {
  // Compute
  'azure-vm': vmConfigSchema,
  'aws-ec2': vmConfigSchema,
  'gcp-compute': vmConfigSchema,
  'azure-vmss': vmConfigSchema,

  // Networking
  'azure-vnet': vnetConfigSchema,
  'aws-vpc': vnetConfigSchema,
  'gcp-vpc': vnetConfigSchema,
  'azure-subnet': subnetConfigSchema,
  'aws-subnet': subnetConfigSchema,
  'gcp-subnet': subnetConfigSchema,
  'azure-nsg': nsgConfigSchema,
  'aws-security-group': nsgConfigSchema,
  'gcp-firewall': nsgConfigSchema,
  'azure-nic': nicConfigSchema,
  'azure-public-ip': publicIpConfigSchema,
  'aws-eip': publicIpConfigSchema,
  'gcp-external-ip': publicIpConfigSchema,
  'azure-lb': loadBalancerConfigSchema,
  'aws-elb': loadBalancerConfigSchema,
  'aws-alb': loadBalancerConfigSchema,
  'gcp-lb': loadBalancerConfigSchema,

  // Storage
  'azure-storage': storageAccountConfigSchema,
  'azure-disk': diskConfigSchema,
  'aws-ebs': diskConfigSchema,
  'gcp-disk': diskConfigSchema,

  // Databases
  'azure-sql': sqlServerConfigSchema,
  'azure-sql-database': sqlDatabaseConfigSchema,
  'azure-cosmosdb': cosmosDbConfigSchema,
  'aws-rds': sqlServerConfigSchema,
  'gcp-cloudsql': sqlServerConfigSchema,

  // Containers
  'azure-aks': aksConfigSchema,
  'aws-eks': aksConfigSchema,
  'gcp-gke': aksConfigSchema,
  'azure-aci': aciConfigSchema,

  // PaaS
  'azure-app-service': appServiceConfigSchema,
  'azure-functions': functionAppConfigSchema,
  'aws-lambda': functionAppConfigSchema,
  'gcp-cloud-functions': functionAppConfigSchema,

  // Default for everything else
  'default': genericConfigSchema,
}

// Helper to get schema for a component
export function getConfigSchema(componentId: string): z.ZodSchema {
  return CONFIG_SCHEMAS[componentId] || CONFIG_SCHEMAS['default']
}

// Type inference helpers
export type VmConfig = z.infer<typeof vmConfigSchema>
export type VnetConfig = z.infer<typeof vnetConfigSchema>
export type SubnetConfig = z.infer<typeof subnetConfigSchema>
export type NsgConfig = z.infer<typeof nsgConfigSchema>
export type StorageAccountConfig = z.infer<typeof storageAccountConfigSchema>
export type SqlServerConfig = z.infer<typeof sqlServerConfigSchema>
export type AksConfig = z.infer<typeof aksConfigSchema>
export type AppServiceConfig = z.infer<typeof appServiceConfigSchema>
export type GenericConfig = z.infer<typeof genericConfigSchema>

// Union type for all configs
export type NodeConfig =
  | VmConfig
  | VnetConfig
  | SubnetConfig
  | NsgConfig
  | StorageAccountConfig
  | SqlServerConfig
  | AksConfig
  | AppServiceConfig
  | GenericConfig
