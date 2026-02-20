import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// DEFAULT TEMPLATES — use real catalog component IDs
// node format: { id, type: 'custom', position, data: { componentId, label, config } }
// ─────────────────────────────────────────────────────────────
const defaultTemplates = [
  {
    id: 'tpl-startup',
    name: 'Startup Stack (AWS)',
    description: 'EC2 + RDS + CloudFront + S3 — battle-tested MVP stack',
    category: 'startup',
    cloud_provider: 'aws',
    data: {
      nodes: [
        { id: 'cdn-1',  type: 'custom', position: { x: 200, y: -50  }, data: { componentId: 'aws-cloudfront',   label: 'CloudFront CDN',   config: {} } },
        { id: 'web-1',  type: 'custom', position: { x: 200, y: 150  }, data: { componentId: 'aws-ec2',          label: 'Web Server',        config: { size: 't3-medium', replicas: 2, osImage: 'ubuntu-22.04' } } },
        { id: 'db-1',   type: 'custom', position: { x: 500, y: 150  }, data: { componentId: 'aws-rds',          label: 'PostgreSQL DB',     config: { sku: 'db.t3.micro', maxSizeGb: 100, backupRetentionDays: 7 } } },
        { id: 's3-1',   type: 'custom', position: { x: 500, y: -50  }, data: { componentId: 'aws-s3',           label: 'Static Assets',    config: { size: 50 } } },
      ],
      edges: [
        { id: 'e1', source: 'cdn-1', target: 'web-1', animated: false },
        { id: 'e2', source: 'cdn-1', target: 's3-1',  animated: false },
        { id: 'e3', source: 'web-1', target: 'db-1',  animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-serverless',
    name: 'Serverless (AWS)',
    description: 'API Gateway + Lambda + DynamoDB + S3 — zero-ops architecture',
    category: 'startup',
    cloud_provider: 'aws',
    data: {
      nodes: [
        { id: 'apigw-1',  type: 'custom', position: { x: 250, y: -50  }, data: { componentId: 'aws-api-gateway', label: 'API Gateway',        config: {} } },
        { id: 'lambda-1', type: 'custom', position: { x: 250, y: 150  }, data: { componentId: 'aws-lambda',       label: 'Lambda Functions',   config: { replicas: 1 } } },
        { id: 'dynamo-1', type: 'custom', position: { x: 500, y: 150  }, data: { componentId: 'aws-dynamodb',     label: 'DynamoDB Table',     config: {} } },
        { id: 's3-1',     type: 'custom', position: { x: 0,   y: 150  }, data: { componentId: 'aws-s3',           label: 'S3 Bucket',          config: { size: 100 } } },
        { id: 'cw-1',     type: 'custom', position: { x: 250, y: 350  }, data: { componentId: 'aws-cloudwatch',   label: 'CloudWatch Logs',    config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'apigw-1',  target: 'lambda-1', animated: true  },
        { id: 'e2', source: 'lambda-1', target: 'dynamo-1', animated: true  },
        { id: 'e3', source: 'lambda-1', target: 's3-1',     animated: false },
        { id: 'e4', source: 'lambda-1', target: 'cw-1',     animated: false },
      ],
    },
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'tpl-microservices',
    name: 'Microservices (AWS EKS)',
    description: 'API Gateway + EKS + ECR + SQS + Redis + RDS — production Kubernetes',
    category: 'microservices',
    cloud_provider: 'aws',
    data: {
      nodes: [
        { id: 'apigw-1', type: 'custom', position: { x: 300, y: -50  }, data: { componentId: 'aws-api-gateway',   label: 'API Gateway',        config: {} } },
        { id: 'eks-1',   type: 'custom', position: { x: 300, y: 150  }, data: { componentId: 'aws-eks',           label: 'EKS Cluster',        config: { replicas: 3 } } },
        { id: 'ecr-1',   type: 'custom', position: { x: 600, y: 50   }, data: { componentId: 'aws-ecr',           label: 'Container Registry', config: {} } },
        { id: 'sqs-1',   type: 'custom', position: { x: 600, y: 250  }, data: { componentId: 'aws-sqs',           label: 'Message Queue (SQS)', config: {} } },
        { id: 'cache-1', type: 'custom', position: { x: 0,   y: 250  }, data: { componentId: 'aws-elasticache',   label: 'Redis Cache',        config: {} } },
        { id: 'rds-1',   type: 'custom', position: { x: 300, y: 350  }, data: { componentId: 'aws-rds',           label: 'Primary DB (RDS)',   config: { sku: 'db.t3.medium', backupRetentionDays: 14 } } },
      ],
      edges: [
        { id: 'e1', source: 'apigw-1', target: 'eks-1',   animated: true  },
        { id: 'e2', source: 'ecr-1',   target: 'eks-1',   animated: false },
        { id: 'e3', source: 'eks-1',   target: 'sqs-1',   animated: true  },
        { id: 'e4', source: 'eks-1',   target: 'cache-1', animated: true  },
        { id: 'e5', source: 'eks-1',   target: 'rds-1',   animated: true  },
      ],
    },
    is_public: true,
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 'tpl-enterprise-aws',
    name: 'Enterprise Multi-Tier (AWS)',
    description: 'ALB + Auto Scaling + Aurora + ElastiCache + CloudWatch — HA production',
    category: 'enterprise',
    cloud_provider: 'aws',
    data: {
      nodes: [
        { id: 'alb-1',     type: 'custom', position: { x: 300, y: 0   }, data: { componentId: 'aws-alb',          label: 'App Load Balancer',   config: {} } },
        { id: 'asg-1',     type: 'custom', position: { x: 100, y: 180 }, data: { componentId: 'aws-auto-scaling', label: 'Web Tier (ASG)',      config: { replicas: 3 } } },
        { id: 'asg-2',     type: 'custom', position: { x: 500, y: 180 }, data: { componentId: 'aws-auto-scaling', label: 'App Tier (ASG)',      config: { replicas: 3 } } },
        { id: 'cache-1',   type: 'custom', position: { x: 100, y: 360 }, data: { componentId: 'aws-elasticache',  label: 'Redis Cluster',       config: {} } },
        { id: 'aurora-1',  type: 'custom', position: { x: 500, y: 360 }, data: { componentId: 'aws-aurora',       label: 'Aurora DB Cluster',   config: { sku: 'db.r5.large', backupRetentionDays: 30 } } },
        { id: 'cw-1',      type: 'custom', position: { x: 300, y: 540 }, data: { componentId: 'aws-cloudwatch',   label: 'CloudWatch Monitor',  config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'alb-1',    target: 'asg-1',    animated: true  },
        { id: 'e2', source: 'alb-1',    target: 'asg-2',    animated: true  },
        { id: 'e3', source: 'asg-1',    target: 'cache-1',  animated: true  },
        { id: 'e4', source: 'asg-2',    target: 'aurora-1', animated: true  },
        { id: 'e5', source: 'asg-1',    target: 'cw-1',     animated: false },
        { id: 'e6', source: 'asg-2',    target: 'cw-1',     animated: false },
      ],
    },
    is_public: true,
    created_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 'tpl-data-pipeline',
    name: 'Data Analytics Pipeline (AWS)',
    description: 'Kinesis → Lambda → S3 → Glue → Redshift — real-time ETL',
    category: 'enterprise',
    cloud_provider: 'aws',
    data: {
      nodes: [
        { id: 'kinesis-1',  type: 'custom', position: { x: 0,   y: 150 }, data: { componentId: 'aws-kinesis',    label: 'Kinesis Stream',    config: {} } },
        { id: 'lambda-1',   type: 'custom', position: { x: 250, y: 150 }, data: { componentId: 'aws-lambda',     label: 'Stream Processor',  config: {} } },
        { id: 's3-1',       type: 'custom', position: { x: 250, y: -50 }, data: { componentId: 'aws-s3',         label: 'Data Lake (S3)',     config: { size: 10000 } } },
        { id: 'glue-1',     type: 'custom', position: { x: 500, y: -50 }, data: { componentId: 'aws-glue',       label: 'Glue ETL Jobs',     config: {} } },
        { id: 'redshift-1', type: 'custom', position: { x: 500, y: 150 }, data: { componentId: 'aws-redshift',   label: 'Redshift DWH',      config: {} } },
        { id: 'cw-1',       type: 'custom', position: { x: 750, y: 150 }, data: { componentId: 'aws-cloudwatch', label: 'Monitoring',        config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'kinesis-1',  target: 'lambda-1',   animated: true  },
        { id: 'e2', source: 'lambda-1',   target: 's3-1',        animated: true  },
        { id: 'e3', source: 's3-1',        target: 'glue-1',      animated: false },
        { id: 'e4', source: 'glue-1',      target: 'redshift-1',  animated: false },
        { id: 'e5', source: 'redshift-1',  target: 'cw-1',        animated: false },
      ],
    },
    is_public: true,
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'tpl-azure-web',
    name: 'Azure Web Application',
    description: 'App Gateway + App Service + SQL + Redis + Key Vault + App Insights',
    category: 'startup',
    cloud_provider: 'azure',
    data: {
      nodes: [
        { id: 'appgw-1', type: 'custom', position: { x: 250, y: -50  }, data: { componentId: 'azure-app-gw',       label: 'Application Gateway', config: {} } },
        { id: 'app-1',   type: 'custom', position: { x: 250, y: 150  }, data: { componentId: 'azure-app-service',  label: 'App Service',         config: { sku: 'S1', runtime: 'node|20-lts', alwaysOn: true } } },
        { id: 'sql-1',   type: 'custom', position: { x: 550, y: 150  }, data: { componentId: 'azure-sql',          label: 'Azure SQL Database',  config: { sku: 'S2', maxSizeGb: 50, backupRetentionDays: 7 } } },
        { id: 'redis-1', type: 'custom', position: { x: -50, y: 150  }, data: { componentId: 'azure-redis',        label: 'Redis Cache',         config: {} } },
        { id: 'kv-1',    type: 'custom', position: { x: 250, y: 350  }, data: { componentId: 'azure-key-vault',    label: 'Key Vault',           config: {} } },
        { id: 'ai-1',    type: 'custom', position: { x: 550, y: 350  }, data: { componentId: 'azure-app-insights', label: 'Application Insights', config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'appgw-1', target: 'app-1',   animated: true  },
        { id: 'e2', source: 'app-1',   target: 'sql-1',   animated: true  },
        { id: 'e3', source: 'app-1',   target: 'redis-1', animated: true  },
        { id: 'e4', source: 'app-1',   target: 'kv-1',    animated: false },
        { id: 'e5', source: 'app-1',   target: 'ai-1',    animated: false },
      ],
    },
    is_public: true,
    created_at: '2024-01-06T00:00:00Z',
  },
  {
    id: 'tpl-azure-aks',
    name: 'Azure Kubernetes (AKS)',
    description: 'App Gateway + AKS + ACR + SQL + Key Vault + App Insights',
    category: 'microservices',
    cloud_provider: 'azure',
    data: {
      nodes: [
        { id: 'appgw-1', type: 'custom', position: { x: 300, y: -50  }, data: { componentId: 'azure-app-gw',       label: 'Application Gateway', config: {} } },
        { id: 'aks-1',   type: 'custom', position: { x: 300, y: 150  }, data: { componentId: 'azure-aks',          label: 'AKS Cluster',         config: { replicas: 3 } } },
        { id: 'acr-1',   type: 'custom', position: { x: 600, y: 50   }, data: { componentId: 'azure-acr',          label: 'Container Registry',  config: {} } },
        { id: 'sql-1',   type: 'custom', position: { x: 600, y: 250  }, data: { componentId: 'azure-sql',          label: 'Azure SQL Database',  config: { sku: 'P1', maxSizeGb: 250 } } },
        { id: 'kv-1',    type: 'custom', position: { x: 0,   y: 150  }, data: { componentId: 'azure-key-vault',    label: 'Key Vault',           config: {} } },
        { id: 'ai-1',    type: 'custom', position: { x: 300, y: 350  }, data: { componentId: 'azure-app-insights', label: 'Application Insights', config: {} } },
      ],
      edges: [
        { id: 'e1', source: 'appgw-1', target: 'aks-1',  animated: true  },
        { id: 'e2', source: 'acr-1',   target: 'aks-1',  animated: false },
        { id: 'e3', source: 'aks-1',   target: 'sql-1',  animated: true  },
        { id: 'e4', source: 'aks-1',   target: 'kv-1',   animated: false },
        { id: 'e5', source: 'aks-1',   target: 'ai-1',   animated: false },
      ],
    },
    is_public: true,
    created_at: '2024-01-07T00:00:00Z',
  },
]

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['startup', 'microservices', 'enterprise', 'side-project', 'other']),
  cloud_provider: z.enum(['aws', 'azure', 'gcp', 'multi-cloud', 'generic']),
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
  is_public: z.boolean().default(false),
  organization_id: z.string().uuid().optional().nullable(),
})

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const cloud_provider = searchParams.get('cloud_provider')

    const filterDefaults = () => {
      let results = defaultTemplates
      if (category) results = results.filter(t => t.category === category)
      if (cloud_provider) results = results.filter(t => t.cloud_provider === cloud_provider)
      return results
    }

    // If no auth/supabase (mock mode), return default templates
    if (!auth?.supabase) {
      log.info('Using default templates (no auth)')
      return NextResponse.json(filterDefaults())
    }

    let query = auth.supabase
      .from('templates')
      .select('id, name, description, category, cloud_provider, nodes, edges, is_public, created_by, organization_id, created_at')
      .eq('is_public', true)

    if (category) query = query.eq('category', category)
    if (cloud_provider) query = query.eq('cloud_provider', cloud_provider)

    const { data: templates, error } = await query.order('created_at', { ascending: false })

    if (error || !templates || templates.length === 0) {
      log.info('Falling back to default templates')
      return NextResponse.json(filterDefaults())
    }

    // Wrap DB rows into expected { data: { nodes, edges } } shape for template-dialog.tsx
    const formattedTemplates = templates.map((t: Record<string, unknown>) => ({
      ...t,
      data: {
        nodes: (t.nodes as unknown[]) || [],
        edges: (t.edges as unknown[]) || [],
      },
    }))

    return NextResponse.json(formattedTemplates)
  },
  { requireAuth: false, method: 'GET' }
)

export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    if (!auth?.supabase || !auth.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = createTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { name, description, category, cloud_provider, nodes, edges, is_public, organization_id } = parsed.data

    const { data: template, error } = await auth.supabase
      .from('templates')
      .insert({
        name,
        description,
        category,
        cloud_provider,
        nodes,
        edges,
        is_public,
        organization_id: organization_id ?? null,
        created_by: auth.user.id,
      })
      .select()
      .single()

    if (error) {
      log.error('[templates POST] insert failed', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ template }, { status: 201 })
  },
  { requireAuth: true, method: 'POST' }
)
