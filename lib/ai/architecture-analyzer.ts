import { Node, Edge } from '@xyflow/react'
import { chatWithAI } from './openai-client'
import { log } from '../logger'

export interface ArchitectureIssue {
  type: 'security' | 'cost' | 'performance' | 'reliability'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  affectedNodes: string[]
  suggestedFix?: string
  autoFixable?: boolean
}

export async function analyzeArchitecture(
  nodes: Node[],
  edges: Edge[]
): Promise<ArchitectureIssue[]> {
  const issues: ArchitectureIssue[] = []

  log.info('Starting architecture analysis', { nodeCount: nodes.length, edgeCount: edges.length })

  // Rule-based checks (fast, deterministic)
  issues.push(...checkSecurityBestPractices(nodes, edges))
  issues.push(...checkCostOptimization(nodes))
  issues.push(...checkReliability(nodes, edges))
  issues.push(...checkPerformance(nodes, edges))

  // AI-powered deep analysis
  try {
    const aiIssues = await getAIRecommendations(nodes, edges)
    if (aiIssues) {
      issues.push(...aiIssues)
    }
  } catch (error) {
    log.error('AI analysis failed:', error)
  }

  return issues
}

function checkSecurityBestPractices(nodes: Node[], edges: Edge[]): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = []

  // Check 1: Databases without encryption
  const databases = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('database') ||
      String(n.data.component || '').includes('sql') ||
      String(n.data.component || '').includes('postgres') ||
      String(n.data.component || '').includes('mysql')
  )
  const backupNodes = nodes.filter(
    (n) => String(n.data.component || '').includes('backup') || String(n.data.component || '').includes('vault')
  )

  if (databases.length > 0 && backupNodes.length === 0) {
    issues.push({
      type: 'reliability',
      severity: 'critical',
      title: 'No Backup Solution Configured',
      description:
        'Your databases have no backup solution. This poses a critical risk for data loss in case of failure, corruption, or accidental deletion.',
      affectedNodes: databases.map((d) => d.id),
      suggestedFix:
        'Add Azure Backup, AWS Backup, or GCP Backup component and configure automated daily backups with at least 7-day retention.',
      autoFixable: false,
    })
  }

  // Check 2: VMs without Network Security Groups
  const vms = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('vm') ||
      String(n.data.component || '').includes('ec2') ||
      String(n.data.component || '').includes('compute')
  )
  const nsgs = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('nsg') ||
      String(n.data.component || '').includes('security-group') ||
      String(n.data.component || '').includes('firewall')
  )

  if (vms.length > 0 && nsgs.length === 0) {
    issues.push({
      type: 'security',
      severity: 'critical',
      title: 'VMs Without Network Security',
      description:
        'Your virtual machines are deployed without Network Security Groups (NSGs) or Security Groups. All ports are potentially exposed to the internet.',
      affectedNodes: vms.map((v) => v.id),
      suggestedFix:
        'Add NSG/Security Group components and configure inbound rules to allow only necessary traffic (e.g., HTTPS 443, SSH 22 from trusted IPs).',
      autoFixable: false,
    })
  }

  // Check 3: Public database access
  const publicDatabases = databases.filter((db) => {
    const config = db.data.config as any
    return config?.publicAccess === true || config?.allowPublicAccess === true
  })

  if (publicDatabases.length > 0) {
    issues.push({
      type: 'security',
      severity: 'critical',
      title: 'Database Publicly Accessible',
      description:
        'One or more databases are configured to be accessible from the internet. This is a major security risk and violates security best practices.',
      affectedNodes: publicDatabases.map((d) => d.id),
      suggestedFix:
        'Disable public access immediately. Use Private Link (Azure), VPC Peering (AWS), or Private Service Connect (GCP) for secure database connectivity.',
      autoFixable: true,
    })
  }

  // Check 4: Unencrypted storage
  const storageAccounts = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('storage') ||
      String(n.data.component || '').includes('s3') ||
      String(n.data.component || '').includes('blob')
  )
  const unencrypted = storageAccounts.filter((s) => {
    const config = s.data.config as any
    return !config?.encryption || config?.encryption === false
  })

  if (unencrypted.length > 0) {
    issues.push({
      type: 'security',
      severity: 'warning',
      title: 'Unencrypted Storage',
      description:
        'Storage accounts without encryption at rest expose data to unauthorized access if physical media is compromised.',
      affectedNodes: unencrypted.map((s) => s.id),
      suggestedFix:
        'Enable encryption at rest using platform-managed keys (or customer-managed keys for higher security).',
      autoFixable: true,
    })
  }

  // Check 5: Missing HTTPS/TLS
  const loadBalancers = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('lb') ||
      String(n.data.component || '').includes('load-balancer') ||
      String(n.data.component || '').includes('application-gateway')
  )
  const noTLS = loadBalancers.filter((lb) => {
    const config = lb.data.config as any
    return !config?.tls && !config?.https && !config?.ssl
  })

  if (noTLS.length > 0) {
    issues.push({
      type: 'security',
      severity: 'warning',
      title: 'Load Balancers Without TLS/HTTPS',
      description:
        'Load balancers configured without HTTPS/TLS expose traffic to man-in-the-middle attacks and data interception.',
      affectedNodes: noTLS.map((lb) => lb.id),
      suggestedFix:
        'Configure TLS/SSL certificates and redirect HTTP traffic to HTTPS. Use managed certificates for automatic renewal.',
      autoFixable: false,
    })
  }

  return issues
}

