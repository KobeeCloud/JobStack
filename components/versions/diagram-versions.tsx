'use client'

import { useState, useMemo } from 'react'
import { Node, Edge } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  History, Save, RotateCcw, GitBranch, Eye, Trash2,
  X, Plus, Check, Calendar, User, Tag
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export interface DiagramVersion {
  id: string
  version: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  createdAt: Date
  createdBy: string
  tags?: string[]
  isAutosave?: boolean
}

interface DiagramVersionsProps {
  currentNodes: Node[]
  currentEdges: Edge[]
  versions: DiagramVersion[]
  currentUserId: string
  onSaveVersion: (name: string, description?: string) => void
  onRestoreVersion: (version: DiagramVersion) => void
  onDeleteVersion: (versionId: string) => void
  onPreviewVersion: (version: DiagramVersion) => void
  onClose: () => void
}

export function DiagramVersions({
  currentNodes,
  currentEdges,
  versions,
  currentUserId,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  onPreviewVersion,
  onClose,
}: DiagramVersionsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionDescription, setVersionDescription] = useState('')
  const [restoreTarget, setRestoreTarget] = useState<DiagramVersion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DiagramVersion | null>(null)

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [versions])

  const handleSave = () => {
    if (!versionName.trim()) return
    onSaveVersion(versionName.trim(), versionDescription.trim() || undefined)
    setVersionName('')
    setVersionDescription('')
    setShowSaveDialog(false)
  }

  const handleRestore = () => {
    if (restoreTarget) {
      onRestoreVersion(restoreTarget)
      setRestoreTarget(null)
    }
  }

  const handleDelete = () => {
    if (deleteTarget) {
      onDeleteVersion(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const getChangesSummary = (version: DiagramVersion) => {
    const nodesDiff = version.nodes.length - currentNodes.length
    const edgesDiff = version.edges.length - currentEdges.length

    const parts = []
    if (nodesDiff !== 0) {
      parts.push(`${nodesDiff > 0 ? '+' : ''}${nodesDiff} nodes`)
    }
    if (edgesDiff !== 0) {
      parts.push(`${edgesDiff > 0 ? '+' : ''}${edgesDiff} connections`)
    }

    return parts.length > 0 ? parts.join(', ') : 'No changes'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Version History</CardTitle>
            <Badge variant="secondary">{versions.length}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Save and restore diagram versions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Save new version button */}
        <Button onClick={() => setShowSaveDialog(true)} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Current Version
        </Button>

        {/* Current state summary */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current state</span>
            <Badge variant="outline">
              {currentNodes.length} nodes, {currentEdges.length} connections
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Versions list */}
        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-4">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No versions saved yet</p>
                <p className="text-xs">Save a version to track changes</p>
              </div>
            ) : (
              sortedVersions.map((version, index) => (
                <div
                  key={version.id}
                  className="p-3 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">
                          {version.name}
                        </span>
                        {version.isAutosave && (
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>

                      {version.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {version.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.createdBy}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {version.nodes.length} nodes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {version.edges.length} connections
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          v{version.version}
                        </span>
                      </div>

                      {version.tags && version.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {version.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onPreviewVersion(version)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setRestoreTarget(version)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteTarget(version)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Save Version Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Version</AlertDialogTitle>
            <AlertDialogDescription>
              Create a snapshot of the current diagram state
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-name">Version Name</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g., Initial architecture, Added load balancer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version-description">Description (optional)</Label>
              <Input
                id="version-description"
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="Describe what changed in this version"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setVersionName('')
              setVersionDescription('')
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={!versionName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current diagram with version &ldquo;{restoreTarget?.name}&rdquo;.
              Make sure to save your current work first if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete version &ldquo;{deleteTarget?.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// Hook for version management
export function useDiagramVersions(diagramId: string) {
  const [versions, setVersions] = useState<DiagramVersion[]>([])
  const [versionCounter, setVersionCounter] = useState(1)

  const saveVersion = (
    nodes: Node[],
    edges: Edge[],
    name: string,
    description?: string,
    isAutosave = false
  ) => {
    const newVersion: DiagramVersion = {
      id: `v-${Date.now()}`,
      version: `${versionCounter}.0`,
      name,
      description,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      createdAt: new Date(),
      createdBy: 'Current User', // TODO: Get from auth
      isAutosave,
    }

    setVersions(prev => [...prev, newVersion])
    setVersionCounter(prev => prev + 1)

    return newVersion
  }

  const deleteVersion = (versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId))
  }

  return {
    versions,
    saveVersion,
    deleteVersion,
    setVersions,
  }
}
