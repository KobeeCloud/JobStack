import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { log } from '@/lib/logger'

// Default templates for when database is empty or in mock mode
const defaultTemplates = [
  {
    id: 'tpl-startup',
    name: 'Startup Stack',
    description: 'Simple web app with database and CDN - perfect for MVPs',
    category: 'startup',
    data: {
      nodes: [
        { id: 'web-1', type: 'compute', position: { x: 250, y: 100 }, data: { label: 'Web Server', provider: 'aws', service: 'EC2', specs: { instance: 't3.medium' }, monthlyCost: 30 } },
        { id: 'db-1', type: 'database', position: { x: 450, y: 100 }, data: { label: 'PostgreSQL', provider: 'aws', service: 'RDS', specs: { instance: 'db.t3.micro' }, monthlyCost: 15 } },
        { id: 'cdn-1', type: 'network', position: { x: 250, y: 250 }, data: { label: 'CloudFront CDN', provider: 'aws', service: 'CloudFront', monthlyCost: 10 } },
      ],
      edges: [
        { id: 'e1', source: 'web-1', target: 'db-1', animated: true },
        { id: 'e2', source: 'cdn-1', target: 'web-1', animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-microservices',
    name: 'Microservices Architecture',
    description: 'Kubernetes cluster with API Gateway and message queue',
    category: 'microservices',
    data: {
      nodes: [
        { id: 'k8s-1', type: 'compute', position: { x: 300, y: 200 }, data: { label: 'Kubernetes Cluster', provider: 'aws', service: 'EKS', specs: { nodes: 3 }, monthlyCost: 150 } },
        { id: 'api-1', type: 'network', position: { x: 300, y: 50 }, data: { label: 'API Gateway', provider: 'aws', service: 'API Gateway', monthlyCost: 25 } },
        { id: 'mq-1', type: 'storage', position: { x: 500, y: 200 }, data: { label: 'Message Queue', provider: 'aws', service: 'SQS', monthlyCost: 5 } },
        { id: 'cache-1', type: 'database', position: { x: 100, y: 200 }, data: { label: 'Redis Cache', provider: 'aws', service: 'ElastiCache', monthlyCost: 20 } },
      ],
      edges: [
        { id: 'e1', source: 'api-1', target: 'k8s-1', animated: true },
        { id: 'e2', source: 'k8s-1', target: 'mq-1', animated: true },
        { id: 'e3', source: 'k8s-1', target: 'cache-1', animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'tpl-serverless',
    name: 'Serverless Application',
    description: 'Lambda functions with DynamoDB and S3 - zero server management',
    category: 'startup',
    data: {
      nodes: [
        { id: 'lambda-1', type: 'compute', position: { x: 250, y: 150 }, data: { label: 'Lambda Functions', provider: 'aws', service: 'Lambda', monthlyCost: 0 } },
        { id: 'dynamo-1', type: 'database', position: { x: 450, y: 150 }, data: { label: 'DynamoDB', provider: 'aws', service: 'DynamoDB', monthlyCost: 5 } },
        { id: 's3-1', type: 'storage', position: { x: 250, y: 300 }, data: { label: 'S3 Bucket', provider: 'aws', service: 'S3', monthlyCost: 3 } },
        { id: 'apigw-1', type: 'network', position: { x: 250, y: 0 }, data: { label: 'API Gateway', provider: 'aws', service: 'API Gateway', monthlyCost: 10 } },
      ],
      edges: [
        { id: 'e1', source: 'apigw-1', target: 'lambda-1', animated: true },
        { id: 'e2', source: 'lambda-1', target: 'dynamo-1', animated: true },
        { id: 'e3', source: 'lambda-1', target: 's3-1', animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 'tpl-enterprise',
    name: 'Enterprise Multi-Tier',
    description: 'Load balanced application with caching, database clusters, and monitoring',
    category: 'enterprise',
    data: {
      nodes: [
        { id: 'lb-1', type: 'network', position: { x: 300, y: 0 }, data: { label: 'Load Balancer', provider: 'aws', service: 'ALB', monthlyCost: 20 } },
        { id: 'web-1', type: 'compute', position: { x: 150, y: 120 }, data: { label: 'Web Tier (ASG)', provider: 'aws', service: 'EC2', specs: { instance: 't3.large', count: 3 }, monthlyCost: 180 } },
        { id: 'web-2', type: 'compute', position: { x: 450, y: 120 }, data: { label: 'App Tier (ASG)', provider: 'aws', service: 'EC2', specs: { instance: 't3.large', count: 3 }, monthlyCost: 180 } },
        { id: 'cache-1', type: 'database', position: { x: 150, y: 250 }, data: { label: 'Redis Cluster', provider: 'aws', service: 'ElastiCache', monthlyCost: 80 } },
        { id: 'db-1', type: 'database', position: { x: 450, y: 250 }, data: { label: 'Aurora Cluster', provider: 'aws', service: 'Aurora', specs: { instance: 'db.r5.large', replicas: 2 }, monthlyCost: 400 } },
        { id: 'monitor-1', type: 'network', position: { x: 300, y: 380 }, data: { label: 'CloudWatch', provider: 'aws', service: 'CloudWatch', monthlyCost: 30 } },
      ],
      edges: [
        { id: 'e1', source: 'lb-1', target: 'web-1', animated: true },
        { id: 'e2', source: 'lb-1', target: 'web-2', animated: true },
        { id: 'e3', source: 'web-1', target: 'cache-1', animated: true },
        { id: 'e4', source: 'web-2', target: 'db-1', animated: true },
        { id: 'e5', source: 'web-1', target: 'monitor-1' },
        { id: 'e6', source: 'web-2', target: 'monitor-1' },
      ],
    },
    is_public: true,
    created_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 'tpl-data-pipeline',
    name: 'Data Analytics Pipeline',
    description: 'ETL pipeline with streaming, data warehouse, and BI tools',
    category: 'enterprise',
    data: {
      nodes: [
        { id: 'kinesis-1', type: 'storage', position: { x: 100, y: 150 }, data: { label: 'Kinesis Stream', provider: 'aws', service: 'Kinesis', monthlyCost: 25 } },
        { id: 'glue-1', type: 'compute', position: { x: 300, y: 150 }, data: { label: 'Glue ETL', provider: 'aws', service: 'Glue', monthlyCost: 50 } },
        { id: 'redshift-1', type: 'database', position: { x: 500, y: 150 }, data: { label: 'Redshift', provider: 'aws', service: 'Redshift', specs: { nodes: 2 }, monthlyCost: 180 } },
        { id: 'quicksight-1', type: 'network', position: { x: 500, y: 300 }, data: { label: 'QuickSight', provider: 'aws', service: 'QuickSight', monthlyCost: 24 } },
        { id: 's3-1', type: 'storage', position: { x: 300, y: 300 }, data: { label: 'S3 Data Lake', provider: 'aws', service: 'S3', monthlyCost: 50 } },
      ],
      edges: [
        { id: 'e1', source: 'kinesis-1', target: 'glue-1', animated: true },
        { id: 'e2', source: 'glue-1', target: 'redshift-1', animated: true },
        { id: 'e3', source: 'glue-1', target: 's3-1', animated: true },
        { id: 'e4', source: 'redshift-1', target: 'quicksight-1', animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'tpl-side-project',
    name: 'Side Project Starter',
    description: 'Minimal setup for hobby projects - Vercel + Supabase',
    category: 'side-project',
    data: {
      nodes: [
        { id: 'vercel-1', type: 'compute', position: { x: 200, y: 100 }, data: { label: 'Vercel', provider: 'vercel', service: 'Serverless', monthlyCost: 0 } },
        { id: 'supabase-1', type: 'database', position: { x: 400, y: 100 }, data: { label: 'Supabase', provider: 'supabase', service: 'PostgreSQL + Auth', monthlyCost: 0 } },
        { id: 'storage-1', type: 'storage', position: { x: 400, y: 250 }, data: { label: 'Supabase Storage', provider: 'supabase', service: 'Object Storage', monthlyCost: 0 } },
      ],
      edges: [
        { id: 'e1', source: 'vercel-1', target: 'supabase-1', animated: true },
        { id: 'e2', source: 'vercel-1', target: 'storage-1', animated: true },
      ],
    },
    is_public: true,
    created_at: '2024-01-06T00:00:00Z',
  },
]

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // If no auth/supabase (mock mode or not logged in), return default templates
    if (!auth?.supabase) {
      log.info('Using default templates (no auth)')
      const filteredDefaults = category
        ? defaultTemplates.filter(t => t.category === category)
        : defaultTemplates
      return NextResponse.json(filteredDefaults)
    }

    let query = auth.supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false })

    // If no templates from database or error, return default templates
    if (error || !templates || templates.length === 0) {
      log.info('Using default templates')

      // Transform database format to expected frontend format
      const filteredDefaults = category
        ? defaultTemplates.filter(t => t.category === category)
        : defaultTemplates

      return NextResponse.json(filteredDefaults)
    }

    // Transform diagram_data to data if needed for consistency
    const formattedTemplates = templates.map((t: Record<string, any>) => ({
      ...t,
      data: t.data || t.diagram_data || { nodes: [], edges: [] }
    }))

    return NextResponse.json(formattedTemplates)
  },
  { requireAuth: false, method: 'GET' }
)
