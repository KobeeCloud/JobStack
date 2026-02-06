import { Node } from '@xyflow/react'
import { getComponentById, ComponentConfig } from '@/lib/catalog'

export interface CostOptimization {
  nodeId: string
  nodeLabel: string
  currentComponent: string
  currentCost: { min: number; max: number }
  suggestion: {
    componentId: string
    componentName: string
    estimatedCost: { min: number; max: number }
    reason: string
    savingsPercent: number
  }
  category: 'downsize' | 'reserved' | 'spot' | 'alternative' | 'remove'
  impact: 'low' | 'medium' | 'high'
}

export interface CostReport {
  totalCurrentCost: { min: number; max: number }
  totalOptimizedCost: { min: number; max: number }
  potentialSavings: { min: number; max: number }
  optimizations: CostOptimization[]
  summary: {
    downsizeCount: number
    reservedCount: number
    spotCount: number
    alternativeCount: number
    removeCount: number
  }
}

// Component alternatives for cost optimization
const COST_ALTERNATIVES: Record<string, { alternative: string; reason: string; savingsPercent: number }[]> = {
  // AWS alternatives
  'aws-ec2': [
    { alternative: 'aws-lambda', reason: 'Consider serverless for variable workloads', savingsPercent: 60 },
    { alternative: 'aws-ecs', reason: 'Containerize for better resource utilization', savingsPercent: 30 },
  ],
  'aws-rds': [
    { alternative: 'aws-aurora-serverless', reason: 'Aurora Serverless for variable DB loads', savingsPercent: 40 },
    { alternative: 'aws-dynamodb', reason: 'DynamoDB for NoSQL workloads', savingsPercent: 50 },
  ],
  'aws-alb': [
    { alternative: 'aws-api-gateway', reason: 'API Gateway for API-only traffic', savingsPercent: 35 },
  ],

  // Azure alternatives
  'azure-vm': [
    { alternative: 'azure-functions', reason: 'Serverless for event-driven workloads', savingsPercent: 55 },
    { alternative: 'azure-container-apps', reason: 'Container Apps for microservices', savingsPercent: 35 },
  ],
  'azure-sql': [
    { alternative: 'azure-cosmosdb', reason: 'Cosmos DB for globally distributed data', savingsPercent: 25 },
    { alternative: 'azure-sql-serverless', reason: 'SQL Serverless for intermittent usage', savingsPercent: 45 },
  ],
  'azure-app-gw': [
    { alternative: 'azure-front-door', reason: 'Front Door for global load balancing', savingsPercent: 20 },
  ],

  // GCP alternatives
  'gcp-compute-engine': [
    { alternative: 'gcp-cloud-run', reason: 'Cloud Run for containerized apps', savingsPercent: 50 },
    { alternative: 'gcp-cloud-functions', reason: 'Functions for event-driven code', savingsPercent: 60 },
  ],
  'gcp-cloud-sql': [
    { alternative: 'gcp-firestore', reason: 'Firestore for document-based data', savingsPercent: 40 },
    { alternative: 'gcp-spanner', reason: 'Spanner for global consistency needs', savingsPercent: -20 },
  ],
}

// Components that can use reserved pricing
const RESERVED_ELIGIBLE = [
  'aws-ec2', 'aws-rds', 'aws-elasticache', 'aws-redshift',
  'azure-vm', 'azure-sql', 'azure-cosmosdb',
  'gcp-compute-engine', 'gcp-cloud-sql',
]

// Components that can use spot/preemptible instances
const SPOT_ELIGIBLE = [
  'aws-ec2', 'aws-eks', 'aws-ecs',
  'azure-vm', 'azure-vmss', 'azure-aks',
  'gcp-compute-engine', 'gcp-gke',
]

