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
import { MoreVertical, Trash2, Edit, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteDialog } from './delete-dialog'
import { EditDialog } from './edit-dialog'
import { DuplicateDialog } from './duplicate-dialog'

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
    const replicaMultiplier = duplicateEnv === 'staging' ? 2 : duplicateEnv === 'production' ? 3 : 1
    try {
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
      <Card className="hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full group relative bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" aria-label={`Open project ${project.name}`} />

        <CardHeader className="relative z-10 pointer-events-none pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <CardTitle className="truncate text-xl font-bold group-hover:text-primary transition-colors mb-2">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm leading-relaxed min-h-[40px]">
                {project.description || 'No description provided'}
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

        <CardContent className="relative z-10 pointer-events-none pt-0 mt-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-4 pt-4 border-t border-border/50">
            <div className="h-2 w-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
            Updated {new Date(project.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        projectName={project.name}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />

      <EditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        isUpdating={isUpdating}
        onSave={handleUpdate}
      />

      <DuplicateDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        projectName={project.name}
        duplicateName={duplicateName}
        setDuplicateName={setDuplicateName}
        duplicateEnv={duplicateEnv}
        setDuplicateEnv={setDuplicateEnv}
        isDuplicating={isDuplicating}
        onDuplicate={handleDuplicate}
      />
    </>
  )
}
