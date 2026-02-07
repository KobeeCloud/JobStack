'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { History, Save, RotateCcw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Version {
  id: string
  version_number: number
  message: string
  created_by: string
  created_at: string
}

interface VersionHistoryProps {
  diagramId: string
  onRestore: () => void
}

export function VersionHistory({ diagramId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const loadVersions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/diagrams/versions?diagramId=${diagramId}`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [diagramId])

  useEffect(() => {
    loadVersions()
  }, [loadVersions])

  const handleSaveVersion = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/diagrams/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagramId,
          message: saveMessage || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to save version')

      const version = await res.json()
      toast.success(`Version ${version.version_number} saved`)
      setSaveMessage('')
      setSaveDialogOpen(false)
      loadVersions()
    } catch {
      toast.error('Failed to save version')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestore = async (versionId: string, versionNumber: number) => {
    setIsRestoring(versionId)
    try {
      const res = await fetch(`/api/diagrams/versions/${versionId}/restore`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to restore')

      toast.success(`Restored to version ${versionNumber}`)
      onRestore()
    } catch {
      toast.error('Failed to restore version')
    } finally {
      setIsRestoring(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-1">
      {/* Save Version */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Save version">
            <Save className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save Version</DialogTitle>
            <DialogDescription>
              Create a snapshot of the current diagram state
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Version message (optional)"
              value={saveMessage}
              onChange={(e) => setSaveMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveVersion()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveVersion} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" title="Version history" onClick={loadVersions}>
            <History className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              View and restore previous versions of this diagram
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No versions saved yet</p>
                <p className="text-xs mt-1">Use the save button to create a version</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">v{v.version_number}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(v.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(v.id, v.version_number)}
                      disabled={isRestoring === v.id}
                    >
                      {isRestoring === v.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
