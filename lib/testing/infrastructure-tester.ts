import { Node, Edge } from '@xyflow/react'

export interface InfrastructureTest {
  id: string
  name: string
  type: 'connectivity' | 'security' | 'cost' | 'policy' | 'configuration'
  status: 'pass' | 'fail' | 'warning' | 'skipped'
  message: string
  details?: string
  affectedResources?: string[]
}

export async function testDiagram(nodes: Node[], edges: Edge[]): Promise<InfrastructureTest[]> {
  const tests: InfrastructureTest[] = []

  // Run all test categories
  tests.push(...await testConnectivity(nodes, edges))
  tests.push(...await testSecurity(nodes, edges))
  tests.push(...await testCostLimits(nodes, edges))
  tests.push(...await testConfiguration(nodes, edges))

  return tests
}

async function testConnectivity(nodes: Node[], edges: Edge[]): Promise<InfrastructureTest[]> {
  const tests: InfrastructureTest[] = []

  // Test 1: Frontend can reach backend
  const frontendNodes = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return (
      component.includes('frontend') ||
      component.includes('web-app') ||
      component.includes('static-site')
    )
  })

  const backendNodes = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return (
      component.includes('backend') ||
      component.includes('api') ||
      component.includes('function') ||
      component.includes('vm')
    )
  })

  if (frontendNodes.length > 0 && backendNodes.length > 0) {
    const frontendConnected = frontendNodes.some((fe) =>
      edges.some((e) => e.source === fe.id || e.target === fe.id)
    )

    if (!frontendConnected) {
      tests.push({
        id: 'conn-1',
        name: 'Frontend to Backend Connectivity',
        type: 'connectivity',
        status: 'fail',
        message: 'Frontend components have no connection to backend',
        details: 'Users won\'t be able to access APIs or data from the frontend',
        affectedResources: frontendNodes.map((n) => n.id),
      })
    } else {
      tests.push({
        id: 'conn-1',
        name: 'Frontend to Backend Connectivity',
        type: 'connectivity',
        status: 'pass',
        message: 'Frontend is connected to backend services',
      })
    }
  }

  // Test 2: Backend can reach database
  const databases = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('database') || component.includes('sql') || component.includes('postgres')
  })

  if (backendNodes.length > 0 && databases.length > 0) {
    const dbConnected = databases.some((db) =>
      edges.some((e) => e.target === db.id)
    )

    if (!dbConnected) {
      tests.push({
        id: 'conn-2',
        name: 'Backend to Database Connectivity',
        type: 'connectivity',
        status: 'fail',
        message: 'Database has no incoming connections from backend',
        details: 'Backend services cannot access the database',
        affectedResources: databases.map((n) => n.id),
      })
    } else {
      tests.push({
        id: 'conn-2',
        name: 'Backend to Database Connectivity',
        type: 'connectivity',
        status: 'pass',
        message: 'Backend can connect to database',
      })
    }
  }

  // Test 3: Load balancer distributes to VMs
  const loadBalancers = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('lb') || component.includes('load-balancer')
  })

  const vms = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('vm') || component.includes('ec2')
  })

  if (loadBalancers.length > 0 && vms.length > 0) {
    const lbConnected = loadBalancers.some((lb) =>
      edges.some((e) => e.source === lb.id && vms.some((vm) => vm.id === e.target))
    )

    if (!lbConnected) {
      tests.push({
        id: 'conn-3',
        name: 'Load Balancer to VMs',
        type: 'connectivity',
        status: 'fail',
        message: 'Load balancer not connected to any VMs',
        details: 'Traffic won\'t be distributed to backend instances',
        affectedResources: loadBalancers.map((n) => n.id),
      })
    } else {
      tests.push({
        id: 'conn-3',
        name: 'Load Balancer to VMs',
        type: 'connectivity',
        status: 'pass',
        message: 'Load balancer correctly distributes to VMs',
      })
    }
  }

  // Test 4: Orphaned resources (no connections)
  const orphaned = nodes.filter((n) => {
    const hasConnection = edges.some((e) => e.source === n.id || e.target === n.id)
    return !hasConnection && (n.data.componentId || n.data.component) !== 'azure-resource-group'
  })

  if (orphaned.length > 0) {
    tests.push({
      id: 'conn-4',
      name: 'Orphaned Resources',
      type: 'connectivity',
      status: 'warning',
      message: `Found ${orphaned.length} resources with no connections`,
      details: 'These resources may be unused or misconfigured',
      affectedResources: orphaned.map((n) => n.id),
    })
  } else {
    tests.push({
      id: 'conn-4',
      name: 'Orphaned Resources',
      type: 'connectivity',
      status: 'pass',
      message: 'All resources are properly connected',
    })
  }

  return tests
}

