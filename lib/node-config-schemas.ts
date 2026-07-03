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
  ssh_public_key: z.string().optional(),
  user_data: z.string().optional(),
  iam_instance_profile: z.array(z.string()).optional(),
  managed_identity: z.array(z.string()).optional(),
  tags: z.record(z.string()).optional(),
  labels: z.record(z.string()).optional(),
})

// ==========================================
// NETWORKING CONFIGURATION
// ==========================================
export const vnetConfigSchema = z.object({
  address_space: z.array(z.string()).optional(),
  cidr_block: z.string().optional(),
  addressSpace: z.string().optional(), // CIDR (e.g., 10.0.0.0/16)
  enable_dns_hostnames: z.boolean().optional().default(true),
  enable_dns_support: z.boolean().optional().default(true),
  route_table_id: z.string().optional(),
  dns_servers: z.array(z.string()).optional(),
  dnsServers: z.array(z.string()).optional(),
  bgp_community: z.string().optional(),
  flow_timeout_in_minutes: z.number().min(4).max(30).optional(),
  ddos_protection_enabled: z.boolean().optional(),
  ddos_protection_plan_id: z.string().optional(),
  vm_protection_enabled: z.boolean().optional(),
  instance_tenancy: z.enum(['default', 'dedicated']).optional(),
  assign_generated_ipv6_cidr_block: z.boolean().optional(),
  auto_create_subnetworks: z.boolean().optional(),
  routing_mode: z.enum(['REGIONAL', 'GLOBAL']).optional(),
  mtu: z.number().optional(),
  delete_default_routes_on_create: z.boolean().optional(),
  tags: z.record(z.string()).optional(),
})

