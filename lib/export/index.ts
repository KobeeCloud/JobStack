/**
 * Export Format Index
 * Re-exports all export generators for easy importing
 */

export { generatePulumi } from './pulumi-generator'
export { generateCloudFormation } from './cloudformation-generator'
export { generateARM } from './arm-generator'
export { generateCICDConfigs, getCICDNodes } from '@/lib/generators/cicd'

// Export format types
export type ExportFormat =
  | 'terraform'
  | 'pulumi'
  | 'cloudformation-yaml'
  | 'cloudformation-json'
  | 'arm'
  | 'cicd'
  | 'diagram-json'
  | 'diagram-png'
  | 'diagram-svg'

export interface ExportOption {
  id: ExportFormat
  name: string
  description: string
  extension: string
  icon: string
  /** If true, this format only applies to certain node types */
  note?: string
}

export const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'terraform',
    name: 'Terraform',
    description: 'HashiCorp Configuration Language (HCL) — AWS, Azure, GCP resources',
    extension: '.tf',
    icon: 'terraform',
    note: 'Cloud components (AWS/Azure/GCP) only'
  },
  {
    id: 'cicd',
    name: 'CI/CD & Config Files',
    description: 'GitHub Actions workflows, GitLab CI, Jenkinsfile, ArgoCD, Helm, Datadog, docker-compose',
    extension: '.yml',
    icon: 'cicd',
    note: 'CI/CD, monitoring, and messaging components only'
  },
  {
    id: 'pulumi',
    name: 'Pulumi (TypeScript)',
    description: 'Pulumi infrastructure-as-code in TypeScript',
    extension: '.ts',
    icon: 'pulumi'
  },
  {
    id: 'cloudformation-yaml',
    name: 'CloudFormation (YAML)',
    description: 'AWS CloudFormation template in YAML',
    extension: '.yaml',
    icon: 'aws'
  },
  {
    id: 'cloudformation-json',
    name: 'CloudFormation (JSON)',
    description: 'AWS CloudFormation template in JSON',
    extension: '.json',
    icon: 'aws'
  },
  {
    id: 'arm',
    name: 'ARM Template',
    description: 'Azure Resource Manager template',
    extension: '.json',
    icon: 'azure'
  },
  {
    id: 'diagram-json',
    name: 'Diagram JSON',
    description: 'Export diagram data as JSON',
    extension: '.json',
    icon: 'file'
  },
  {
    id: 'diagram-png',
    name: 'PNG Image',
    description: 'Export diagram as PNG image',
    extension: '.png',
    icon: 'image'
  },
  {
    id: 'diagram-svg',
    name: 'SVG Image',
    description: 'Export diagram as scalable vector graphic',
    extension: '.svg',
    icon: 'image'
  }
]
