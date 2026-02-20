'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, Check, FileCode } from 'lucide-react'
import { toast } from 'sonner'

export interface CodeFile {
  filename: string
  code: string
}

interface CodePreviewDialogProps {
  open: boolean
  onClose: () => void
  title: string
  files: CodeFile[]
  onDownload: () => void
}

export function CodePreviewDialog({
  open,
  onClose,
  title,
  files,
  onDownload,
}: CodePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const activeFile = files[Math.min(activeTab, Math.max(files.length - 1, 0))]

  const handleCopy = async () => {
    if (!activeFile) return
    try {
      await navigator.clipboard.writeText(activeFile.code)
      setCopied(true)
      toast.success('Copied', { description: `${activeFile.filename} copied to clipboard` })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed', { description: 'Could not access clipboard' })
    }
  }

  const handleDownloadAndClose = () => {
    onDownload()
    onClose()
  }

  const lineCount = activeFile?.code.split('\n').length ?? 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            {title}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              — {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* File tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto shrink-0 px-2">
          {files.map((f, i) => (
            <button
              key={f.filename}
              onClick={() => setActiveTab(i)}
              className={`text-xs px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${
                i === activeTab
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.filename}
            </button>
          ))}
        </div>

        {/* Code area */}
        <ScrollArea className="flex-1 min-h-0">
          <pre className="p-6 text-xs font-mono leading-relaxed whitespace-pre text-foreground">
            {activeFile?.code || ''}
          </pre>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 shrink-0 flex-row items-center">
          <p className="text-xs text-muted-foreground mr-auto">
            {lineCount} line{lineCount !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : `Copy ${activeFile?.filename ?? ''}`}
          </Button>
          <Button size="sm" onClick={handleDownloadAndClose} className="gap-2">
            <Download className="h-4 w-4" />
            Download {files.length > 1 ? 'ZIP' : (activeFile?.filename ?? 'file')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