export const subnetConfigSchema = z.object({
  address_prefixes: z.array(z.string()).optional(),
  cidr_block: z.string().optional(),
  addressPrefix: z.string().optional(), // CIDR (e.g., 10.0.1.0/24)
  delegation: z.string().optional(),
  service_endpoints: z.array(z.string()).optional(),
  serviceEndpoints: z.array(z.string()).optional(),
  private_endpoint_network_policies: z
    .enum(['Disabled', 'Enabled', 'NetworkSecurityGroupEnabled', 'RouteTableEnabled'])
    .optional(),
  private_link_service_network_policies_enabled: z.boolean().optional(),
  default_outbound_access_enabled: z.boolean().optional(),
  availability_zone: z.string().optional(),
  map_public_ip_on_launch: z.boolean().optional(),
  assign_ipv6_address_on_creation: z.boolean().optional(),
  customer_owned_ipv4_pool: z.string().optional(),
  region: z.string().optional(),
  purpose: z.string().optional(),
  private_ip_google_access: z.boolean().optional(),
  log_config_enable: z.boolean().optional(),
  delegations: z.array(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

export const nsgConfigSchema = z.object({
  rules: z
    .array(
      z.object({
        name: z.string(),
        priority: z.number().min(100).max(4096),
        direction: z.enum(['inbound', 'outbound']),
        access: z.enum(['allow', 'deny']),
        protocol: z.enum(['tcp', 'udp', 'icmp', '*']),
        sourcePort: z.string(), // e.g., "80", "80-90", "*"
        destinationPort: z.string(),
        sourceAddress: z.string(),
        destinationAddress: z.string(),
      })
    )
    .optional(),
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
  frontendIpConfigs: z
    .array(
      z.object({
        name: z.string(),
        publicIpId: z.string().optional(),
        privateIpAddress: z.string().optional(),
      })
    )
    .optional(),
  backendPools: z
    .array(
      z.object({
        name: z.string(),
        vmIds: z.array(z.string()),
      })
    )
    .optional(),
  probes: z
    .array(
      z.object({
        name: z.string(),
        protocol: z.enum(['tcp', 'http', 'https']),
        port: z.number(),
        path: z.string().optional(),
      })
    )
    .optional(),
  rules: z
    .array(
      z.object({
        name: z.string(),
        protocol: z.enum(['tcp', 'udp', 'all']),
        frontendPort: z.number(),
        backendPort: z.number(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// STORAGE CONFIGURATION
// ==========================================
export const storageAccountConfigSchema = z.object({
  accountTier: z.enum(['standard', 'premium']).optional().default('standard'),
  replicationType: z
    .enum(['lrs', 'grs', 'ragrs', 'zrs', 'gzrs', 'ragzrs'])
    .optional()
    .default('lrs'),
  kind: z
    .enum(['storage', 'storagev2', 'blobstorage', 'blockblobstorage', 'filestorage'])
    .optional()
    .default('storagev2'),
  accessTier: z.enum(['hot', 'cool']).optional().default('hot'),
  enableHttpsOnly: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

export const diskConfigSchema = z.object({
  size: z.number().min(1).max(65536).optional(), // GB
  sku: z
    .enum(['standard_hdd', 'standard_ssd', 'premium_ssd', 'ultrassd'])
    .optional()
    .default('premium_ssd'),
  createOption: z
    .enum(['empty', 'copy', 'fromimage', 'import', 'restore'])
    .optional()
    .default('empty'),
  diskIops: z.number().optional(),
  diskMbps: z.number().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
export const sqlServerConfigSchema = z.object({
  version: z.string().optional(), // e.g., "12.0"
  engine: z.enum(['mysql', 'postgres', 'sqlserver', 'mariadb', 'oracle']).optional(),
  multi_az: z.boolean().optional().default(false),
  storage_type: z.enum(['standard', 'gp2', 'gp3', 'io1']).optional(),
  allocated_storage: z.number().optional(),
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
  kind: z
    .enum(['GlobalDocumentDB', 'MongoDB', 'Cassandra', 'Gremlin', 'Table'])
    .optional()
    .default('GlobalDocumentDB'),
  consistencyLevel: z
    .enum(['eventual', 'consistentprefix', 'session', 'boundedstale', 'strong'])
    .optional()
    .default('session'),
  maxStalenessSeconds: z.number().optional(),
  maxIntervalInSeconds: z.number().optional(),
  enableAutomaticFailover: z.boolean().optional().default(true),
  enableMultipleWriteLocations: z.boolean().optional().default(false),
  geoLocations: z
    .array(
      z.object({
        location: z.string(),
        failoverPriority: z.number(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// CONTAINER CONFIGURATION
// ==========================================
export const aksConfigSchema = z.object({
  kubernetesVersion: z.string().optional(),
  dnsPrefix: z.string().optional(),
  oidc_issuer_enabled: z.boolean().optional().default(true),
  defaultNodePool: z
    .object({
      name: z.string(),
      vmSize: z.string(),
      nodeCount: z.number().min(1).max(100),
      minCount: z.number().optional(),
      maxCount: z.number().optional(),
      enableAutoScaling: z.boolean().optional().default(false),
      maxPods: z.number().optional(),
      osDiskSizeGb: z.number().optional(),
      taints: z.array(z.string()).optional(),
    })
    .optional(),
  networkProfile: z
    .object({
      networkPlugin: z.enum(['azure', 'kubenet']).optional().default('azure'),
      networkPluginMode: z.enum(['overlay']).optional(),
      networkPolicy: z.enum(['azure', 'calico', 'cilium']).optional(),
      serviceCidr: z.string().optional(),
      dnsServiceIp: z.string().optional(),
      dockerBridgeCidr: z.string().optional(),
    })
    .optional(),
  enableRbac: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

export const aciConfigSchema = z.object({
  osType: z.enum(['linux', 'windows']).optional().default('linux'),
  restartPolicy: z.enum(['always', 'onfailure', 'never']).optional().default('always'),
  containers: z
    .array(
      z.object({
        name: z.string(),
        image: z.string(),
        cpu: z.number(),
        memory: z.number(),
        ports: z.array(z.number()).optional(),
        environmentVariables: z.record(z.string()).optional(),
      })
    )
    .optional(),
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
  connectionStrings: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        value: z.string(),
      })
    )
    .optional(),
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
// CI/CD & DEVOPS CONFIGURATION
// ==========================================
export const githubActionsConfigSchema = z.object({
  triggers: z
    .array(z.enum(['push', 'pull_request', 'schedule', 'workflow_dispatch', 'release']))
    .optional(),
  branches: z.array(z.string()).optional(),
  runsOn: z
    .enum([
      'ubuntu-latest',
      'ubuntu-22.04',
      'ubuntu-20.04',
      'windows-latest',
      'macos-latest',
      'self-hosted',
    ])
    .optional(),
  stages: z.array(z.string()).optional(),
  nodeVersion: z.string().optional(),
  pythonVersion: z.string().optional(),
  dockerRegistry: z.string().optional(),
  deployTarget: z.enum(['kubernetes', 'ecs', 'appservice', 'lambda', 'custom', 'none']).optional(),
  tags: z.record(z.string()).optional(),
})

export const gitlabCIConfigSchema = z.object({
  triggers: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  runsOn: z.enum(['docker', 'shell', 'kubernetes', 'self-hosted']).optional(),
  stages: z.array(z.string()).optional(),
  deployTarget: z.enum(['kubernetes', 'ecs', 'appservice', 'lambda', 'custom', 'none']).optional(),
  tags: z.record(z.string()).optional(),
})

export const jenkinsConfigSchema = z.object({
  triggers: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  runsOn: z.string().optional(),
  stages: z.array(z.string()).optional(),
  deployTarget: z.enum(['kubernetes', 'ecs', 'appservice', 'lambda', 'custom', 'none']).optional(),
  tags: z.record(z.string()).optional(),
})

export const argoCDConfigSchema = z.object({
  repoUrl: z.string().optional(),
  targetRevision: z.string().optional(),
  appNamespace: z.string().optional(),
  destinationNamespace: z.string().optional(),
  syncPolicy: z.enum(['automated', 'manual']).optional(),
  selfHeal: z.boolean().optional(),
  prune: z.boolean().optional(),
  tags: z.record(z.string()).optional(),
})

export const helmConfigSchema = z.object({
  chartName: z.string().optional(),
  chartVersion: z.string().optional(),
  replicaCount: z.number().min(1).max(100).optional(),
  imageRepository: z.string().optional(),
  imageTag: z.string().optional(),
  serviceType: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']).optional(),
  ingressEnabled: z.boolean().optional(),
  tags: z.record(z.string()).optional(),
})

export const datadogConfigSchema = z.object({
  site: z
    .enum(['datadoghq.com', 'datadoghq.eu', 'us3.datadoghq.com', 'us5.datadoghq.com'])
    .optional(),
  env: z.string().optional(),
  service: z.string().optional(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  apmEnabled: z.boolean().optional(),
  logsEnabled: z.boolean().optional(),
  processAgentEnabled: z.boolean().optional(),
  tags: z.record(z.string()).optional(),
})

export const prometheusConfigSchema = z.object({
  scrapeInterval: z.string().optional(),
  evaluationInterval: z.string().optional(),
  retentionTime: z.string().optional(),
  port: z.number().optional(),
  tags: z.record(z.string()).optional(),
})

export const rabbitmqConfigSchema = z.object({
  defaultUser: z.string().optional(),
  managementPort: z.number().optional(),
  amqpPort: z.number().optional(),
  vhost: z.string().optional(),
  replicaCount: z.number().min(1).max(10).optional(),
  tags: z.record(z.string()).optional(),
})

export const kafkaConfigSchema = z.object({
  brokerId: z.number().optional(),
  port: z.number().optional(),
  partitions: z.number().min(1).max(100).optional(),
  replicationFactor: z.number().min(1).max(10).optional(),
  retentionHours: z.number().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// OBJECT STORAGE CONFIGURATION
// ==========================================
export const s3ConfigSchema = z.object({
  bucketName: z.string().optional(),
  versioning: z.boolean().optional().default(false),
  encryption: z.enum(['none', 'sse-s3', 'sse-kms', 'sse-c']).optional().default('sse-s3'),
  accessControl: z
    .enum(['private', 'public-read', 'public-read-write', 'authenticated-read'])
    .optional()
    .default('private'),
  lifecycleRules: z
    .array(
      z.object({
        prefix: z.string().optional(),
        transitionDays: z.number().optional(),
        transitionStorageClass: z.string().optional(),
        expirationDays: z.number().optional(),
      })
    )
    .optional(),
  corsRules: z
    .array(
      z.object({
        allowedOrigins: z.array(z.string()),
        allowedMethods: z.array(z.enum(['GET', 'PUT', 'POST', 'DELETE', 'HEAD'])),
        allowedHeaders: z.array(z.string()).optional(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// CONTAINER SERVICE CONFIGURATION
// ==========================================
export const ecsConfigSchema = z.object({
  clusterName: z.string().optional(),
  launchType: z.enum(['ec2', 'fargate', 'external']).optional().default('fargate'),
  desiredCount: z.number().min(0).max(100).optional().default(1),
  cpu: z.number().optional(), // vCPU units (256, 512, 1024, 2048, 4096)
  memory: z.number().optional(), // MB
  containerImage: z.string().optional(),
  containerPort: z.number().optional(),
  enableServiceDiscovery: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
})

export const cloudRunConfigSchema = z.object({
  image: z.string().optional(),
  port: z.number().optional().default(8080),
  cpu: z.string().optional(), // e.g., "1", "2"
  memory: z.string().optional(), // e.g., "512Mi", "1Gi"
  minInstances: z.number().min(0).optional().default(0),
  maxInstances: z.number().min(1).max(1000).optional().default(100),
  concurrency: z.number().min(1).max(1000).optional().default(80),
  allowUnauthenticated: z.boolean().optional().default(false),
  env: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// CACHE CONFIGURATION
// ==========================================
export const cacheConfigSchema = z.object({
  engine: z.enum(['redis', 'memcached']).optional().default('redis'),
  nodeType: z.string().optional(), // e.g., "cache.t3.micro"
  numCacheNodes: z.number().min(1).max(20).optional().default(1),
  engineVersion: z.string().optional(),
  port: z.number().optional().default(6379),
  snapshotRetentionLimit: z.number().optional(),
  transitEncryptionEnabled: z.boolean().optional().default(true),
  atRestEncryptionEnabled: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// CDN CONFIGURATION
// ==========================================
export const cdnConfigSchema = z.object({
  origins: z
    .array(
      z.object({
        domainName: z.string(),
        originId: z.string().optional(),
        protocol: z.enum(['http-only', 'https-only', 'match-viewer']).optional(),
      })
    )
    .optional(),
  defaultCacheBehavior: z
    .object({
      viewerProtocolPolicy: z.enum(['allow-all', 'https-only', 'redirect-to-https']).optional(),
      cachePolicyId: z.string().optional(),
      ttl: z.number().optional(),
    })
    .optional(),
  priceClass: z.string().optional(),
  wafEnabled: z.boolean().optional().default(false),
  customDomain: z.string().optional(),
  sslCertificateArn: z.string().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// DNS CONFIGURATION
// ==========================================
export const dnsConfigSchema = z.object({
  zoneName: z.string().optional(),
  zoneType: z.enum(['public', 'private']).optional().default('public'),
  records: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'PTR']),
        ttl: z.number().optional().default(300),
        values: z.array(z.string()),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// MESSAGE QUEUE CONFIGURATION
// ==========================================
export const queueConfigSchema = z.object({
  queueName: z.string().optional(),
  fifo: z.boolean().optional().default(false),
  visibilityTimeout: z.number().min(0).max(43200).optional().default(30),
  messageRetentionPeriod: z.number().optional().default(345600), // seconds
  maxMessageSize: z.number().optional(), // bytes
  delaySeconds: z.number().optional().default(0),
  deadLetterQueue: z.boolean().optional().default(false),
  maxReceiveCount: z.number().optional().default(5),
  encryption: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// NOTIFICATION / SNS CONFIGURATION
// ==========================================
export const notificationConfigSchema = z.object({
  topicName: z.string().optional(),
  displayName: z.string().optional(),
  fifo: z.boolean().optional().default(false),
  encryption: z.boolean().optional().default(true),
  subscriptions: z
    .array(
      z.object({
        protocol: z.enum(['email', 'sms', 'http', 'https', 'sqs', 'lambda', 'application']),
        endpoint: z.string(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// API GATEWAY CONFIGURATION
// ==========================================
export const apiGatewayConfigSchema = z.object({
  apiName: z.string().optional(),
  apiType: z.enum(['rest', 'http', 'websocket']).optional().default('rest'),
  stageName: z.string().optional().default('prod'),
  authorizationType: z
    .enum(['none', 'api_key', 'iam', 'cognito', 'lambda'])
    .optional()
    .default('none'),
  throttling: z
    .object({
      rateLimit: z.number().optional(),
      burstLimit: z.number().optional(),
    })
    .optional(),
  cors: z.boolean().optional().default(true),
  loggingLevel: z.enum(['OFF', 'ERROR', 'INFO']).optional().default('ERROR'),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// SECRET STORE CONFIGURATION
// ==========================================
export const secretStoreConfigSchema = z.object({
  name: z.string().optional(),
  sku: z.enum(['standard', 'premium']).optional().default('standard'),
  enableSoftDelete: z.boolean().optional().default(true),
  softDeleteRetentionDays: z.number().min(7).max(90).optional().default(90),
  enablePurgeProtection: z.boolean().optional().default(false),
  enableRbac: z.boolean().optional().default(true),
  networkAcls: z
    .object({
      defaultAction: z.enum(['allow', 'deny']).optional().default('deny'),
      ipRules: z.array(z.string()).optional(),
    })
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// APPLICATION GATEWAY / WAF CONFIGURATION
// ==========================================
export const appGatewayConfigSchema = z.object({
  sku: z.enum(['standard_v2', 'waf_v2']).optional().default('standard_v2'),
  tier: z.enum(['standard_v2', 'waf_v2']).optional().default('standard_v2'),
  capacity: z.number().min(1).max(125).optional().default(2),
  enableHttp2: z.boolean().optional().default(true),
  wafMode: z.enum(['detection', 'prevention']).optional(),
  wafRuleSetVersion: z.string().optional(),
  sslPolicy: z.string().optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// BASTION CONFIGURATION
// ==========================================
export const bastionConfigSchema = z.object({
  sku: z.enum(['basic', 'standard']).optional().default('basic'),
  scaleUnits: z.number().min(2).max(50).optional().default(2),
  copyPasteEnabled: z.boolean().optional().default(true),
  fileCopyEnabled: z.boolean().optional().default(false),
  tunneling: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// FIREWALL CONFIGURATION
// ==========================================
export const firewallConfigSchema = z.object({
  sku: z.enum(['standard', 'premium']).optional().default('standard'),
  threatIntelMode: z.enum(['alert', 'deny', 'off']).optional().default('alert'),
  dnsProxyEnabled: z.boolean().optional().default(false),
  rules: z
    .array(
      z.object({
        name: z.string(),
        priority: z.number().min(100).max(65000),
        action: z.enum(['allow', 'deny']),
        ruleType: z.enum(['application', 'network', 'nat']),
        protocols: z.array(z.string()).optional(),
        sourceAddresses: z.array(z.string()).optional(),
        destinationAddresses: z.array(z.string()).optional(),
        destinationPorts: z.array(z.string()).optional(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// EVENT STREAMING CONFIGURATION
// ==========================================
export const eventStreamConfigSchema = z.object({
  namespaceName: z.string().optional(),
  sku: z.enum(['basic', 'standard', 'premium']).optional().default('standard'),
  capacity: z.number().min(1).max(40).optional().default(1),
  partitionCount: z.number().min(1).max(32).optional().default(4),
  messageRetentionDays: z.number().min(1).max(7).optional().default(1),
  captureEnabled: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// DATA ANALYTICS CONFIGURATION
// ==========================================
export const bigQueryConfigSchema = z.object({
  datasetId: z.string().optional(),
  location: z.string().optional().default('US'),
  defaultTableExpirationMs: z.number().optional(),
  maxTimeTravelHours: z.number().optional().default(168),
  deleteContentsOnDestroy: z.boolean().optional().default(false),
  labels: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// IDENTITY / AUTH CONFIGURATION
// ==========================================
export const cognitoConfigSchema = z.object({
  userPoolName: z.string().optional(),
  mfa: z.enum(['off', 'on', 'optional']).optional().default('optional'),
  passwordMinLength: z.number().min(6).max(99).optional().default(8),
  passwordRequireLowercase: z.boolean().optional().default(true),
  passwordRequireUppercase: z.boolean().optional().default(true),
  passwordRequireNumbers: z.boolean().optional().default(true),
  passwordRequireSymbols: z.boolean().optional().default(true),
  autoVerifiedAttributes: z.array(z.enum(['email', 'phone_number'])).optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// NETWORK GATEWAY CONFIGURATION
// ==========================================
export const natGatewayConfigSchema = z.object({
  allocationMethod: z.enum(['static', 'dynamic']).optional().default('static'),
  sku: z.enum(['standard']).optional().default('standard'),
  idleTimeoutMinutes: z.number().min(4).max(120).optional().default(4),
  tags: z.record(z.string()).optional(),
})

export const vpnGatewayConfigSchema = z.object({
  type: z.enum(['vpn', 'expressroute']).optional().default('vpn'),
  vpnType: z.enum(['route-based', 'policy-based']).optional().default('route-based'),
  sku: z.string().optional(), // e.g., "VpnGw1", "VpnGw2"
  generation: z.enum(['generation1', 'generation2']).optional(),
  enableBgp: z.boolean().optional().default(false),
  activeActive: z.boolean().optional().default(false),
  tags: z.record(z.string()).optional(),
})

export const routeTableConfigSchema = z.object({
  disableBgpRoutePropagation: z.boolean().optional().default(false),
  routes: z
    .array(
      z.object({
        name: z.string(),
        addressPrefix: z.string(),
        nextHopType: z.enum([
          'internet',
          'virtual-appliance',
          'virtual-network-gateway',
          'vnet-local',
          'none',
        ]),
        nextHopIpAddress: z.string().optional(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

export const internetGatewayConfigSchema = z.object({
  tags: z.record(z.string()).optional(),
})

// ==========================================
// FILE STORAGE CONFIGURATION
// ==========================================
export const efsConfigSchema = z.object({
  performanceMode: z.enum(['generalPurpose', 'maxIO']).optional().default('generalPurpose'),
  throughputMode: z.enum(['bursting', 'provisioned', 'elastic']).optional().default('bursting'),
  encrypted: z.boolean().optional().default(true),
  lifecyclePolicy: z
    .enum(['AFTER_7_DAYS', 'AFTER_14_DAYS', 'AFTER_30_DAYS', 'AFTER_60_DAYS', 'AFTER_90_DAYS'])
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// STEP FUNCTIONS / WORKFLOW CONFIGURATION
// ==========================================
export const stepFunctionsConfigSchema = z.object({
  type: z.enum(['STANDARD', 'EXPRESS']).optional().default('STANDARD'),
  loggingLevel: z.enum(['ALL', 'ERROR', 'FATAL', 'OFF']).optional().default('ALL'),
  tracingEnabled: z.boolean().optional().default(true),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// SERVICE BUS CONFIGURATION
// ==========================================
export const serviceBusConfigSchema = z.object({
  sku: z.enum(['basic', 'standard', 'premium']).optional().default('standard'),
  capacity: z.number().min(1).max(16).optional(),
  zoneRedundant: z.boolean().optional().default(false),
  queues: z
    .array(
      z.object({
        name: z.string(),
        maxSizeInMb: z.number().optional(),
        enablePartitioning: z.boolean().optional(),
        maxDeliveryCount: z.number().optional().default(10),
      })
    )
    .optional(),
  topics: z
    .array(
      z.object({
        name: z.string(),
        maxSizeInMb: z.number().optional(),
        enablePartitioning: z.boolean().optional(),
      })
    )
    .optional(),
  tags: z.record(z.string()).optional(),
})

// ==========================================
// AUTO SCALING CONFIGURATION
// ==========================================
export const autoScalingConfigSchema = z.object({
  minCapacity: z.number().min(0).max(100).optional().default(1),
  maxCapacity: z.number().min(1).max(100).optional().default(4),
  desiredCapacity: z.number().optional(),
  cooldown: z.number().optional().default(300),
  healthCheckType: z.enum(['ec2', 'elb']).optional().default('ec2'),
  healthCheckGracePeriod: z.number().optional().default(300),
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
  // ──────────────────────────────────────────
  // Compute
  // ──────────────────────────────────────────
  'azure-vm': vmConfigSchema,
  'azure-vmss': vmConfigSchema,
  'aws-ec2': vmConfigSchema,
  'gcp-compute-instance': vmConfigSchema,
  'gcp-compute-engine': vmConfigSchema,
  'azure-availability-set': genericConfigSchema,
  'aws-auto-scaling': autoScalingConfigSchema,
  'gcp-instance-group': autoScalingConfigSchema,

  // ──────────────────────────────────────────
  // Networking
  // ──────────────────────────────────────────
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
  'aws-elastic-ip': publicIpConfigSchema,
  'azure-lb': loadBalancerConfigSchema,
  'aws-elb': loadBalancerConfigSchema,
  'aws-alb': loadBalancerConfigSchema,
  'aws-nlb': loadBalancerConfigSchema,
  'gcp-cloud-lb': loadBalancerConfigSchema,
  'azure-nat-gateway': natGatewayConfigSchema,
  'aws-nat-gateway': natGatewayConfigSchema,
  'gcp-cloud-nat': natGatewayConfigSchema,
  'azure-route-table': routeTableConfigSchema,
  'aws-route-table': routeTableConfigSchema,
  'aws-internet-gateway': internetGatewayConfigSchema,
  'azure-vpn-gateway': vpnGatewayConfigSchema,
  'azure-express-route': vpnGatewayConfigSchema,
  'azure-ddos-protection': genericConfigSchema,
  'azure-traffic-manager': dnsConfigSchema,

  // ──────────────────────────────────────────
  // Storage
  // ──────────────────────────────────────────
  'azure-storage-account': storageAccountConfigSchema,
  'azure-blob': s3ConfigSchema,
  'azure-file-share': efsConfigSchema,
  'azure-managed-disk': diskConfigSchema,
  'aws-s3': s3ConfigSchema,
  'aws-ebs': diskConfigSchema,
  'aws-efs': efsConfigSchema,
  'gcp-cloud-storage': s3ConfigSchema,
  'gcp-persistent-disk': diskConfigSchema,

  // ──────────────────────────────────────────
  // Databases
  // ──────────────────────────────────────────
  'azure-sql': sqlServerConfigSchema,
  'azure-cosmos': cosmosDbConfigSchema,
  'aws-rds': sqlServerConfigSchema,
  'gcp-cloud-sql': sqlServerConfigSchema,
  'gcp-bigquery': bigQueryConfigSchema,

  // ──────────────────────────────────────────
  // Cache
  // ──────────────────────────────────────────
  'aws-elasticache': cacheConfigSchema,

  // ──────────────────────────────────────────
  // Containers
  // ──────────────────────────────────────────
  'azure-aks': aksConfigSchema,
  'aws-eks': aksConfigSchema,
  'gcp-gke': aksConfigSchema,
  'aws-ecs': ecsConfigSchema,
  'gcp-cloud-run': cloudRunConfigSchema,

  // ──────────────────────────────────────────
  // PaaS / Serverless
  // ──────────────────────────────────────────
  'azure-app-service': appServiceConfigSchema,
  'azure-functions': functionAppConfigSchema,
  'aws-lambda': functionAppConfigSchema,
  'gcp-cloud-functions': functionAppConfigSchema,
  'aws-step-functions': stepFunctionsConfigSchema,

  // ──────────────────────────────────────────
  // CDN
  // ──────────────────────────────────────────
  'aws-cloudfront': cdnConfigSchema,
  'azure-front-door': cdnConfigSchema,
  'gcp-cloud-cdn': cdnConfigSchema,

  // ──────────────────────────────────────────
  // DNS
  // ──────────────────────────────────────────
  'aws-route53': dnsConfigSchema,

  // ──────────────────────────────────────────
  // Messaging / Event Streaming
  // ──────────────────────────────────────────
  'aws-sqs': queueConfigSchema,
  'aws-sns': notificationConfigSchema,
  'azure-service-bus': serviceBusConfigSchema,
  'azure-event-hub': eventStreamConfigSchema,
  'gcp-pubsub': queueConfigSchema,
  'aws-kinesis': eventStreamConfigSchema,
  'aws-eventbridge': eventStreamConfigSchema,

  // ──────────────────────────────────────────
  // API Gateway
  // ──────────────────────────────────────────
  'aws-api-gateway': apiGatewayConfigSchema,

  // ──────────────────────────────────────────
  // Security / Secrets / Identity
  // ──────────────────────────────────────────
  'azure-key-vault': secretStoreConfigSchema,
  'aws-secrets-manager': secretStoreConfigSchema,
  'aws-cognito': cognitoConfigSchema,
  'azure-ad': genericConfigSchema,
  'azure-bastion': bastionConfigSchema,
  'azure-firewall': firewallConfigSchema,
  'azure-app-gw': appGatewayConfigSchema,

  // ──────────────────────────────────────────
  // CI/CD & DevOps
  // ──────────────────────────────────────────
  'github-actions': githubActionsConfigSchema,
  'gitlab-ci': gitlabCIConfigSchema,
  jenkins: jenkinsConfigSchema,
  argocd: argoCDConfigSchema,
  helm: helmConfigSchema,

  // ──────────────────────────────────────────
  // Monitoring
  // ──────────────────────────────────────────
  prometheus: prometheusConfigSchema,
  datadog: datadogConfigSchema,

  // ──────────────────────────────────────────
  // Messaging (Self-hosted)
  // ──────────────────────────────────────────
  rabbitmq: rabbitmqConfigSchema,
  kafka: kafkaConfigSchema,

  // ──────────────────────────────────────────
  // Firebase
  // ──────────────────────────────────────────
  'gcp-firebase': genericConfigSchema,

  // Default for everything else
  default: genericConfigSchema,
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

// Storage types
export type S3Config = z.infer<typeof s3ConfigSchema>
export type DiskConfig = z.infer<typeof diskConfigSchema>
export type EfsConfig = z.infer<typeof efsConfigSchema>

// Container types
export type EcsConfig = z.infer<typeof ecsConfigSchema>
export type CloudRunConfig = z.infer<typeof cloudRunConfigSchema>

// Network types
export type NatGatewayConfig = z.infer<typeof natGatewayConfigSchema>
export type VpnGatewayConfig = z.infer<typeof vpnGatewayConfigSchema>
export type RouteTableConfig = z.infer<typeof routeTableConfigSchema>
export type FirewallConfig = z.infer<typeof firewallConfigSchema>
export type BastionConfig = z.infer<typeof bastionConfigSchema>
export type AppGatewayConfig = z.infer<typeof appGatewayConfigSchema>

// Messaging types
export type QueueConfig = z.infer<typeof queueConfigSchema>
export type NotificationConfig = z.infer<typeof notificationConfigSchema>
export type ServiceBusConfig = z.infer<typeof serviceBusConfigSchema>
export type EventStreamConfig = z.infer<typeof eventStreamConfigSchema>

// CDN / DNS types
export type CdnConfig = z.infer<typeof cdnConfigSchema>
export type DnsConfig = z.infer<typeof dnsConfigSchema>

// API / Auth types
export type ApiGatewayConfig = z.infer<typeof apiGatewayConfigSchema>
export type SecretStoreConfig = z.infer<typeof secretStoreConfigSchema>
export type CognitoConfig = z.infer<typeof cognitoConfigSchema>

// Cache / Analytics types
export type CacheConfig = z.infer<typeof cacheConfigSchema>
export type BigQueryConfig = z.infer<typeof bigQueryConfigSchema>

// CI/CD types
export type GitHubActionsConfig = z.infer<typeof githubActionsConfigSchema>
export type GitLabCIConfig = z.infer<typeof gitlabCIConfigSchema>
export type JenkinsConfig = z.infer<typeof jenkinsConfigSchema>
export type ArgoCDConfig = z.infer<typeof argoCDConfigSchema>
export type HelmConfig = z.infer<typeof helmConfigSchema>
export type DatadogConfig = z.infer<typeof datadogConfigSchema>
export type PrometheusConfig = z.infer<typeof prometheusConfigSchema>
export type RabbitMQConfig = z.infer<typeof rabbitmqConfigSchema>
export type KafkaConfig = z.infer<typeof kafkaConfigSchema>
export type StepFunctionsConfig = z.infer<typeof stepFunctionsConfigSchema>
export type AutoScalingConfig = z.infer<typeof autoScalingConfigSchema>

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
  | S3Config
  | EcsConfig
  | CloudRunConfig
  | CacheConfig
  | CdnConfig
  | DnsConfig
  | QueueConfig
  | NotificationConfig
  | ApiGatewayConfig
  | SecretStoreConfig
  | AppGatewayConfig
  | BastionConfig
  | FirewallConfig
  | EventStreamConfig
  | BigQueryConfig
  | CognitoConfig
  | ServiceBusConfig
  | GitHubActionsConfig
  | GitLabCIConfig
  | JenkinsConfig
  | ArgoCDConfig
  | HelmConfig
  | DatadogConfig
  | PrometheusConfig
  | RabbitMQConfig
  | KafkaConfig
