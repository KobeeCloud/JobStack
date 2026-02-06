import { Node, Edge } from '@xyflow/react'

/**
 * Compliance Templates and Validation
 * Pre-built architectures for regulatory compliance frameworks
 */

export interface ComplianceRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  category: string
  validate: (nodes: Node[], edges: Edge[]) => ComplianceViolation[]
}

export interface ComplianceViolation {
  ruleId: string
  ruleName: string
  severity: 'error' | 'warning' | 'info'
  message: string
  nodeId?: string
  suggestion?: string
}

export interface ComplianceFramework {
  id: string
  name: string
  description: string
  icon: string
  rules: ComplianceRule[]
  requiredComponents: string[]
  recommendedComponents: string[]
}

export interface ComplianceTemplate {
  id: string
  name: string
  description: string
  framework: string
  nodes: Node[]
  edges: Edge[]
  documentation: string
}

// Helper functions for validation
const hasComponent = (nodes: Node[], types: string[]) =>
  nodes.some(n => types.includes(n.type || ''))

const hasEncryption = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('kms') || 
    n.type?.includes('keyvault') ||
    n.data?.encryption === true
  )

const hasNetworkSegmentation = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('subnet') || 
    n.type?.includes('vnet') ||
    n.type?.includes('vpc')
  )

const hasFirewall = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('nsg') || 
    n.type?.includes('security-group') ||
    n.type?.includes('firewall') ||
    n.type?.includes('waf')
  )

const hasLoadBalancer = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('alb') || 
    n.type?.includes('lb') ||
    n.type?.includes('app-gw') ||
    n.type?.includes('load-balancer')
  )

const hasMonitoring = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('cloudwatch') || 
    n.type?.includes('monitor') ||
    n.type?.includes('logging')
  )

const hasBackup = (nodes: Node[]) =>
  nodes.some(n => 
    n.type?.includes('backup') || 
    n.type?.includes('recovery') ||
    n.data?.backup === true
  )

// HIPAA Compliance Rules
const HIPAA_RULES: ComplianceRule[] = [
  {
    id: 'hipaa-encryption',
    name: 'Data Encryption',
    description: 'All PHI must be encrypted at rest and in transit',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      if (!hasEncryption(nodes)) {
        return [{
          ruleId: 'hipaa-encryption',
          ruleName: 'Data Encryption',
          severity: 'error',
          message: 'No encryption service detected. HIPAA requires encryption of PHI.',
          suggestion: 'Add AWS KMS, Azure Key Vault, or GCP KMS for key management'
        }]
      }
      return []
    }
  },
  {
    id: 'hipaa-access-control',
    name: 'Access Control',
    description: 'Implement strict access controls for PHI',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      const hasIdentity = nodes.some(n => 
        n.type?.includes('cognito') || 
        n.type?.includes('ad') ||
        n.type?.includes('iam')
      )
      if (!hasIdentity) {
        return [{
          ruleId: 'hipaa-access-control',
          ruleName: 'Access Control',
          severity: 'error',
          message: 'No identity management service detected.',
          suggestion: 'Add AWS Cognito, Azure AD, or IAM for access control'
        }]
      }
      return []
    }
  },
  {
    id: 'hipaa-audit-logs',
    name: 'Audit Logging',
    description: 'Maintain comprehensive audit logs',
    severity: 'error',
    category: 'Compliance',
    validate: (nodes) => {
      if (!hasMonitoring(nodes)) {
        return [{
          ruleId: 'hipaa-audit-logs',
          ruleName: 'Audit Logging',
          severity: 'error',
          message: 'No logging/monitoring service detected.',
          suggestion: 'Add CloudWatch, Azure Monitor, or GCP Logging'
        }]
      }
      return []
    }
  },
  {
    id: 'hipaa-network-security',
    name: 'Network Security',
    description: 'Implement network segmentation and firewalls',
    severity: 'error',
    category: 'Network',
    validate: (nodes) => {
      const violations: ComplianceViolation[] = []
      if (!hasNetworkSegmentation(nodes)) {
        violations.push({
          ruleId: 'hipaa-network-security',
          ruleName: 'Network Security',
          severity: 'error',
          message: 'No network segmentation detected.',
          suggestion: 'Add VPC/VNet with subnets for network isolation'
        })
      }
      if (!hasFirewall(nodes)) {
        violations.push({
          ruleId: 'hipaa-network-security',
          ruleName: 'Network Security',
          severity: 'error',
          message: 'No firewall/security group detected.',
          suggestion: 'Add NSG, Security Group, or Firewall rules'
        })
      }
      return violations
    }
  },
  {
    id: 'hipaa-backup',
    name: 'Data Backup',
    description: 'Implement regular data backups',
    severity: 'warning',
    category: 'Disaster Recovery',
    validate: (nodes) => {
      if (!hasBackup(nodes)) {
        return [{
          ruleId: 'hipaa-backup',
          ruleName: 'Data Backup',
          severity: 'warning',
          message: 'No backup service detected.',
          suggestion: 'Configure backup for databases and storage'
        }]
      }
      return []
    }
  },
]

