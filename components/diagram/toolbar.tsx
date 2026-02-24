'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Code,
  Save,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Keyboard,
  FileJson,
  FileImage,
  FileCode,
  Upload,
  Sparkles,
  Shield,
  FlaskConical,
  Cloud,
  Library,
  GitBranch,
  Boxes,
  Building2,
  Zap,
  Network,
  TerminalSquare,
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VersionHistory } from '@/components/version-history'
import { useDiagramStore } from '@/lib/store/diagram-store'

interface DiagramToolbarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onSave: () => void
  onExport: () => void
  onGenerateCode: () => void
  onGenerateCloudFormation?: () => void
  onGenerateARM?: () => void
  onGeneratePulumi?: () => void
  onGenerateCICD?: () => void
  onExportImage?: (format: 'png' | 'svg') => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
  onDuplicate?: () => void
  onLayout?: () => void
  onImport?: (data: any) => void
  onImportTerraform?: (files: FileList) => void
  canUndo?: boolean
  canRedo?: boolean
  saving?: boolean
  // New feature handlers
  onAIAnalysis?: () => void
  onComplianceScan?: () => void
  onRunTests?: () => void
  onMultiCloud?: () => void
  // Templates
  onShowTemplates?: () => void
  // Wizards
  onK8sWizard?: () => void
  onGovernanceWizard?: () => void
  onQuickBuild?: () => void
  onDryRun?: () => void
  onRegionConfig?: () => void
  // Version history
  diagramId?: string
  onRestoreVersion?: () => void
}

const keyboardShortcuts = [
  { key: 'Ctrl/⌘ + S', action: 'Save diagram' },
  { key: 'Ctrl/⌘ + Z', action: 'Undo' },
  { key: 'Ctrl/⌘ + Y', action: 'Redo' },
  { key: 'Delete/Backspace', action: 'Delete selected' },
  { key: 'Ctrl/⌘ + D', action: 'Duplicate selected' },
  { key: 'Ctrl/⌘ + A', action: 'Select all' },
  { key: '+/-', action: 'Zoom in/out' },
  { key: 'Space + Drag', action: 'Pan canvas' },
  { key: 'Scroll', action: 'Zoom' },
]

