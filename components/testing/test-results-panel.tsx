'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { FlaskConical, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import type { InfrastructureTest } from '@/lib/testing/infrastructure-tester'

export interface TestSummary {
  totalTests: number
  passed: number
  failed: number
  warnings: number
  successRate: number
}

interface TestResultsPanelProps {
  results: InfrastructureTest[] | null
  onRunTests: () => void
  isTesting: boolean
}

export function TestResultsPanel({ results, onRunTests, isTesting }: TestResultsPanelProps) {
  const summary = results ? getTestSummary(results) : null

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          Infrastructure Testing & Validation
        </h3>
        <p className="text-sm text-muted-foreground">
          Automated testing for connectivity, security, cost limits, and configuration
        </p>
      </div>

      {/* Test Controls */}
      <div className="p-4 border-b">
        <Button
          className="w-full"
          onClick={onRunTests}
          disabled={isTesting}
        >
          {isTesting ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Results Display */}
      {results && summary ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Summary</CardTitle>
                <CardDescription>
                  Ran {summary.totalTests} tests across 4 categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">{summary.passed}</span>
                        <span className="text-sm text-muted-foreground">Passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">{summary.failed}</span>
                        <span className="text-sm text-muted-foreground">Failed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold">{summary.warnings}</span>
                        <span className="text-sm text-muted-foreground">Warnings</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm font-semibold">{summary.successRate}%</span>
                    </div>
                    <Progress value={summary.successRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results by Category */}
            <TestCategorySection
              title="Connectivity Tests"
              results={results.filter((r) => r.type === 'connectivity')}
            />
            <TestCategorySection
              title="Security Tests"
              results={results.filter((r) => r.type === 'security')}
            />
            <TestCategorySection
              title="Cost Optimization Tests"
              results={results.filter((r) => r.type === 'cost')}
            />
            <TestCategorySection
              title="Configuration Tests"
              results={results.filter((r) => r.type === 'configuration')}
            />
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run All Tests" to start validation</p>
          </div>
        </div>
      )}
    </div>
  )
}

function getTestSummary(results: InfrastructureTest[]): TestSummary {
  const passed = results.filter((r) => r.status === 'pass').length
  const failed = results.filter((r) => r.status === 'fail').length
  const warnings = results.filter((r) => r.status === 'warning').length
  const totalTests = results.length
  const successRate = Math.round((passed / totalTests) * 100)

  return {
    totalTests,
    passed,
    failed,
    warnings,
    successRate,
  }
}

interface TestCategorySectionProps {
  title: string
  results: InfrastructureTest[]
}

function TestCategorySection({ title, results }: TestCategorySectionProps) {
  const passed = results.filter((r) => r.status === 'pass').length
  const failed = results.filter((r) => r.status === 'fail').length
  const warnings = results.filter((r) => r.status === 'warning').length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        <div className="flex gap-2 text-sm">
          {passed > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {passed} ✓
            </Badge>
          )}
          {failed > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {failed} ✗
            </Badge>
          )}
          {warnings > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {warnings} ⚠
            </Badge>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {results.map((result) => (
          <TestResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  )
}

function TestResultCard({ result }: { result: InfrastructureTest }) {
  const [expanded, setExpanded] = useState(false)

  const statusStyles: Record<InfrastructureTest['status'], string> = {
    pass: 'border-green-200 bg-green-50',
    fail: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    skipped: 'border-gray-200 bg-gray-50',
  }

  const statusIcons: Record<InfrastructureTest['status'], React.ReactNode> = {
    pass: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    fail: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    skipped: <AlertTriangle className="w-5 h-5 text-gray-600" />,
  }

  return (
    <Card className={statusStyles[result.status]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {statusIcons[result.status]}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{result.name}</span>
              <Badge variant="outline" className="text-xs">
                {result.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm mb-2">{result.message}</p>

            {result.details && (
              <div className="text-sm text-muted-foreground mb-2">
                {result.details}
              </div>
            )}

            {result.affectedResources && result.affectedResources.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="p-0 h-auto hover:bg-transparent"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" /> Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" /> Show Details
                    </>
                  )}
                </Button>

                {expanded && (
                  <div className="mt-3 p-3 bg-white/50 rounded border">
                    {result.details && (
                      <>
                        <h5 className="font-semibold text-sm mb-1">Details:</h5>
                        <p className="text-sm mb-2">{result.details}</p>
                      </>
                    )}
                    {result.affectedResources && result.affectedResources.length > 0 && (
                      <>
                        <h5 className="font-semibold text-sm mb-1">Affected Resources:</h5>
                        <ul className="text-sm list-disc list-inside">
                          {result.affectedResources.slice(0, 5).map((nodeId: string) => (
                            <li key={nodeId}>{nodeId}</li>
                          ))}
                          {result.affectedResources.length > 5 && (
                            <li className="text-muted-foreground">
                              +{result.affectedResources.length - 5} more
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