export function analyzeCosts(nodes: Node[]): CostReport {
  const optimizations: CostOptimization[] = []
  let totalCurrentMin = 0
  let totalCurrentMax = 0
  let totalOptimizedMin = 0
  let totalOptimizedMax = 0

  const summary = {
    downsizeCount: 0,
    reservedCount: 0,
    spotCount: 0,
    alternativeCount: 0,
    removeCount: 0,
  }

  nodes.forEach(node => {
    const componentId = node.data?.componentId || node.data?.component
    if (!componentId) return

    const component = getComponentById(componentId as string)
    if (!component) return

    totalCurrentMin += component.estimatedCost.min
    totalCurrentMax += component.estimatedCost.max

    // Check for alternatives
    const alternatives = COST_ALTERNATIVES[componentId as string]
    if (alternatives && alternatives.length > 0) {
      const bestAlternative = alternatives[0]
      const altComponent = getComponentById(bestAlternative.alternative)

      if (altComponent && bestAlternative.savingsPercent > 0) {
        optimizations.push({
          nodeId: node.id,
          nodeLabel: String(node.data?.label || component.name),
          currentComponent: componentId as string,
          currentCost: component.estimatedCost,
          suggestion: {
            componentId: bestAlternative.alternative,
            componentName: altComponent.name,
            estimatedCost: altComponent.estimatedCost,
            reason: bestAlternative.reason,
            savingsPercent: bestAlternative.savingsPercent,
          },
          category: 'alternative',
          impact: bestAlternative.savingsPercent > 40 ? 'high' : bestAlternative.savingsPercent > 20 ? 'medium' : 'low',
        })
        summary.alternativeCount++

        totalOptimizedMin += altComponent.estimatedCost.min
        totalOptimizedMax += altComponent.estimatedCost.max
      } else {
        totalOptimizedMin += component.estimatedCost.min
        totalOptimizedMax += component.estimatedCost.max
      }
    } else {
      // Check for reserved pricing eligibility
      if (RESERVED_ELIGIBLE.includes(componentId as string)) {
        const reservedSavings = 0.3 // 30% savings with reserved
        optimizations.push({
          nodeId: node.id,
          nodeLabel: String(node.data?.label || component.name),
          currentComponent: componentId as string,
          currentCost: component.estimatedCost,
          suggestion: {
            componentId: componentId as string,
            componentName: `${component.name} (Reserved)`,
            estimatedCost: {
              min: Math.round(component.estimatedCost.min * (1 - reservedSavings)),
              max: Math.round(component.estimatedCost.max * (1 - reservedSavings)),
            },
            reason: 'Use 1-year reserved instances for predictable workloads',
            savingsPercent: 30,
          },
          category: 'reserved',
          impact: 'medium',
        })
        summary.reservedCount++

        totalOptimizedMin += Math.round(component.estimatedCost.min * (1 - reservedSavings))
        totalOptimizedMax += Math.round(component.estimatedCost.max * (1 - reservedSavings))
      }
      // Check for spot eligibility
      else if (SPOT_ELIGIBLE.includes(componentId as string)) {
        const spotSavings = 0.6 // 60% savings with spot
        optimizations.push({
          nodeId: node.id,
          nodeLabel: String(node.data?.label || component.name),
          currentComponent: componentId as string,
          currentCost: component.estimatedCost,
          suggestion: {
            componentId: componentId as string,
            componentName: `${component.name} (Spot)`,
            estimatedCost: {
              min: Math.round(component.estimatedCost.min * (1 - spotSavings)),
              max: Math.round(component.estimatedCost.max * (1 - spotSavings)),
            },
            reason: 'Use spot instances for fault-tolerant workloads',
            savingsPercent: 60,
          },
          category: 'spot',
          impact: 'high',
        })
        summary.spotCount++

        totalOptimizedMin += Math.round(component.estimatedCost.min * (1 - spotSavings))
        totalOptimizedMax += Math.round(component.estimatedCost.max * (1 - spotSavings))
      } else {
        totalOptimizedMin += component.estimatedCost.min
        totalOptimizedMax += component.estimatedCost.max
      }
    }
  })

  // Sort by savings potential
  optimizations.sort((a, b) => b.suggestion.savingsPercent - a.suggestion.savingsPercent)

  return {
    totalCurrentCost: { min: totalCurrentMin, max: totalCurrentMax },
    totalOptimizedCost: { min: totalOptimizedMin, max: totalOptimizedMax },
    potentialSavings: {
      min: totalCurrentMin - totalOptimizedMin,
      max: totalCurrentMax - totalOptimizedMax,
    },
    optimizations,
    summary,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