function checkCostOptimization(nodes: Node[]): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = []

  // Check 1: Oversized VMs
  const vms = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('vm') ||
      String(n.data.component || '').includes('ec2') ||
      String(n.data.component || '').includes('compute')
  )
  const oversized = vms.filter((vm) => {
    const size = (String((vm.data.config as any)?.size || '') as string) || ''
    return (
      size.includes('Standard_D64') ||
      size.includes('Standard_E64') ||
      size.includes('m5.24xlarge') ||
      size.includes('m6i.32xlarge') ||
      size.includes('n2-highmem-96')
    )
  })

  if (oversized.length > 0) {
    issues.push({
      type: 'cost',
      severity: 'warning',
      title: 'Potentially Oversized Virtual Machines',
      description:
        'You have very large VM instances that may be overprovisioned. These can cost $1,000-$5,000/month per instance.',
      affectedNodes: oversized.map((v) => v.id),
      suggestedFix:
        'Start with smaller instances (e.g., Standard_D4, m5.xlarge) and scale up based on actual CPU/memory usage metrics. Consider auto-scaling groups.',
      autoFixable: false,
    })
  }

  // Check 2: No reserved instances for production
  const prodVMs = vms.filter((vm) => {
    const tags = ((vm.data.config as any)?.tags as Record<string, string>) || {}
    return tags.environment === 'production' || tags.env === 'prod'
  })

  if (prodVMs.length >= 2) {
    issues.push({
      type: 'cost',
      severity: 'info',
      title: 'Consider Reserved Instances',
      description:
        'You have multiple production VMs running 24/7. Reserved Instances or Savings Plans can reduce costs by 30-60% compared to on-demand pricing.',
      affectedNodes: prodVMs.map((v) => v.id),
      suggestedFix:
        'Purchase 1-year or 3-year reserved instances/savings plans for stable production workloads. Use spot instances for non-critical workloads.',
      autoFixable: false,
    })
  }

  // Check 3: Idle resources
  const allCompute = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('vm') ||
      String(n.data.component || '').includes('ec2') ||
      String(n.data.component || '').includes('function') ||
      String(n.data.component || '').includes('container')
  )

  // Check for resources with no incoming connections (potentially idle)
  const idleResources = allCompute.filter((resource) => {
    const hasIncomingEdge = nodes.some(
      (edge) => (edge as any).target === resource.id || (edge as any).source === resource.id
    )
    return !hasIncomingEdge
  })

  if (idleResources.length > 0) {
    issues.push({
      type: 'cost',
      severity: 'info',
      title: 'Potentially Idle Resources',
      description:
        'Some compute resources have no connections in your diagram. Verify they are actually used in production.',
      affectedNodes: idleResources.map((r) => r.id),
      suggestedFix:
        'Review resource utilization metrics. Shut down or delete resources with <5% CPU utilization.',
      autoFixable: false,
    })
  }

  // Check 4: Premium storage for non-critical workloads
  const storageAccounts = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('storage') ||
      String(n.data.component || '').includes('disk') ||
      String(n.data.component || '').includes('s3')
  )
  const premiumStorage = storageAccounts.filter((s) => {
    const config = s.data.config as any
    const diskType = config?.diskType || config?.storageClass || ''
    return (
      diskType.includes('premium') ||
      diskType.includes('Premium') ||
      diskType === 'STANDARD_IA' ||
      diskType === 'GLACIER'
    )
  })

  if (premiumStorage.length > 0) {
    issues.push({
      type: 'cost',
      severity: 'info',
      title: 'Premium Storage Usage',
      description:
        'Premium storage is 3-10x more expensive than standard storage. Verify if high IOPS is truly needed.',
      affectedNodes: premiumStorage.map((s) => s.id),
      suggestedFix:
        'Use Standard SSD for most workloads. Reserve Premium SSD only for database servers and high-performance applications.',
      autoFixable: false,
    })
  }

  return issues
}

