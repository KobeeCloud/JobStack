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
} from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DiagramToolbarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onSave: () => void
  onExport: () => void
  onGenerateCode: () => void
  onExportImage?: (format: 'png' | 'svg') => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
  onDuplicate?: () => void
  onImport?: (data: any) => void
  canUndo?: boolean
  canRedo?: boolean
  saving?: boolean
  // New feature handlers
  onAIAnalysis?: () => void
  onComplianceScan?: () => void
  onRunTests?: () => void
  onMultiCloud?: () => void
  aiAnalyzing?: boolean
  complianceScanning?: boolean
  testing?: boolean
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
  onExportImage,
  onUndo,
  onRedo,
  onClear,
  onDuplicate,
  onImport,
  canUndo = false,
  canRedo = false,
  saving = false,
  onAIAnalysis,
  onComplianceScan,
  onRunTests,
  onMultiCloud,
  aiAnalyzing = false,
  complianceScanning = false,
  testing = false,
}: DiagramToolbarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)

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

        {/* Generate Code Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 ml-1"
              onClick={onGenerateCode}
              aria-label="Generate Terraform code"
            >
              <Code className="h-4 w-4 mr-1.5" />
              Generate
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate Terraform Code</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

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
