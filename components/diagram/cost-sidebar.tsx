'use client'
import { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCost, getCostByCategory, TotalCost } from '@/lib/cost-calculator'
import { calculateDynamicCost } from '@/lib/finops/pricing-engine'
import { Loader2 } from 'lucide-react'

// Use a simple debounce hook to avoid excessive calculation
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

interface CostSidebarProps {
  nodes: Node[]
}

export function CostSidebar({ nodes }: CostSidebarProps) {
  const debouncedNodes = useDebouncedValue(nodes, 500)
  const [costData, setCostData] = useState<TotalCost | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    const calculate = async () => {
      setIsLoading(true)
      try {
        const result = await calculateDynamicCost(debouncedNodes)
        if (active) setCostData(result)
      } catch (e) {
        console.error('Failed to calculate costs:', e)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    calculate()
    return () => { active = false }
  }, [debouncedNodes])

  if (!costData) {
    return (
      <div className="w-80 border-l bg-muted/20 p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Calculating pricing...</span>
      </div>
    )
  }

  const byCategory = getCostByCategory(costData.breakdown)

  return (
    <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
      <Card>
        <CardHeader className="pb-3 border-b mb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Cost Estimate</CardTitle>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Total</p>
              <p className="text-3xl font-bold text-primary">
                {formatCost(costData.min)} - {formatCost(costData.max)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-3">By Category</p>
              <div className="space-y-2">
                {Object.entries(byCategory).map(([category, costs]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">{formatCost(costs.min)}-{formatCost(costs.max)}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-3">Components ({costData.breakdown.length})</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {costData.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="truncate">{item.componentName}</span>
                    <span className="text-muted-foreground ml-2">{formatCost(item.minCost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
