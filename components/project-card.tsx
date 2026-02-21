'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical, Trash2, Edit, Copy, ExternalLink, Loader2, GitBranch } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
}

interface ProjectCardProps {
  project: Project
  onDelete?: () => void
  onUpdate?: () => void
}

export function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editDescription, setEditDescription] = useState(project.description || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateEnv, setDuplicateEnv] = useState<'dev' | 'staging' | 'production'>('dev')

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      toast.success('Project deleted successfully')
      onDelete?.()
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete project')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const envSuffix = duplicateEnv === 'dev' ? 'DEV' : duplicateEnv === 'staging' ? 'STAGING' : 'PROD'
    const newName = duplicateName.trim() || `${project.name} (${envSuffix})`
    // Replica multiplier: staging 2x, production 3x relative to dev
    const replicaMultiplier = duplicateEnv === 'staging' ? 2 : duplicateEnv === 'production' ? 3 : 1
    try {
      // Create a copy of the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: project.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate project')
      }

      const newProject = await response.json()

      // Copy diagrams from original project and scale replicas
      try {
        const diagramsRes = await fetch(`/api/diagrams?project_id=${project.id}`)
        if (diagramsRes.ok) {
          const diagramsData = await diagramsRes.json()
          const diagrams = diagramsData?.data || diagramsData || []
          for (const diagram of diagrams) {
            const scaledNodes = (diagram.nodes || []).map((node: any) => {
              const replicas = node.data?.config?.replicas
              if (replicas && replicaMultiplier > 1) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...node.data.config, replicas: replicas * replicaMultiplier },
                  },
                }
              }
              return node
            })
            await fetch('/api/diagrams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: newProject.id,
                name: diagram.name || 'Main Diagram',
                nodes: scaledNodes,
                edges: diagram.edges || [],
                viewport: diagram.viewport || { x: 0, y: 0, zoom: 1 },
              }),
            })
          }
        }
      } catch {
        // Diagram copy failed — project still created, just empty
        console.warn('Failed to copy diagrams, project created without diagrams')
      }

      toast.success('Project duplicated', { description: `Created "${newName}"` })
      setShowDuplicateDialog(false)
      router.refresh()
      router.push(`/projects/${newProject.id}`)
    } catch (error) {
      toast.error('Failed to duplicate project')
      console.error('Duplicate error:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast.success('Project updated successfully')
      onUpdate?.()
      setShowEditDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update project')
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full group relative">
        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" aria-label={`Open project ${project.name}`} />

        <CardHeader className="relative z-10 pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <CardTitle className="truncate">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description || 'No description'}
              </CardDescription>
            </div>
            <div className="pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Project actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/projects/${project.id}`)
                    }}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditName(project.name)
                      setEditDescription(project.description || '')
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setDuplicateName('')
                      setDuplicateEnv('dev')
                      setShowDuplicateDialog(true)
                    }}
                    disabled={isDuplicating}
                  >
                    {isDuplicating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteDialog(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pointer-events-none">
          <div className="text-xs text-muted-foreground">
            Updated {new Date(project.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
              All diagrams and data associated with this project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Project name"
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-400" />
              Duplicate Project
            </DialogTitle>
            <DialogDescription>
              Creates a copy of &ldquo;{project.name}&rdquo; including all diagrams. Use environment promotion to scale replicas automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dupName">New Project Name</Label>
              <Input
                id="dupName"
                placeholder={`${project.name} (${duplicateEnv.toUpperCase()})`}
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Environment</Label>
              <Select value={duplicateEnv} onValueChange={(v: any) => setDuplicateEnv(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Development (1× replicas)</SelectItem>
                  <SelectItem value="staging">Staging (2× replicas)</SelectItem>
                  <SelectItem value="production">Production (3× replicas)</SelectItem>
                </SelectContent>
              </Select>
              {duplicateEnv !== 'dev' && (
                <p className="text-xs text-muted-foreground">
                  Nodes with a &ldquo;Replicas&rdquo; config will be scaled automatically.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)} disabled={isDuplicating}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={isDuplicating}>
              {isDuplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
