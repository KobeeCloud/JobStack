import { Node } from '@xyflow/react'
import { getComponentById } from '@/lib/catalog'

export interface CostBreakdown {
  componentId: string
  componentName: string
  minCost: number
  maxCost: number
  category: string
}

export interface TotalCost {
  min: number
  max: number
  breakdown: CostBreakdown[]
  currency: string
}

export function calculateInfrastructureCost(nodes: Node[]): TotalCost {
  let totalMin = 0
  let totalMax = 0
  const breakdown: CostBreakdown[] = []

  nodes.forEach(node => {
    const componentId = node.data?.componentId as string
    if (!componentId) return

    const component = getComponentById(componentId)
    if (!component) return

    totalMin += component.estimatedCost.min
    totalMax += component.estimatedCost.max

    breakdown.push({
      componentId: component.id,
      componentName: node.data?.label as string || component.name,
      minCost: component.estimatedCost.min,
      maxCost: component.estimatedCost.max,
      category: component.category
    })
  })

  return {
    min: totalMin,
    max: totalMax,
    breakdown,
    currency: 'USD'
  }
}

export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cost)
}

export function getCostRange(totalCost: TotalCost): string {
  if (totalCost.min === totalCost.max) {
    return formatCost(totalCost.min)
  }
  return `${formatCost(totalCost.min)} - ${formatCost(totalCost.max)}`
}

export function getCostByCategory(breakdown: CostBreakdown[]): Record<string, { min: number; max: number }> {
  const byCategory: Record<string, { min: number; max: number }> = {}

  breakdown.forEach(item => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = { min: 0, max: 0 }
    }
    byCategory[item.category].min += item.minCost
    byCategory[item.category].max += item.maxCost
  })

  return byCategory
}
