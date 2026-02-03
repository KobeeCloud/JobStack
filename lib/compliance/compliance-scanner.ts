import { Node, Edge } from '@xyflow/react'

export interface ComplianceFinding {
  id: string
  ruleId: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  affectedResources: string[]
  remediation: string
  references: string[]
}

export interface ComplianceReport {
  framework: 'CIS' | 'GDPR' | 'SOC2' | 'PCI-DSS' | 'HIPAA'
  score: number // 0-100
  findings: ComplianceFinding[]
  passedChecks: number
  totalChecks: number
  timestamp: string
}

export async function runComplianceScan(
  nodes: Node[],
  edges: Edge[],
  framework: ComplianceReport['framework']
): Promise<ComplianceReport> {
  let findings: ComplianceFinding[] = []

  switch (framework) {
    case 'CIS':
      findings = await runCISBenchmarkScan(nodes, edges)
      break
    case 'GDPR':
      findings = await runGDPRScan(nodes, edges)
      break
    case 'SOC2':
      findings = await runSOC2Scan(nodes, edges)
      break
    case 'PCI-DSS':
      findings = await runPCIDSSScan(nodes, edges)
      break
    case 'HIPAA':
      findings = await runHIPAAScan(nodes, edges)
      break
  }

  const totalChecks = getTotalCheckCount(framework)
  const failedChecks = findings.length
  const passedChecks = totalChecks - failedChecks
  const score = Math.round((passedChecks / totalChecks) * 100)

  return {
    framework,
    score,
    findings,
    passedChecks,
    totalChecks,
    timestamp: new Date().toISOString(),
  }
}

function getTotalCheckCount(framework: ComplianceReport['framework']): number {
  const counts = {
    CIS: 25,
    GDPR: 15,
    SOC2: 20,
    'PCI-DSS': 30,
    HIPAA: 18,
  }
  return counts[framework] || 20
}

async function runCISBenchmarkScan(nodes: Node[], _edges: Edge[]): Promise<ComplianceFinding[]> {
  const findings: ComplianceFinding[] = []

  // CIS 1.1: Ensure encryption at rest is enabled
  const unencryptedStorage = nodes.filter((n) => {
    const component = String(n.data.component || '')
    const isStorage =
      component.includes('storage') ||
      component.includes('s3') ||
      component.includes('blob') ||
      component.includes('disk')
    if (!isStorage) return false

    const config = n.data.config as any
    return !config?.encryption || config?.encryption === false
  })

  if (unencryptedStorage.length > 0) {
    findings.push({
      id: 'cis-1.1',
      ruleId: 'CIS-1.1',
      severity: 'high',
      title: 'Encryption at rest not enabled',
      description:
        'Storage resources must have encryption at rest enabled to protect data from unauthorized access.',
      affectedResources: unencryptedStorage.map((n) => n.id),
      remediation: 'Enable encryption at rest using platform-managed or customer-managed keys.',
      references: [
        'https://docs.microsoft.com/azure/storage/common/storage-service-encryption',
        'https://docs.aws.amazon.com/s3/s3-bucket-encryption.html',
      ],
    })
  }

  // CIS 1.2: Ensure databases are not publicly accessible
  const publicDatabases = nodes.filter((n) => {
    const component = String(n.data.component || '')
    const isDatabase =
      component.includes('database') ||
      component.includes('sql') ||
      component.includes('postgres') ||
      component.includes('mysql')
    if (!isDatabase) return false

    const config = n.data.config as any
    return config?.publicAccess === true || config?.allowPublicAccess === true
  })

  if (publicDatabases.length > 0) {
    findings.push({
      id: 'cis-1.2',
      ruleId: 'CIS-1.2',
      severity: 'critical',
      title: 'Databases publicly accessible',
      description:
        'Databases should not be accessible from the internet. Use private endpoints and VNet integration.',
      affectedResources: publicDatabases.map((n) => n.id),
      remediation: 'Disable public access and configure Private Link/Private Endpoint.',
      references: [
        'https://docs.microsoft.com/azure/private-link/private-endpoint-overview',
        'https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-aws-services.html',
      ],
    })
  }

  // CIS 2.1: Ensure network security groups are configured
  const vms = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('vm') || component.includes('ec2') || component.includes('compute')
  })

  const nsgs = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return (
      component.includes('nsg') ||
      component.includes('security-group') ||
      component.includes('firewall')
    )
  })

  if (vms.length > 0 && nsgs.length === 0) {
    findings.push({
      id: 'cis-2.1',
      ruleId: 'CIS-2.1',
      severity: 'critical',
      title: 'Network Security Groups not configured',
      description:
        'Virtual machines must be protected by Network Security Groups to control inbound/outbound traffic.',
      affectedResources: vms.map((n) => n.id),
      remediation: 'Create NSG/Security Groups and associate with VM network interfaces.',
      references: [
        'https://docs.microsoft.com/azure/virtual-network/network-security-groups-overview',
        'https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html',
      ],
    })
  }

  // CIS 3.1: Ensure TLS/SSL is enabled for load balancers
  const loadBalancers = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('lb') || component.includes('load-balancer')
  })

  const noTLS = loadBalancers.filter((lb) => {
    const config = lb.data.config as any
    return !config?.tls && !config?.https && !config?.ssl
  })

  if (noTLS.length > 0) {
    findings.push({
      id: 'cis-3.1',
      ruleId: 'CIS-3.1',
      severity: 'high',
      title: 'TLS/SSL not configured on load balancers',
      description: 'All external-facing load balancers must use TLS/SSL to encrypt traffic.',
      affectedResources: noTLS.map((n) => n.id),
      remediation: 'Configure TLS certificates and redirect HTTP to HTTPS.',
      references: [
        'https://docs.microsoft.com/azure/application-gateway/ssl-overview',
        'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html',
      ],
    })
  }

  // CIS 4.1: Ensure backups are configured
  const databases = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const backups = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('backup') || component.includes('vault')
  })

  if (databases.length > 0 && backups.length === 0) {
    findings.push({
      id: 'cis-4.1',
      ruleId: 'CIS-4.1',
      severity: 'critical',
      title: 'Backups not configured',
      description: 'Critical data resources must have automated backup configured.',
      affectedResources: databases.map((n) => n.id),
      remediation: 'Enable automated backups with 7-30 day retention period.',
      references: [
        'https://docs.microsoft.com/azure/backup/backup-overview',
        'https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html',
      ],
    })
  }

  return findings
}

