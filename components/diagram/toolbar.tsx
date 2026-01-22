'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ZoomIn, ZoomOut, Maximize, Download, Code, Save } from 'lucide-react'

interface DiagramToolbarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onSave: () => void
  onExport: () => void
  onGenerateCode: () => void
}

export function DiagramToolbar({ onZoomIn, onZoomOut, onFitView, onSave, onExport, onGenerateCode }: DiagramToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-background border rounded-lg shadow-lg p-2 flex gap-2">
      <Button variant="ghost" size="sm" onClick={onZoomIn}><ZoomIn className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={onZoomOut}><ZoomOut className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={onFitView}><Maximize className="h-4 w-4" /></Button>
      <Separator className="h-8" />
      <Button variant="ghost" size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1" />Save</Button>
      <Button variant="ghost" size="sm" onClick={onExport}><Download className="h-4 w-4 mr-1" />Export</Button>
      <Button variant="ghost" size="sm" onClick={onGenerateCode}><Code className="h-4 w-4 mr-1" />Generate</Button>
    </div>
  )
}