export function DiagramToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  onExport,
  onGenerateCode,
  onGenerateCloudFormation,
  onGenerateARM,
  onGeneratePulumi,
  onGenerateCICD,
  onExportImage,
  onUndo,
  onRedo,
  onClear,
  onDuplicate,
  onImport,
  onImportTerraform,
  canUndo = false,
  canRedo = false,
  saving = false,
  onAIAnalysis,
  onComplianceScan,
  onRunTests,
  onMultiCloud,
  onShowTemplates,
  onK8sWizard,
  onGovernanceWizard,
  onQuickBuild,
  onDryRun,
  onRegionConfig,
  diagramId,
  onRestoreVersion,
  onLayout,
}: DiagramToolbarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { aiAnalyzing, complianceScanning, testing, terraformDirty, nodes } = useDiagramStore()
  const codeOutOfSync = terraformDirty && nodes.length > 0

  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && onImport) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          onImport(data)
        } catch (error) {
          console.error('Failed to import:', error)
        }
      }
    }
    input.click()
  }

  const handleImportTerraformClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.tf'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0 && onImportTerraform) {
        onImportTerraform(files)
      }
    }
    input.click()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-lg shadow-lg p-1.5 flex items-center gap-1">
        {/* Undo/Redo */}
        {(onUndo || onRedo) && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUndo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRedo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        {/* Zoom Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn} aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In (+)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut} aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out (-)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFitView} aria-label="Fit view">
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to View</TooltipContent>
        </Tooltip>
        {onLayout && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLayout} aria-label="Auto layout">
                <Network className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto Layout</TooltipContent>
          </Tooltip>
        )}
        {onLayout && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLayout} aria-label="Auto layout">
                <Network className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto Layout</TooltipContent>
          </Tooltip>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onSave}
              disabled={saving}
              aria-label="Save diagram"
            >
              <Save className={`h-4 w-4 mr-1.5 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Ctrl+S)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* AI & Analysis Features */}
        {onAIAnalysis && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onAIAnalysis}
                disabled={aiAnalyzing}
                aria-label="AI Analysis"
              >
                <Sparkles className={`h-4 w-4 mr-1.5 ${aiAnalyzing ? 'animate-pulse' : ''}`} />
                {aiAnalyzing ? 'Analyzing...' : 'AI'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Architecture Analysis</TooltipContent>
          </Tooltip>
        )}

        {onComplianceScan && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onComplianceScan}
                disabled={complianceScanning}
                aria-label="Compliance Scan"
              >
                <Shield className={`h-4 w-4 mr-1.5 ${complianceScanning ? 'animate-pulse' : ''}`} />
                Compliance
              </Button>
            </TooltipTrigger>
            <TooltipContent>Security & Compliance Scanning</TooltipContent>
          </Tooltip>
        )}

        {onRunTests && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onRunTests}
                disabled={testing}
                aria-label="Run Tests"
              >
                <FlaskConical className={`h-4 w-4 mr-1.5 ${testing ? 'animate-pulse' : ''}`} />
                Tests
              </Button>
            </TooltipTrigger>
            <TooltipContent>Infrastructure Testing</TooltipContent>
          </Tooltip>
        )}

        {onMultiCloud && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onMultiCloud}
                aria-label="Multi-Cloud"
              >
                <Cloud className="h-4 w-4 mr-1.5" />
                Multi-Cloud
              </Button>
            </TooltipTrigger>
            <TooltipContent>Multi-Cloud Components</TooltipContent>
          </Tooltip>
        )}

        {onRegionConfig && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onRegionConfig}
                aria-label="Multi-Region"
              >
                <Globe className="h-4 w-4 mr-1.5" />
                Regions
              </Button>
            </TooltipTrigger>
            <TooltipContent>Multi-Region Configuration</TooltipContent>
          </Tooltip>
        )}

        {onShowTemplates && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onShowTemplates}
                aria-label="Templates"
              >
                <Library className="h-4 w-4 mr-1.5" />
                Templates
              </Button>
            </TooltipTrigger>
            <TooltipContent>Browse & Apply Templates</TooltipContent>
          </Tooltip>
        )}

        {onK8sWizard && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onK8sWizard}
                aria-label="K8s Wizard"
              >
                <Boxes className="h-4 w-4 mr-1.5" />
                K8s Wizard
              </Button>
            </TooltipTrigger>
            <TooltipContent>Kubernetes Cluster Wizard (AKS / EKS / GKE)</TooltipContent>
          </Tooltip>
        )}

        {onGovernanceWizard && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onGovernanceWizard}
                aria-label="Governance Wizard"
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                Governance
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cloud Governance Wizard (Landing Zone)</TooltipContent>
          </Tooltip>
        )}

        {onQuickBuild && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={onQuickBuild}
                aria-label="Quick Build"
              >
                <Zap className="h-4 w-4 mr-1.5" />
                Quick Build
              </Button>
            </TooltipTrigger>
            <TooltipContent>Scaffold a full infrastructure pattern in one click</TooltipContent>
          </Tooltip>
        )}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Export Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2" aria-label="Export options">
                  <Download className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Export Options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Export As</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON (Diagram Data)
            </DropdownMenuItem>
            {onExportImage && (
              <>
                <DropdownMenuItem onClick={() => onExportImage('png')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  PNG Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportImage('svg')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  SVG Vector
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onGenerateCode}>
              <FileCode className="h-4 w-4 mr-2" />
              Terraform Code
            </DropdownMenuItem>
            {onGenerateCloudFormation && (
              <DropdownMenuItem onClick={onGenerateCloudFormation}>
                <FileCode className="h-4 w-4 mr-2" />
                CloudFormation (YAML)
              </DropdownMenuItem>
            )}
            {onGenerateARM && (
              <DropdownMenuItem onClick={onGenerateARM}>
                <FileCode className="h-4 w-4 mr-2" />
                ARM Template (JSON)
              </DropdownMenuItem>
            )}
            {onGeneratePulumi && (
              <DropdownMenuItem onClick={onGeneratePulumi}>
                <FileCode className="h-4 w-4 mr-2" />
                Pulumi (TypeScript)
              </DropdownMenuItem>
            )}
            {onGenerateCICD && (
              <DropdownMenuItem onClick={onGenerateCICD}>
                <GitBranch className="h-4 w-4 mr-2" />
                CI/CD & Config Files
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import */}
        {onImport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleImportClick}
                aria-label="Import diagram"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import JSON</TooltipContent>
          </Tooltip>
        )}
        {onImportTerraform && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleImportTerraformClick}
                aria-label="Import Terraform"
              >
                <FileCode className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import Terraform (.tf) → Diagram</TooltipContent>
          </Tooltip>
        )}

        {/* Generate Code Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 ml-1 relative"
                  aria-label="Generate infrastructure code"
                >
                  <Code className="h-4 w-4 mr-1.5" />
                  Generate
                  {codeOutOfSync && (
                    <span
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-400 border border-background"
                      title="Diagram changed since last generation"
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Generate Infrastructure Code</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Infrastructure as Code</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onGenerateCode}>
              <FileCode className="h-4 w-4 mr-2" />
              Terraform (.tf)
            </DropdownMenuItem>
            {onGenerateCloudFormation && (
              <DropdownMenuItem onClick={onGenerateCloudFormation}>
                <FileCode className="h-4 w-4 mr-2" />
                CloudFormation (YAML)
              </DropdownMenuItem>
            )}
            {onGenerateARM && (
              <DropdownMenuItem onClick={onGenerateARM}>
                <FileCode className="h-4 w-4 mr-2" />
                ARM Template (JSON)
              </DropdownMenuItem>
            )}
            {onGeneratePulumi && (
              <DropdownMenuItem onClick={onGeneratePulumi}>
                <FileCode className="h-4 w-4 mr-2" />
                Pulumi (TypeScript)
              </DropdownMenuItem>
            )}
            {onGenerateCICD && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onGenerateCICD}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  CI/CD & Config Files
                </DropdownMenuItem>
              </>
            )}
            {onDryRun && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDryRun}>
                  <TerminalSquare className="h-4 w-4 mr-2" />
                  Dry Run (terraform plan)
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Version History */}
        {diagramId && onRestoreVersion && (
          <>
            <VersionHistory diagramId={diagramId} onRestore={onRestoreVersion} />
            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
              <Keyboard className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowShortcuts(true)}>
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Selected
              </DropdownMenuItem>
            )}
            {onClear && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClear} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Canvas
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quick actions for efficient diagram editing
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {keyboardShortcuts.map((shortcut, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