async function runGDPRScan(nodes: Node[], _edges: Edge[]): Promise<ComplianceFinding[]> {
  const findings: ComplianceFinding[] = []

  // GDPR Art. 32: Encryption of personal data
  const databases = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const unencryptedDbs = databases.filter((db) => {
    const config = db.data.config as any
    return !config?.encryption || config?.encryption === false
  })

  if (unencryptedDbs.length > 0) {
    findings.push({
      id: 'gdpr-32',
      ruleId: 'GDPR-Art.32',
      severity: 'critical',
      title: 'Personal data not encrypted',
      description:
        'GDPR Article 32 requires encryption of personal data at rest and in transit.',
      affectedResources: unencryptedDbs.map((n) => n.id),
      remediation: 'Enable transparent data encryption (TDE) and use TLS for connections.',
      references: ['https://gdpr-info.eu/art-32-gdpr/'],
    })
  }

  // GDPR Art. 25: Data protection by design - geographic restrictions
  const allResources = nodes.filter((n) => n.data.config)
  const nonEUResources = allResources.filter((r) => {
    const config = r.data.config as any
    const region = (config?.region || '').toLowerCase()
    return (
      region &&
      !region.includes('europe') &&
      !region.includes('eu') &&
      !region.includes('germany') &&
      !region.includes('france')
    )
  })

  if (nonEUResources.length > 0) {
    findings.push({
      id: 'gdpr-25',
      ruleId: 'GDPR-Art.25',
      severity: 'high',
      title: 'Resources deployed outside EU',
      description:
        'GDPR requires personal data of EU citizens to be stored within the EU unless adequate safeguards are in place.',
      affectedResources: nonEUResources.map((n) => n.id),
      remediation:
        'Deploy resources in EU regions or implement Standard Contractual Clauses (SCCs).',
      references: ['https://gdpr-info.eu/art-25-gdpr/', 'https://gdpr-info.eu/art-44-gdpr/'],
    })
  }

  // GDPR Art. 32: Logging and monitoring
  const monitoringComponents = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('monitor') || component.includes('log')
  })

  if (databases.length > 0 && monitoringComponents.length === 0) {
    findings.push({
      id: 'gdpr-32-log',
      ruleId: 'GDPR-Art.32',
      severity: 'medium',
      title: 'Logging and monitoring not configured',
      description:
        'GDPR requires ability to detect, investigate, and report personal data breaches.',
      affectedResources: databases.map((n) => n.id),
      remediation:
        'Enable diagnostic logs, audit logs, and configure alerts for suspicious activity.',
      references: ['https://gdpr-info.eu/art-32-gdpr/', 'https://gdpr-info.eu/art-33-gdpr/'],
    })
  }

  return findings
}

