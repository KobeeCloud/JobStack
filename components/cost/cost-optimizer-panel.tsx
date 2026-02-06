'use client'

import { useState } from 'react'
import { Node } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyzeCosts, CostReport, CostOptimization, formatCurrency } from '@/lib/cost-optimizer'
import {
  DollarSign, TrendingDown, Zap, Clock, ArrowRight,
  Sparkles, AlertTriangle, CheckCircle, X, RefreshCw
} from 'lucide-react'

interface CostOptimizerPanelProps {
  nodes: Node[]
  onApplyOptimization?: (optimization: CostOptimization) => void
  onClose: () => void
}

const categoryIcons = {
  alternative: Sparkles,
  reserved: Clock,
  spot: Zap,
  downsize: TrendingDown,
  remove: X,
}

const categoryColors = {
  alternative: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  reserved: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  spot: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  downsize: 'bg-green-500/10 text-green-600 border-green-500/20',
  remove: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const impactColors = {
  low: 'bg-gray-500/10 text-gray-600',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-green-500/10 text-green-600',
}

export function CostOptimizerPanel({ nodes, onApplyOptimization, onClose }: CostOptimizerPanelProps) {
  const [report, setReport] = useState<CostReport | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [appliedOptimizations, setAppliedOptimizations] = useState<Set<string>>(new Set())

  const runAnalysis = () => {
    setAnalyzing(true)
    // Simulate analysis delay for UX
    setTimeout(() => {
      const result = analyzeCosts(nodes)
      setReport(result)
      setAnalyzing(false)
    }, 1000)
  }

  const handleApply = (optimization: CostOptimization) => {
    if (onApplyOptimization) {
      onApplyOptimization(optimization)
    }
    setAppliedOptimizations(prev => new Set([...prev, optimization.nodeId]))
  }

  const savingsPercent = report
    ? Math.round(((report.totalCurrentCost.min + report.totalCurrentCost.max) / 2 -
        (report.totalOptimizedCost.min + report.totalOptimizedCost.max) / 2) /
        ((report.totalCurrentCost.min + report.totalCurrentCost.max) / 2) * 100)
    : 0

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <CardTitle>Cost Optimizer</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered suggestions to reduce your infrastructure costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Analyze your infrastructure to find cost optimization opportunities
            </p>
            <Button onClick={runAnalysis} disabled={analyzing || nodes.length === 0}>
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Costs
                </>
              )}
            </Button>
            {nodes.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Add components to your diagram first
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Current Cost</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(report.totalCurrentCost.min)} - {formatCurrency(report.totalCurrentCost.max)}
                  </p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="pt-4">
                  <p className="text-xs text-green-600">Potential Savings</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(report.potentialSavings.min)} - {formatCurrency(report.potentialSavings.max)}
                  </p>
                  <p className="text-xs text-green-600">/month</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Optimized Cost</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(report.totalOptimizedCost.min)} - {formatCurrency(report.totalOptimizedCost.max)}
                  </p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Potential Savings</span>
                <span className="text-green-600 font-medium">{savingsPercent}%</span>
              </div>
              <Progress value={savingsPercent} className="h-2" />
            </div>

            {/* Optimization Tabs */}
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({report.optimizations.length})</TabsTrigger>
                <TabsTrigger value="alternative">Alternatives ({report.summary.alternativeCount})</TabsTrigger>
                <TabsTrigger value="reserved">Reserved ({report.summary.reservedCount})</TabsTrigger>
                <TabsTrigger value="spot">Spot ({report.summary.spotCount})</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[300px] mt-4">
                <TabsContent value="all" className="space-y-3 mt-0">
                  {report.optimizations.map((opt, i) => (
                    <OptimizationCard
                      key={i}
                      optimization={opt}
                      onApply={handleApply}
                      applied={appliedOptimizations.has(opt.nodeId)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="alternative" className="space-y-3 mt-0">
                  {report.optimizations.filter(o => o.category === 'alternative').map((opt, i) => (
                    <OptimizationCard
                      key={i}
                      optimization={opt}
                      onApply={handleApply}
                      applied={appliedOptimizations.has(opt.nodeId)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="reserved" className="space-y-3 mt-0">
                  {report.optimizations.filter(o => o.category === 'reserved').map((opt, i) => (
                    <OptimizationCard
                      key={i}
                      optimization={opt}
                      onApply={handleApply}
                      applied={appliedOptimizations.has(opt.nodeId)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="spot" className="space-y-3 mt-0">
                  {report.optimizations.filter(o => o.category === 'spot').map((opt, i) => (
                    <OptimizationCard
                      key={i}
                      optimization={opt}
                      onApply={handleApply}
                      applied={appliedOptimizations.has(opt.nodeId)}
                    />
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Re-analyze button */}
            <Button variant="outline" className="w-full" onClick={runAnalysis}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function OptimizationCard({
  optimization,
  onApply,
  applied
}: {
  optimization: CostOptimization
  onApply: (opt: CostOptimization) => void
  applied: boolean
}) {
  const CategoryIcon = categoryIcons[optimization.category]

  return (
    <Card className={applied ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={categoryColors[optimization.category]}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {optimization.category}
              </Badge>
              <Badge variant="secondary" className={impactColors[optimization.impact]}>
                {optimization.impact} impact
              </Badge>
            </div>

            <p className="font-medium">{optimization.nodeLabel}</p>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(optimization.currentCost.min)}-{formatCurrency(optimization.currentCost.max)}
              </span>
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                {formatCurrency(optimization.suggestion.estimatedCost.min)}-{formatCurrency(optimization.suggestion.estimatedCost.max)}
              </span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                -{optimization.suggestion.savingsPercent}%
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {optimization.suggestion.reason}
            </p>

            {optimization.category === 'alternative' && (
              <p className="text-xs text-muted-foreground">
                Replace with: <strong>{optimization.suggestion.componentName}</strong>
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant={applied ? 'secondary' : 'default'}
            onClick={() => onApply(optimization)}
            disabled={applied}
          >
            {applied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Applied
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