function checkReliability(nodes: Node[], edges: Edge[]): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = []

  // Check 1: Single points of failure
  const vms = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('vm') ||
      String(n.data.component || '').includes('ec2') ||
      String(n.data.component || '').includes('compute')
  )
  const singleVMs = vms.filter((vm) => {
    const replicas = (Number((vm.data.config as any)?.replicas || 1) as number) || 1
    return replicas === 1
  })

  if (singleVMs.length > 0) {
    issues.push({
      type: 'reliability',
      severity: 'warning',
      title: 'Single Points of Failure',
      description:
        'Some VMs have no redundancy. If they fail, your application will be unavailable until recovery.',
      affectedNodes: singleVMs.map((v) => v.id),
      suggestedFix:
        'Deploy at least 2 replicas across different availability zones. Add a load balancer to distribute traffic.',
      autoFixable: false,
    })
  }

  // Check 2: No load balancer for multi-VM setup
  const multiVMs = vms.filter((vm) => {
    const replicas = (Number((vm.data.config as any)?.replicas || 1) as number) || 1
    return replicas > 1
  })

  const loadBalancers = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('lb') ||
      String(n.data.component || '').includes('load-balancer') ||
      String(n.data.component || '').includes('application-gateway')
  )

  if (multiVMs.length > 0 && loadBalancers.length === 0) {
    issues.push({
      type: 'reliability',
      severity: 'warning',
      title: 'Missing Load Balancer',
      description:
        'You have multiple VM replicas but no load balancer. Traffic won\'t be distributed automatically.',
      affectedNodes: multiVMs.map((v) => v.id),
      suggestedFix:
        'Add Azure Load Balancer, AWS ALB/NLB, or GCP Load Balancer to distribute traffic across replicas.',
      autoFixable: false,
    })
  }

  // Check 3: No health checks configured
  if (loadBalancers.length > 0) {
    const noHealthChecks = loadBalancers.filter((lb) => {
      const config = lb.data.config as any
      return !config?.healthCheck && !config?.healthProbe
    })

    if (noHealthChecks.length > 0) {
      issues.push({
        type: 'reliability',
        severity: 'warning',
        title: 'Load Balancers Without Health Checks',
        description:
          'Load balancers without health checks will continue routing traffic to failed instances.',
        affectedNodes: noHealthChecks.map((lb) => lb.id),
        suggestedFix:
          'Configure HTTP/TCP health checks with appropriate interval (e.g., every 30s) and thresholds.',
        autoFixable: false,
      })
    }
  }

  // Check 4: Single database instance
  const databases = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('database') ||
      String(n.data.component || '').includes('sql') ||
      String(n.data.component || '').includes('postgres') ||
      String(n.data.component || '').includes('mysql')
  )

  const singleDBs = databases.filter((db) => {
    const config = db.data.config as any
    return !config?.replication && !config?.replicas && !config?.highAvailability
  })

  if (singleDBs.length > 0) {
    issues.push({
      type: 'reliability',
      severity: 'critical',
      title: 'Single Database Instance',
      description:
        'Databases without replication are single points of failure. Hardware failure will cause complete data unavailability.',
      affectedNodes: singleDBs.map((db) => db.id),
      suggestedFix:
        'Enable High Availability mode, Multi-AZ deployment, or configure read replicas in different regions.',
      autoFixable: false,
    })
  }

  return issues
}

