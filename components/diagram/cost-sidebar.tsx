'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCost, getCostByCategory } from '@/lib/cost-calculator'
import { TotalCost } from '@/lib/cost-calculator'

interface CostSidebarProps {
  costData: TotalCost
}

export function CostSidebar({ costData }: CostSidebarProps) {
  const byCategory = getCostByCategory(costData.breakdown)

  return (
    <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Estimate</CardTitle>
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