async function runSOC2Scan(nodes: Node[], _edges: Edge[]): Promise<ComplianceFinding[]> {
  const findings: ComplianceFinding[] = []

  // SOC2 CC6.1: Logical access controls
  const identityComponents = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return (
      component.includes('auth') ||
      component.includes('identity') ||
      component.includes('active-directory')
    )
  })

  if (identityComponents.length === 0) {
    findings.push({
      id: 'soc2-cc6.1',
      ruleId: 'SOC2-CC6.1',
      severity: 'high',
      title: 'No identity and access management configured',
      description: 'SOC2 requires proper authentication and authorization controls.',
      affectedResources: [],
      remediation: 'Implement Azure AD, AWS IAM, or similar identity management service.',
      references: ['https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/soc2'],
    })
  }

  // SOC2 CC7.2: System monitoring
  const monitoringComponents = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('monitor') || component.includes('application-insights')
  })

  if (monitoringComponents.length === 0) {
    findings.push({
      id: 'soc2-cc7.2',
      ruleId: 'SOC2-CC7.2',
      severity: 'high',
      title: 'System monitoring not configured',
      description: 'SOC2 requires continuous monitoring of system performance and availability.',
      affectedResources: [],
      remediation:
        'Implement Application Insights, CloudWatch, or similar monitoring solution.',
      references: ['https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/soc2'],
    })
  }

  return findings
}

async function runPCIDSSScan(nodes: Node[], _edges: Edge[]): Promise<ComplianceFinding[]> {
  const findings: ComplianceFinding[] = []

  // PCI-DSS 3.4: Encryption of cardholder data
  const databases = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const unencrypted = databases.filter((db) => {
    const config = db.data.config as any
    return !config?.encryption
  })

  if (unencrypted.length > 0) {
    findings.push({
      id: 'pci-3.4',
      ruleId: 'PCI-DSS-3.4',
      severity: 'critical',
      title: 'Cardholder data not encrypted',
      description: 'PCI-DSS requires strong encryption of cardholder data at rest.',
      affectedResources: unencrypted.map((n) => n.id),
      remediation: 'Enable database encryption using AES-256 or stronger.',
      references: ['https://www.pcisecuritystandards.org/documents/PCI_DSS_v3-2-1.pdf'],
    })
  }

  // PCI-DSS 1.3: Network segmentation
  const vnets = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('vnet') || component.includes('vpc')
  })

  if (vnets.length === 0) {
    findings.push({
      id: 'pci-1.3',
      ruleId: 'PCI-DSS-1.3',
      severity: 'critical',
      title: 'Network segmentation not implemented',
      description: 'PCI-DSS requires cardholder data environment to be segmented from other networks.',
      affectedResources: [],
      remediation: 'Implement VNet/VPC segmentation with DMZ and internal zones.',
      references: ['https://www.pcisecuritystandards.org/documents/PCI_DSS_v3-2-1.pdf'],
    })
  }

  return findings
}

async function runHIPAAScan(nodes: Node[], _edges: Edge[]): Promise<ComplianceFinding[]> {
  const findings: ComplianceFinding[] = []

  // HIPAA: Encryption of ePHI
  const databases = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('database') || component.includes('sql')
  })

  const unencrypted = databases.filter((db) => {
    const config = db.data.config as any
    return !config?.encryption
  })

  if (unencrypted.length > 0) {
    findings.push({
      id: 'hipaa-164.312',
      ruleId: 'HIPAA-164.312',
      severity: 'critical',
      title: 'ePHI not encrypted',
      description:
        'HIPAA requires encryption of electronic Protected Health Information (ePHI).',
      affectedResources: unencrypted.map((n) => n.id),
      remediation: 'Enable encryption at rest and in transit for all databases containing ePHI.',
      references: ['https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/'],
    })
  }

  // HIPAA: Audit controls
  const monitoringComponents = nodes.filter((n) => {
    const component = String(n.data.component || '')
    return component.includes('monitor') || component.includes('log')
  })

  if (databases.length > 0 && monitoringComponents.length === 0) {
    findings.push({
      id: 'hipaa-164.312-b',
      ruleId: 'HIPAA-164.312(b)',
      severity: 'high',
      title: 'Audit controls not configured',
      description: 'HIPAA requires audit logs of all access to ePHI.',
      affectedResources: databases.map((n) => n.id),
      remediation: 'Enable audit logging and configure log retention for at least 6 years.',
      references: ['https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/'],
    })
  }

  return findings
}
