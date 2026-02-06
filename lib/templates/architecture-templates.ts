import { Node, Edge } from '@xyflow/react'

export interface ArchitectureTemplate {
  id: string
  name: string
  description: string
  category: 'web' | 'microservices' | 'data' | 'ml' | 'devops'
  provider: 'aws' | 'azure' | 'gcp' | 'multi-cloud'
  complexity: 'basic' | 'intermediate' | 'advanced'
  estimatedCost: { min: number; max: number }
  tags: string[]
  nodes: Node[]
  edges: Edge[]
  thumbnail?: string
}

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  // ==========================================
  // AWS Templates
  // ==========================================
  {
    id: 'aws-3tier-web',
    name: '3-Tier Web Application',
    description: 'Classic 3-tier architecture with ALB, EC2 Auto Scaling, and RDS',
    category: 'web',
    provider: 'aws',
    complexity: 'intermediate',
    estimatedCost: { min: 150, max: 500 },
    tags: ['web', 'scalable', 'high-availability'],
    nodes: [
      { id: 'vpc', type: 'container', position: { x: 50, y: 50 }, data: { label: 'VPC', componentId: 'aws-vpc' }, style: { width: 800, height: 500 } },
      { id: 'public-subnet', type: 'container', position: { x: 20, y: 60 }, parentId: 'vpc', extent: 'parent', data: { label: 'Public Subnet', componentId: 'aws-subnet' }, style: { width: 250, height: 180 } },
      { id: 'private-subnet-1', type: 'container', position: { x: 290, y: 60 }, parentId: 'vpc', extent: 'parent', data: { label: 'Private Subnet 1', componentId: 'aws-subnet' }, style: { width: 250, height: 180 } },
      { id: 'private-subnet-2', type: 'container', position: { x: 290, y: 280 }, parentId: 'vpc', extent: 'parent', data: { label: 'Private Subnet 2', componentId: 'aws-subnet' }, style: { width: 250, height: 180 } },
      { id: 'alb', type: 'custom', position: { x: 60, y: 40 }, parentId: 'public-subnet', extent: 'parent', data: { label: 'Application LB', componentId: 'aws-alb' } },
      { id: 'ec2-1', type: 'custom', position: { x: 60, y: 40 }, parentId: 'private-subnet-1', extent: 'parent', data: { label: 'Web Server 1', componentId: 'aws-ec2' } },
      { id: 'ec2-2', type: 'custom', position: { x: 60, y: 40 }, parentId: 'private-subnet-2', extent: 'parent', data: { label: 'Web Server 2', componentId: 'aws-ec2' } },
      { id: 'rds', type: 'custom', position: { x: 600, y: 200 }, parentId: 'vpc', extent: 'parent', data: { label: 'RDS PostgreSQL', componentId: 'aws-rds' } },
    ],
    edges: [
      { id: 'e1', source: 'alb', target: 'ec2-1', type: 'smoothstep' },
      { id: 'e2', source: 'alb', target: 'ec2-2', type: 'smoothstep' },
      { id: 'e3', source: 'ec2-1', target: 'rds', type: 'smoothstep' },
      { id: 'e4', source: 'ec2-2', target: 'rds', type: 'smoothstep' },
    ],
  },
  {
    id: 'aws-serverless',
    name: 'Serverless API',
    description: 'API Gateway + Lambda + DynamoDB serverless architecture',
    category: 'web',
    provider: 'aws',
    complexity: 'basic',
    estimatedCost: { min: 5, max: 100 },
    tags: ['serverless', 'api', 'low-cost'],
    nodes: [
      { id: 'apigw', type: 'custom', position: { x: 100, y: 150 }, data: { label: 'API Gateway', componentId: 'aws-api-gateway' } },
      { id: 'lambda', type: 'custom', position: { x: 300, y: 150 }, data: { label: 'Lambda Function', componentId: 'aws-lambda' } },
      { id: 'dynamodb', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'DynamoDB', componentId: 'aws-dynamodb' } },
      { id: 's3', type: 'custom', position: { x: 300, y: 300 }, data: { label: 'S3 Bucket', componentId: 'aws-s3' } },
    ],
    edges: [
      { id: 'e1', source: 'apigw', target: 'lambda', type: 'smoothstep' },
      { id: 'e2', source: 'lambda', target: 'dynamodb', type: 'smoothstep' },
      { id: 'e3', source: 'lambda', target: 's3', type: 'smoothstep' },
    ],
  },
  {
    id: 'aws-microservices',
    name: 'Microservices on EKS',
    description: 'Kubernetes-based microservices with EKS, ECR, and service mesh',
    category: 'microservices',
    provider: 'aws',
    complexity: 'advanced',
    estimatedCost: { min: 300, max: 1500 },
    tags: ['kubernetes', 'microservices', 'containers'],
    nodes: [
      { id: 'vpc', type: 'container', position: { x: 50, y: 50 }, data: { label: 'VPC', componentId: 'aws-vpc' }, style: { width: 700, height: 400 } },
      { id: 'eks', type: 'custom', position: { x: 250, y: 150 }, parentId: 'vpc', extent: 'parent', data: { label: 'EKS Cluster', componentId: 'aws-eks' } },
      { id: 'ecr', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'ECR Registry', componentId: 'aws-ecr' } },
      { id: 'alb', type: 'custom', position: { x: 50, y: 300 }, data: { label: 'ALB Ingress', componentId: 'aws-alb' } },
      { id: 'rds', type: 'custom', position: { x: 450, y: 300 }, parentId: 'vpc', extent: 'parent', data: { label: 'RDS', componentId: 'aws-rds' } },
      { id: 'elasticache', type: 'custom', position: { x: 450, y: 150 }, parentId: 'vpc', extent: 'parent', data: { label: 'ElastiCache', componentId: 'aws-elasticache' } },
    ],
    edges: [
      { id: 'e1', source: 'ecr', target: 'eks', type: 'smoothstep' },
      { id: 'e2', source: 'alb', target: 'eks', type: 'smoothstep' },
      { id: 'e3', source: 'eks', target: 'rds', type: 'smoothstep' },
      { id: 'e4', source: 'eks', target: 'elasticache', type: 'smoothstep' },
    ],
  },

  // ==========================================
  // Azure Templates
  // ==========================================
  {
    id: 'azure-3tier-web',
    name: '3-Tier Web Application',
    description: 'Azure App Service with SQL Database and Redis Cache',
    category: 'web',
    provider: 'azure',
    complexity: 'intermediate',
    estimatedCost: { min: 100, max: 400 },
    tags: ['web', 'paas', 'managed'],
    nodes: [
      { id: 'vnet', type: 'container', position: { x: 50, y: 50 }, data: { label: 'Virtual Network', componentId: 'azure-vnet' }, style: { width: 600, height: 400 } },
      { id: 'subnet-web', type: 'container', position: { x: 20, y: 60 }, parentId: 'vnet', extent: 'parent', data: { label: 'Web Subnet', componentId: 'azure-subnet' }, style: { width: 250, height: 150 } },
      { id: 'subnet-db', type: 'container', position: { x: 300, y: 60 }, parentId: 'vnet', extent: 'parent', data: { label: 'Data Subnet', componentId: 'azure-subnet' }, style: { width: 250, height: 150 } },
      { id: 'appgw', type: 'custom', position: { x: 50, y: 250 }, parentId: 'vnet', extent: 'parent', data: { label: 'App Gateway', componentId: 'azure-app-gw' } },
      { id: 'vm1', type: 'custom', position: { x: 60, y: 40 }, parentId: 'subnet-web', extent: 'parent', data: { label: 'Web VM 1', componentId: 'azure-vm' } },
      { id: 'vm2', type: 'custom', position: { x: 140, y: 40 }, parentId: 'subnet-web', extent: 'parent', data: { label: 'Web VM 2', componentId: 'azure-vm' } },
      { id: 'sql', type: 'custom', position: { x: 60, y: 40 }, parentId: 'subnet-db', extent: 'parent', data: { label: 'SQL Database', componentId: 'azure-sql' } },
      { id: 'redis', type: 'custom', position: { x: 140, y: 40 }, parentId: 'subnet-db', extent: 'parent', data: { label: 'Redis Cache', componentId: 'azure-redis' } },
    ],
    edges: [
      { id: 'e1', source: 'appgw', target: 'vm1', type: 'smoothstep' },
      { id: 'e2', source: 'appgw', target: 'vm2', type: 'smoothstep' },
      { id: 'e3', source: 'vm1', target: 'sql', type: 'smoothstep' },
      { id: 'e4', source: 'vm2', target: 'sql', type: 'smoothstep' },
      { id: 'e5', source: 'vm1', target: 'redis', type: 'smoothstep' },
      { id: 'e6', source: 'vm2', target: 'redis', type: 'smoothstep' },
    ],
  },
  {
    id: 'azure-aks-microservices',
    name: 'AKS Microservices',
    description: 'Azure Kubernetes Service with ACR, Key Vault, and Cosmos DB',
    category: 'microservices',
    provider: 'azure',
    complexity: 'advanced',
    estimatedCost: { min: 250, max: 1200 },
    tags: ['kubernetes', 'microservices', 'azure'],
    nodes: [
      { id: 'vnet', type: 'container', position: { x: 50, y: 50 }, data: { label: 'Virtual Network', componentId: 'azure-vnet' }, style: { width: 500, height: 350 } },
      { id: 'aks', type: 'custom', position: { x: 180, y: 120 }, parentId: 'vnet', extent: 'parent', data: { label: 'AKS Cluster', componentId: 'azure-aks' } },
      { id: 'acr', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Container Registry', componentId: 'azure-acr' } },
      { id: 'keyvault', type: 'custom', position: { x: 50, y: 300 }, data: { label: 'Key Vault', componentId: 'azure-keyvault' } },
      { id: 'cosmosdb', type: 'custom', position: { x: 600, y: 150 }, data: { label: 'Cosmos DB', componentId: 'azure-cosmosdb' } },
      { id: 'appinsights', type: 'custom', position: { x: 600, y: 300 }, data: { label: 'App Insights', componentId: 'azure-app-insights' } },
    ],
    edges: [
      { id: 'e1', source: 'acr', target: 'aks', type: 'smoothstep' },
      { id: 'e2', source: 'keyvault', target: 'aks', type: 'smoothstep' },
      { id: 'e3', source: 'aks', target: 'cosmosdb', type: 'smoothstep' },
      { id: 'e4', source: 'aks', target: 'appinsights', type: 'smoothstep' },
    ],
  },

  // ==========================================
  // GCP Templates
  // ==========================================
  {
    id: 'gcp-serverless',
    name: 'Serverless on GCP',
    description: 'Cloud Run + Cloud Functions + Firestore',
    category: 'web',
    provider: 'gcp',
    complexity: 'basic',
    estimatedCost: { min: 10, max: 150 },
    tags: ['serverless', 'gcp', 'low-cost'],
    nodes: [
      { id: 'lb', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Cloud Load Balancing', componentId: 'gcp-load-balancer' } },
      { id: 'run', type: 'custom', position: { x: 300, y: 100 }, data: { label: 'Cloud Run', componentId: 'gcp-cloud-run' } },
      { id: 'functions', type: 'custom', position: { x: 300, y: 250 }, data: { label: 'Cloud Functions', componentId: 'gcp-cloud-functions' } },
      { id: 'firestore', type: 'custom', position: { x: 500, y: 175 }, data: { label: 'Firestore', componentId: 'gcp-firestore' } },
      { id: 'storage', type: 'custom', position: { x: 500, y: 325 }, data: { label: 'Cloud Storage', componentId: 'gcp-storage' } },
    ],
    edges: [
      { id: 'e1', source: 'lb', target: 'run', type: 'smoothstep' },
      { id: 'e2', source: 'run', target: 'firestore', type: 'smoothstep' },
      { id: 'e3', source: 'run', target: 'functions', type: 'smoothstep' },
      { id: 'e4', source: 'functions', target: 'storage', type: 'smoothstep' },
    ],
  },
  {
    id: 'gcp-gke-ml',
    name: 'ML Platform on GKE',
    description: 'GKE with Vertex AI, BigQuery, and Cloud Storage for ML workloads',
    category: 'ml',
    provider: 'gcp',
    complexity: 'advanced',
    estimatedCost: { min: 500, max: 3000 },
    tags: ['ml', 'kubernetes', 'data'],
    nodes: [
      { id: 'vpc', type: 'container', position: { x: 50, y: 50 }, data: { label: 'VPC Network', componentId: 'gcp-vpc' }, style: { width: 400, height: 300 } },
      { id: 'gke', type: 'custom', position: { x: 150, y: 100 }, parentId: 'vpc', extent: 'parent', data: { label: 'GKE Cluster', componentId: 'gcp-gke' } },
      { id: 'vertexai', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Vertex AI', componentId: 'gcp-vertex-ai' } },
      { id: 'bigquery', type: 'custom', position: { x: 500, y: 250 }, data: { label: 'BigQuery', componentId: 'gcp-bigquery' } },
      { id: 'storage', type: 'custom', position: { x: 300, y: 400 }, data: { label: 'Cloud Storage', componentId: 'gcp-storage' } },
    ],
    edges: [
      { id: 'e1', source: 'gke', target: 'vertexai', type: 'smoothstep' },
      { id: 'e2', source: 'gke', target: 'bigquery', type: 'smoothstep' },
      { id: 'e3', source: 'vertexai', target: 'storage', type: 'smoothstep' },
      { id: 'e4', source: 'bigquery', target: 'storage', type: 'smoothstep' },
    ],
  },

  // ==========================================
  // DevOps Templates
  // ==========================================
  {
    id: 'cicd-github-aws',
    name: 'GitHub Actions CI/CD to AWS',
    description: 'Complete CI/CD pipeline with GitHub Actions deploying to AWS',
    category: 'devops',
    provider: 'aws',
    complexity: 'intermediate',
    estimatedCost: { min: 50, max: 200 },
    tags: ['cicd', 'github', 'devops'],
    nodes: [
      { id: 'github', type: 'custom', position: { x: 100, y: 150 }, data: { label: 'GitHub', componentId: 'github' } },
      { id: 'actions', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'GitHub Actions', componentId: 'github-actions' } },
      { id: 'ecr', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'ECR', componentId: 'aws-ecr' } },
      { id: 'ecs', type: 'custom', position: { x: 550, y: 150 }, data: { label: 'ECS Fargate', componentId: 'aws-ecs' } },
      { id: 's3', type: 'custom', position: { x: 400, y: 250 }, data: { label: 'S3 Artifacts', componentId: 'aws-s3' } },
    ],
    edges: [
      { id: 'e1', source: 'github', target: 'actions', type: 'smoothstep' },
      { id: 'e2', source: 'actions', target: 'ecr', type: 'smoothstep' },
      { id: 'e3', source: 'actions', target: 's3', type: 'smoothstep' },
      { id: 'e4', source: 'ecr', target: 'ecs', type: 'smoothstep' },
    ],
  },
]

export function getTemplateById(id: string): ArchitectureTemplate | undefined {
  return ARCHITECTURE_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByProvider(provider: string): ArchitectureTemplate[] {
  return ARCHITECTURE_TEMPLATES.filter(t => t.provider === provider || t.provider === 'multi-cloud')
}

export function getTemplatesByCategory(category: string): ArchitectureTemplate[] {
  return ARCHITECTURE_TEMPLATES.filter(t => t.category === category)
}

export function searchTemplates(query: string): ArchitectureTemplate[] {
  const q = query.toLowerCase()
  return ARCHITECTURE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  )
}
