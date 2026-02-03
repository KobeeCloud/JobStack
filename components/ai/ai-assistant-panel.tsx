'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, AlertTriangle, DollarSign, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { ArchitectureIssue } from '@/lib/ai/architecture-analyzer'

interface AIAssistantPanelProps {
  issues: ArchitectureIssue[]
  onApplyFix?: (issue: ArchitectureIssue) => void
  isAnalyzing?: boolean
}

export function AIAssistantPanel({ issues, onApplyFix, isAnalyzing }: AIAssistantPanelProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  const getIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'cost':
        return <DollarSign className="h-4 w-4" />
      case 'performance':
        return <Zap className="h-4 w-4" />
      case 'reliability':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'text-red-500'
      case 'cost':
        return 'text-green-500'
      case 'performance':
        return 'text-blue-500'
      case 'reliability':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  // Group issues by severity
  const criticalIssues = issues.filter((i) => i.severity === 'critical')
  const warningIssues = issues.filter((i) => i.severity === 'warning')
  const infoIssues = issues.filter((i) => i.severity === 'info')

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            AI Architecture Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">
              Analyzing your architecture for security, cost, and reliability issues...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (issues.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Architecture Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-lg font-semibold mb-2">Architecture Looks Great!</p>
            <p className="text-sm text-muted-foreground">
              No critical issues found. Your architecture follows best practices.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </div>
          <div className="flex gap-2">
            {criticalIssues.length > 0 && (
              <Badge variant="destructive">{criticalIssues.length} Critical</Badge>
            )}
            {warningIssues.length > 0 && (
              <Badge variant="default">{warningIssues.length} Warnings</Badge>
            )}
            {infoIssues.length > 0 && (
              <Badge variant="secondary">{infoIssues.length} Info</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {/* Critical Issues First */}
            {criticalIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">🔴 Critical Issues</h4>
                {criticalIssues.map((issue, idx) => (
                  <IssueCard
                    key={`critical-${idx}`}
                    issue={issue}
                    isExpanded={expandedIssue === `critical-${idx}`}
                    onToggle={() =>
                      setExpandedIssue(expandedIssue === `critical-${idx}` ? null : `critical-${idx}`)
                    }
                    onApplyFix={onApplyFix}
                    getIcon={getIcon}
                    getSeverityColor={getSeverityColor}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}

            {/* Warning Issues */}
            {warningIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-orange-500">⚠️ Warnings</h4>
                {warningIssues.map((issue, idx) => (
                  <IssueCard
                    key={`warning-${idx}`}
                    issue={issue}
                    isExpanded={expandedIssue === `warning-${idx}`}
                    onToggle={() =>
                      setExpandedIssue(expandedIssue === `warning-${idx}` ? null : `warning-${idx}`)
                    }
                    onApplyFix={onApplyFix}
                    getIcon={getIcon}
                    getSeverityColor={getSeverityColor}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}

            {/* Info Issues */}
            {infoIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-500">💡 Suggestions</h4>
                {infoIssues.map((issue, idx) => (
                  <IssueCard
                    key={`info-${idx}`}
                    issue={issue}
                    isExpanded={expandedIssue === `info-${idx}`}
                    onToggle={() =>
                      setExpandedIssue(expandedIssue === `info-${idx}` ? null : `info-${idx}`)
                    }
                    onApplyFix={onApplyFix}
                    getIcon={getIcon}
                    getSeverityColor={getSeverityColor}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface IssueCardProps {
  issue: ArchitectureIssue
  isExpanded: boolean
  onToggle: () => void
  onApplyFix?: (issue: ArchitectureIssue) => void
  getIcon: (type: string) => React.ReactNode
  getSeverityColor: (severity: string) => string
  getTypeColor: (type: string) => string
}

function IssueCard({
  issue,
  isExpanded,
  onToggle,
  onApplyFix,
  getIcon,
  getSeverityColor,
  getTypeColor,
}: IssueCardProps) {
  return (
    <div
      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={getTypeColor(issue.type)}>{getIcon(issue.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-sm">{issue.title}</h4>
              <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                {issue.severity}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {issue.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{issue.description}</p>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {issue.affectedNodes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1">📍 Affected Components:</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.affectedNodes.length} component(s)
                    </p>
                  </div>
                )}

                {issue.suggestedFix && (
                  <div>
                    <p className="text-xs font-semibold mb-1">💡 Suggested Fix:</p>
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {issue.suggestedFix}
                    </p>
                  </div>
                )}

                {onApplyFix && issue.autoFixable && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onApplyFix(issue)
                    }}
                  >
                    Auto-Fix This Issue
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