async function testSecurity(nodes: Node[], _edges: Edge[]): Promise<InfrastructureTest[]> {
  const tests: InfrastructureTest[] = []

  // Test 1: Storage encryption
  const storageAccounts = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('storage') || component.includes('s3') || component.includes('blob')
  })

  const unencryptedStorage = storageAccounts.filter((s) => {
    const config = s.data.config as any
    return !config?.encryption
  })

  if (unencryptedStorage.length > 0) {
    tests.push({
      id: 'sec-1',
      name: 'Storage Encryption',
      type: 'security',
      status: 'fail',
      message: `${unencryptedStorage.length} storage accounts without encryption`,
      details: 'All storage must have encryption at rest enabled',
      affectedResources: unencryptedStorage.map((n) => n.id),
    })
  } else if (storageAccounts.length > 0) {
    tests.push({
      id: 'sec-1',
      name: 'Storage Encryption',
      type: 'security',
      status: 'pass',
      message: 'All storage accounts have encryption enabled',
    })
  }

  // Test 2: Public database access
  const databases = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const publicDatabases = databases.filter((db) => {
    const config = db.data.config as any
    return config?.publicAccess === true
  })

  if (publicDatabases.length > 0) {
    tests.push({
      id: 'sec-2',
      name: 'Database Public Access',
      type: 'security',
      status: 'fail',
      message: 'Databases are publicly accessible',
      details: 'Databases should use private endpoints only',
      affectedResources: publicDatabases.map((n) => n.id),
    })
  } else if (databases.length > 0) {
    tests.push({
      id: 'sec-2',
      name: 'Database Public Access',
      type: 'security',
      status: 'pass',
      message: 'Databases are not publicly accessible',
    })
  }

  // Test 3: NSG/Security Group presence
  const vms = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('vm') || component.includes('ec2')
  })

  const securityGroups = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('nsg') || component.includes('security-group')
  })

  if (vms.length > 0 && securityGroups.length === 0) {
    tests.push({
      id: 'sec-3',
      name: 'Network Security Groups',
      type: 'security',
      status: 'fail',
      message: 'VMs have no network security groups',
      details: 'All VMs must have NSG/Security Groups configured',
      affectedResources: vms.map((n) => n.id),
    })
  } else if (vms.length > 0) {
    tests.push({
      id: 'sec-3',
      name: 'Network Security Groups',
      type: 'security',
      status: 'pass',
      message: 'Network security controls are in place',
    })
  }

  // Test 4: HTTPS/TLS on load balancers
  const loadBalancers = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('lb') || component.includes('load-balancer')
  })

  const noTLS = loadBalancers.filter((lb) => {
    const config = lb.data.config as any
    return !config?.tls && !config?.https
  })

  if (noTLS.length > 0) {
    tests.push({
      id: 'sec-4',
      name: 'TLS/HTTPS Configuration',
      type: 'security',
      status: 'fail',
      message: 'Load balancers without TLS/HTTPS',
      details: 'All external-facing load balancers must use HTTPS',
      affectedResources: noTLS.map((n) => n.id),
    })
  } else if (loadBalancers.length > 0) {
    tests.push({
      id: 'sec-4',
      name: 'TLS/HTTPS Configuration',
      type: 'security',
      status: 'pass',
      message: 'Load balancers configured with TLS',
    })
  }

  return tests
}