function checkPerformance(nodes: Node[], edges: Edge[]): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = []

  // Check 1: No CDN for static content
  const storageAccounts = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('storage') ||
      String(n.data.component || '').includes('blob') ||
      String(n.data.component || '').includes('s3')
  )
  const cdns = nodes.filter(
    (n) => String(n.data.component || '').includes('cdn') || String(n.data.component || '').includes('cloudfront')
  )

  if (storageAccounts.length > 0 && cdns.length === 0) {
    issues.push({
      type: 'performance',
      severity: 'info',
      title: 'Consider CDN for Static Content',
      description:
        'Serving static content directly from storage can be slow for global users. CDN caches content at edge locations.',
      affectedNodes: storageAccounts.map((s) => s.id),
      suggestedFix:
        'Add Azure CDN, Amazon CloudFront, or Cloudflare CDN to cache and serve static assets globally.',
      autoFixable: false,
    })
  }

  // Check 2: No caching layer
  const databases = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('database') ||
      String(n.data.component || '').includes('sql') ||
      String(n.data.component || '').includes('postgres')
  )
  const caches = nodes.filter(
    (n) =>
      String(n.data.component || '').includes('redis') ||
      String(n.data.component || '').includes('memcached') ||
      String(n.data.component || '').includes('cache')
  )

  if (databases.length > 0 && caches.length === 0) {
    issues.push({
      type: 'performance',
      severity: 'info',
      title: 'No Caching Layer',
      description:
        'Database queries can be slow and expensive. Adding a caching layer (Redis/Memcached) can reduce latency by 10-100x.',
      affectedNodes: databases.map((db) => db.id),
      suggestedFix:
        'Add Redis or Memcached to cache frequently accessed data, session state, or query results.',
      autoFixable: false,
    })
  }

  // Check 3: Cross-region latency
  const allResources = nodes.filter((n) => n.data.config)
  const regions = new Set(
    allResources.map((r) => (r.data.config as any)?.region || '').filter((r) => r)
  )

  if (regions.size > 2) {
    issues.push({
      type: 'performance',
      severity: 'info',
      title: 'Multi-Region Architecture',
      description:
        `Resources are spread across ${regions.size} regions. Cross-region traffic adds 50-300ms latency and data transfer costs.`,
      affectedNodes: [],
      suggestedFix:
        'Group frequently communicating resources in the same region. Use ExpressRoute/Direct Connect for high-bandwidth cross-region needs.',
      autoFixable: false,
    })
  }

  return issues
}

async function getAIRecommendations(
  nodes: Node[],
  edges: Edge[]
): Promise<ArchitectureIssue[]> {
  // Prepare simplified diagram for AI
  const diagramDescription = {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.component,
      label: n.data.label,
      config: n.data.config,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
    })),
    summary: {
      totalNodes: nodes.length,
      vmCount: nodes.filter((n) => String(n.data.component || '').includes('vm')).length,
      dbCount: nodes.filter((n) => String(n.data.component || '').includes('database')).length,
      lbCount: nodes.filter((n) => String(n.data.component || '').includes('lb')).length,
    },
  }

  const prompt = `Analyze this cloud architecture and provide detailed security, cost, and reliability recommendations.

Architecture:
${JSON.stringify(diagramDescription, null, 2)}

Return a JSON array of issues with this EXACT structure (valid JSON only, no markdown):
[
  {
    "type": "security" | "cost" | "performance" | "reliability",
    "severity": "critical" | "warning" | "info",
    "title": "Short title (max 50 chars)",
    "description": "Detailed description (max 200 chars)",
    "affectedNodes": ["node-id-1"],
    "suggestedFix": "Actionable fix (max 150 chars)"
  }
]

Focus on:
1. Security vulnerabilities (missing encryption, public access, weak authentication)
2. Cost optimization (overprovisioned resources, missing reserved instances)
3. Reliability issues (single points of failure, missing backups, no redundancy)
4. Performance bottlenecks (missing caching, suboptimal database configuration)

Provide 3-5 most important issues. Be specific and actionable.`

  try {
    const response = await chatWithAI(
      [
        {
          role: 'system',
          content:
            'You are a senior cloud architect specializing in AWS, Azure, and GCP. Always return valid JSON arrays.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.5, maxTokens: 1500 }
    )

    if (!response) {
      log.warn('AI analysis returned no response')
      return []
    }

    // Extract JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      log.info('AI analysis completed', { issueCount: parsed.length })
      return parsed
    }

    log.warn('No JSON array found in AI response')
    return []
  } catch (error) {
    log.error('Failed to get AI recommendations:', error)
    return []
  }
}

export async function getOptimizationSuggestions(
  nodes: Node[],
  edges: Edge[],
  targetMetric: 'cost' | 'performance' | 'reliability'
): Promise<string[]> {
  const prompt = `Given this cloud architecture, suggest 5 specific ways to improve ${targetMetric}.

Architecture: ${nodes.length} nodes, ${edges.length} connections

Components:
${nodes.map((n) => `- ${n.data.label || n.data.component}`).join('\n')}

Provide 5 actionable recommendations as a JSON array of strings.`

  try {
    const response = await chatWithAI([
      { role: 'system', content: 'You are a cloud optimization expert.' },
      { role: 'user', content: prompt },
    ])

    if (!response) return []

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return []
  } catch (error) {
    log.error('Failed to get optimization suggestions:', error)
    return []
  }
}
