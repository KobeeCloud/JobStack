'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ZoomIn, ZoomOut, Maximize, Download, Code, Save, Image } from 'lucide-react'

interface DiagramToolbarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onSave: () => void
  onExport: () => void
  onGenerateCode: () => void
  onExportImage?: (format: 'png' | 'svg') => void
}

export function DiagramToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  onExport,
  onGenerateCode,
  onExportImage,
}: DiagramToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-background border rounded-lg shadow-lg p-2 flex gap-2">
      <Button variant="ghost" size="sm" onClick={onZoomIn} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onZoomOut} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onFitView} aria-label="Fit view">
        <Maximize className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-8" />
      <Button variant="ghost" size="sm" onClick={onSave} aria-label="Save diagram">
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Export options">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </DropdownMenuItem>
          {onExportImage && (
            <>
              <DropdownMenuItem onClick={() => onExportImage('png')}>
                <Image className="h-4 w-4 mr-2" />
                Export PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportImage('svg')}>
                <Image className="h-4 w-4 mr-2" />
                Export SVG
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={onGenerateCode} aria-label="Generate Terraform code">
        <Code className="h-4 w-4 mr-1" />
        Generate
      </Button>
    </div>
  )
}
