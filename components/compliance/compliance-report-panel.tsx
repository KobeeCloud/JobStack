'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { ComplianceReport, ComplianceFinding } from '@/lib/compliance/compliance-scanner'

interface ComplianceReportPanelProps {
  report: ComplianceReport | null
  onRunScan: (framework: 'cis' | 'gdpr' | 'soc2' | 'pci-dss' | 'hipaa') => void
  isScanning: boolean
}

export function ComplianceReportPanel({ report, onRunScan, isScanning }: ComplianceReportPanelProps) {
  const [selectedFramework, setSelectedFramework] = useState<'cis' | 'gdpr' | 'soc2' | 'pci-dss' | 'hipaa'>('cis')

  const frameworks = [
    { id: 'cis' as const, name: 'CIS Benchmark', description: 'Center for Internet Security' },
    { id: 'gdpr' as const, name: 'GDPR', description: 'EU Data Protection' },
    { id: 'soc2' as const, name: 'SOC 2', description: 'Service Organization Control' },
    { id: 'pci-dss' as const, name: 'PCI-DSS', description: 'Payment Card Industry' },
    { id: 'hipaa' as const, name: 'HIPAA', description: 'Healthcare Privacy' },
  ]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Compliance & Security Scanning
        </h3>
        <p className="text-sm text-muted-foreground">
          Scan your infrastructure against industry standards
        </p>
      </div>

      {/* Framework Selection */}
      <div className="p-4 border-b space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {frameworks.map((fw) => (
            <Button
              key={fw.id}
              variant={selectedFramework === fw.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFramework(fw.id)}
              className="justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">{fw.name}</div>
                <div className="text-xs opacity-70">{fw.description}</div>
              </div>
            </Button>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() => onRunScan(selectedFramework)}
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : `Run ${frameworks.find((f) => f.id === selectedFramework)?.name} Scan`}
        </Button>
      </div>

      {/* Report Display */}
      {report ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall Compliance Score</CardTitle>
                <CardDescription>
                  {report.framework.toUpperCase()} - Scanned {report.totalChecks} controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {report.score}%
                    </span>
                    <ScoreBadge score={report.score} />
                  </div>
                  <Progress value={report.score} className="h-2" />
                  <div className="flex gap-4 text-sm mt-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{report.passedChecks} Passed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>{report.totalChecks - report.passedChecks} Failed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span>{report.findings.filter(f => f.severity === 'medium' || f.severity === 'low').length} Warnings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Findings by Severity */}
            <div>
              <h4 className="font-semibold mb-2">Critical Issues</h4>
              {report.findings.filter((f) => f.severity === 'critical').length === 0 ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>No critical issues found</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {report.findings
                    .filter((f) => f.severity === 'critical')
                    .map((finding, idx) => (
                      <FindingCard key={idx} finding={finding} />
                    ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">High Priority Issues</h4>
              {report.findings.filter((f) => f.severity === 'high').length === 0 ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>No high priority issues found</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {report.findings
                    .filter((f) => f.severity === 'high')
                    .map((finding, idx) => (
                      <FindingCard key={idx} finding={finding} />
                    ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Medium Priority Issues</h4>
              <div className="space-y-2">
                {report.findings
                  .filter((f) => f.severity === 'medium')
                  .slice(0, 5)
                  .map((finding, idx) => (
                    <FindingCard key={idx} finding={finding} />
                  ))}
                {report.findings.filter((f) => f.severity === 'medium').length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{report.findings.filter((f) => f.severity === 'medium').length - 5} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a framework and click "Run Scan" to start</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 90) {
    return <Badge className="bg-green-600">Excellent</Badge>
  } else if (score >= 75) {
    return <Badge className="bg-blue-600">Good</Badge>
  } else if (score >= 50) {
    return <Badge className="bg-yellow-600">Fair</Badge>
  } else {
    return <Badge className="bg-red-600">Poor</Badge>
  }
}

function FindingCard({ finding }: { finding: ComplianceFinding }) {
  const [expanded, setExpanded] = useState(false)

  const severityColors = {
    critical: 'border-red-600 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  }

  const severityIcons = {
    critical: <XCircle className="w-5 h-5 text-red-600" />,
    high: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    medium: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    low: <AlertTriangle className="w-5 h-5 text-blue-600" />,
  }

  return (
    <Card className={severityColors[finding.severity]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {severityIcons[finding.severity]}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{finding.ruleId}</span>
              <Badge variant="outline" className="text-xs">
                {finding.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm mb-2">{finding.description}</p>

            {finding.affectedResources.length > 0 && (
              <div className="text-sm text-muted-foreground mb-2">
                Affected: {finding.affectedResources.slice(0, 3).join(', ')}
                {finding.affectedResources.length > 3 && ` +${finding.affectedResources.length - 3} more`}
              </div>
            )}

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
                  <ChevronDown className="w-4 h-4 mr-1" /> Show Remediation
                </>
              )}
            </Button>

            {expanded && (
              <div className="mt-3 p-3 bg-white/50 rounded border">
                <h5 className="font-semibold text-sm mb-1">Remediation Steps:</h5>
                <p className="text-sm">{finding.remediation}</p>
                {finding.references && finding.references.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    References: {finding.references.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