// PCI-DSS Compliance Rules
const PCI_DSS_RULES: ComplianceRule[] = [
  {
    id: 'pci-firewall',
    name: 'Firewall Configuration',
    description: 'Install and maintain a firewall configuration',
    severity: 'error',
    category: 'Network',
    validate: (nodes) => {
      if (!hasFirewall(nodes)) {
        return [{
          ruleId: 'pci-firewall',
          ruleName: 'Firewall Configuration',
          severity: 'error',
          message: 'No firewall detected. PCI-DSS Requirement 1.',
          suggestion: 'Add firewall or security groups to protect cardholder data'
        }]
      }
      return []
    }
  },
  {
    id: 'pci-encryption',
    name: 'Encrypt Cardholder Data',
    description: 'Encrypt transmission of cardholder data',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      if (!hasEncryption(nodes)) {
        return [{
          ruleId: 'pci-encryption',
          ruleName: 'Encrypt Cardholder Data',
          severity: 'error',
          message: 'No encryption service detected. PCI-DSS Requirement 4.',
          suggestion: 'Add key management service for data encryption'
        }]
      }
      return []
    }
  },
  {
    id: 'pci-waf',
    name: 'Web Application Firewall',
    description: 'Protect web applications with WAF',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      const hasWAF = nodes.some(n => 
        n.type?.includes('waf') || 
        n.type?.includes('front-door') ||
        n.type?.includes('cloudfront')
      )
      const hasWebApp = nodes.some(n => 
        n.type?.includes('app-service') || 
        n.type?.includes('lambda') ||
        n.type?.includes('functions')
      )
      if (hasWebApp && !hasWAF) {
        return [{
          ruleId: 'pci-waf',
          ruleName: 'Web Application Firewall',
          severity: 'error',
          message: 'Web applications detected without WAF protection.',
          suggestion: 'Add AWS WAF, Azure Front Door, or CloudFlare for web protection'
        }]
      }
      return []
    }
  },
  {
    id: 'pci-monitoring',
    name: 'Track and Monitor Access',
    description: 'Track and monitor all access to cardholder data',
    severity: 'error',
    category: 'Monitoring',
    validate: (nodes) => {
      if (!hasMonitoring(nodes)) {
        return [{
          ruleId: 'pci-monitoring',
          ruleName: 'Track and Monitor Access',
          severity: 'error',
          message: 'No monitoring service detected. PCI-DSS Requirement 10.',
          suggestion: 'Add comprehensive logging and monitoring'
        }]
      }
      return []
    }
  },
  {
    id: 'pci-network-segmentation',
    name: 'Network Segmentation',
    description: 'Segment cardholder data environment',
    severity: 'error',
    category: 'Network',
    validate: (nodes) => {
      if (!hasNetworkSegmentation(nodes)) {
        return [{
          ruleId: 'pci-network-segmentation',
          ruleName: 'Network Segmentation',
          severity: 'error',
          message: 'No network segmentation detected.',
          suggestion: 'Isolate cardholder data environment with dedicated subnets'
        }]
      }
      return []
    }
  },
]