async function testCostLimits(nodes: Node[], _edges: Edge[]): Promise<InfrastructureTest[]> {
  const tests: InfrastructureTest[] = []

  // Calculate estimated monthly cost
  let totalEstimatedCost = 0

  for (const node of nodes) {
    const component = (node.data.componentId || node.data.component) as string
    // Simplified cost estimation - in real implementation, use COMPONENT_CATALOG
    const baseCost = 100 // Default $100/month per resource
    const replicas = (node.data.config as any)?.replicas || 1
    totalEstimatedCost += baseCost * replicas
  }

  // Test 1: Total cost under $10,000/month
  if (totalEstimatedCost > 10000) {
    tests.push({
      id: 'cost-1',
      name: 'Monthly Cost Limit',
      type: 'cost',
      status: 'fail',
      message: `Estimated cost $${totalEstimatedCost.toFixed(2)}/month exceeds $10,000 limit`,
      details: 'Consider right-sizing resources or using reserved instances',
    })
  } else {
    tests.push({
      id: 'cost-1',
      name: 'Monthly Cost Limit',
      type: 'cost',
      status: 'pass',
      message: `Estimated cost $${totalEstimatedCost.toFixed(2)}/month is within budget`,
    })
  }

  // Test 2: Check for oversized VMs
  const vms = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('vm') || component.includes('ec2')
  })

  const oversizedVMs = vms.filter((vm) => {
    const size = (vm.data.config as any)?.size || ''
    return size.includes('64') || size.includes('24xlarge')
  })

  if (oversizedVMs.length > 0) {
    tests.push({
      id: 'cost-2',
      name: 'VM Size Check',
      type: 'cost',
      status: 'warning',
      message: `${oversizedVMs.length} VMs may be oversized`,
      details: 'Large VMs cost $1,000-$5,000/month. Verify they\'re necessary.',
      affectedResources: oversizedVMs.map((n) => n.id),
    })
  } else if (vms.length > 0) {
    tests.push({
      id: 'cost-2',
      name: 'VM Size Check',
      type: 'cost',
      status: 'pass',
      message: 'VM sizes appear appropriate',
    })
  }

  return tests
}

async function testConfiguration(nodes: Node[], _edges: Edge[]): Promise<InfrastructureTest[]> {
  const tests: InfrastructureTest[] = []

  // Test 1: VM replicas for high availability
  const vms = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('vm') || component.includes('ec2')
  })

  const singleVMs = vms.filter((vm) => {
    const replicas = (vm.data.config as any)?.replicas || 1
    return replicas === 1
  })

  if (singleVMs.length > 0) {
    tests.push({
      id: 'config-1',
      name: 'High Availability - VM Replicas',
      type: 'configuration',
      status: 'warning',
      message: `${singleVMs.length} VMs have no redundancy`,
      details: 'Configure at least 2 replicas for production workloads',
      affectedResources: singleVMs.map((n) => n.id),
    })
  } else if (vms.length > 0) {
    tests.push({
      id: 'config-1',
      name: 'High Availability - VM Replicas',
      type: 'configuration',
      status: 'pass',
      message: 'VMs have redundancy configured',
    })
  }

  // Test 2: Database replication
  const databases = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const singleDBs = databases.filter((db) => {
    const config = db.data.config as any
    return !config?.replication && !config?.highAvailability
  })

  if (singleDBs.length > 0) {
    tests.push({
      id: 'config-2',
      name: 'Database Replication',
      type: 'configuration',
      status: 'fail',
      message: `${singleDBs.length} databases without replication`,
      details: 'Enable Multi-AZ or read replicas for disaster recovery',
      affectedResources: singleDBs.map((n) => n.id),
    })
  } else if (databases.length > 0) {
    tests.push({
      id: 'config-2',
      name: 'Database Replication',
      type: 'configuration',
      status: 'pass',
      message: 'Databases configured with replication',
    })
  }

  // Test 3: Backup configuration
  const backups = nodes.filter((n) => {
    const component = String(n.data.componentId || n.data.component || '')
    return component.includes('backup')
  })

  if (databases.length > 0 && backups.length === 0) {
    tests.push({
      id: 'config-3',
      name: 'Backup Configuration',
      type: 'configuration',
      status: 'fail',
      message: 'No backup solution configured',
      details: 'Configure automated backups for all databases',
      affectedResources: databases.map((n) => n.id),
    })
  } else if (databases.length > 0) {
    tests.push({
      id: 'config-3',
      name: 'Backup Configuration',
      type: 'configuration',
      status: 'pass',
      message: 'Backup solution is configured',
    })
  }

  return tests
}

export function getTestSummary(tests: InfrastructureTest[]) {
  const passed = tests.filter((t) => t.status === 'pass').length
  const failed = tests.filter((t) => t.status === 'fail').length
  const warnings = tests.filter((t) => t.status === 'warning').length
  const total = tests.length

  const score = total > 0 ? Math.round((passed / total) * 100) : 0

  return {
    total,
    passed,
    failed,
    warnings,
    score,
    status: failed === 0 ? (warnings === 0 ? 'excellent' : 'good') : 'needs-work',
  }
}