// SOC 2 Compliance Rules
const SOC2_RULES: ComplianceRule[] = [
  {
    id: 'soc2-availability',
    name: 'Availability',
    description: 'System is available for operation as committed',
    severity: 'warning',
    category: 'Availability',
    validate: (nodes) => {
      if (!hasLoadBalancer(nodes)) {
        return [{
          ruleId: 'soc2-availability',
          ruleName: 'Availability',
          severity: 'warning',
          message: 'No load balancer detected for high availability.',
          suggestion: 'Add load balancer for improved availability'
        }]
      }
      return []
    }
  },
  {
    id: 'soc2-security',
    name: 'Security',
    description: 'System is protected against unauthorized access',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      const violations: ComplianceViolation[] = []
      if (!hasFirewall(nodes)) {
        violations.push({
          ruleId: 'soc2-security',
          ruleName: 'Security',
          severity: 'error',
          message: 'No firewall protection detected.',
          suggestion: 'Add security groups or firewalls'
        })
      }
      if (!hasEncryption(nodes)) {
        violations.push({
          ruleId: 'soc2-security',
          ruleName: 'Security',
          severity: 'error',
          message: 'No encryption service detected.',
          suggestion: 'Add key management for encryption'
        })
      }
      return violations
    }
  },
  {
    id: 'soc2-confidentiality',
    name: 'Confidentiality',
    description: 'Confidential information is protected',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      if (!hasEncryption(nodes)) {
        return [{
          ruleId: 'soc2-confidentiality',
          ruleName: 'Confidentiality',
          severity: 'error',
          message: 'No encryption detected for data confidentiality.',
          suggestion: 'Implement encryption at rest and in transit'
        }]
      }
      return []
    }
  },
]

// GDPR Compliance Rules
const GDPR_RULES: ComplianceRule[] = [
  {
    id: 'gdpr-encryption',
    name: 'Data Protection',
    description: 'Personal data must be encrypted',
    severity: 'error',
    category: 'Security',
    validate: (nodes) => {
      if (!hasEncryption(nodes)) {
        return [{
          ruleId: 'gdpr-encryption',
          ruleName: 'Data Protection',
          severity: 'error',
          message: 'No encryption detected. GDPR Article 32 requires appropriate security.',
          suggestion: 'Add encryption services for personal data protection'
        }]
      }
      return []
    }
  },
  {
    id: 'gdpr-data-residency',
    name: 'Data Residency',
    description: 'Personal data must stay within EU region',
    severity: 'warning',
    category: 'Compliance',
    validate: (nodes) => {
      const nonEuRegions = nodes.filter(n => {
        const region = n.data?.region as string || ''
        return region && !region.includes('eu') && !region.includes('europe')
      })
      if (nonEuRegions.length > 0) {
        return [{
          ruleId: 'gdpr-data-residency',
          ruleName: 'Data Residency',
          severity: 'warning',
          message: `${nonEuRegions.length} resource(s) may be outside EU regions.`,
          suggestion: 'Consider using EU regions for GDPR compliance'
        }]
      }
      return []
    }
  },
]

// Compliance Frameworks
export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    icon: '🏥',
    rules: HIPAA_RULES,
    requiredComponents: ['kms', 'keyvault', 'vpc', 'vnet', 'nsg', 'security-group'],
    recommendedComponents: ['waf', 'monitor', 'backup']
  },
  {
    id: 'pci-dss',
    name: 'PCI-DSS',
    description: 'Payment Card Industry Data Security Standard',
    icon: '💳',
    rules: PCI_DSS_RULES,
    requiredComponents: ['kms', 'keyvault', 'waf', 'nsg', 'security-group', 'vpc', 'vnet'],
    recommendedComponents: ['cloudfront', 'front-door', 'monitor']
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    icon: '🔒',
    rules: SOC2_RULES,
    requiredComponents: ['kms', 'keyvault', 'nsg', 'security-group'],
    recommendedComponents: ['alb', 'lb', 'monitor', 'backup']
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    icon: '🇪🇺',
    rules: GDPR_RULES,
    requiredComponents: ['kms', 'keyvault'],
    recommendedComponents: ['monitor', 'backup']
  },
]

// Validate against framework
export function validateCompliance(
  nodes: Node[], 
  edges: Edge[], 
  frameworkId: string
): ComplianceViolation[] {
  const framework = COMPLIANCE_FRAMEWORKS.find(f => f.id === frameworkId)
  if (!framework) return []
  
  const violations: ComplianceViolation[] = []
  
  framework.rules.forEach(rule => {
    violations.push(...rule.validate(nodes, edges))
  })
  
  return violations
}

// Get compliance score
export function getComplianceScore(
  nodes: Node[], 
  edges: Edge[], 
  frameworkId: string
): { score: number; total: number; passed: number; failed: number } {
  const framework = COMPLIANCE_FRAMEWORKS.find(f => f.id === frameworkId)
  if (!framework) return { score: 0, total: 0, passed: 0, failed: 0 }
  
  const violations = validateCompliance(nodes, edges, frameworkId)
  const errorCount = violations.filter(v => v.severity === 'error').length
  const total = framework.rules.length
  const passed = total - errorCount
  
  return {
    score: Math.round((passed / total) * 100),
    total,
    passed,
    failed: errorCount
  }
}
