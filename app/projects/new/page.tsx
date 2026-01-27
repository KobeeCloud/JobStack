'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, ArrowLeft, Loader2 } from 'lucide-react'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validation/schemas'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { useToast } from '@/hooks/use-toast'
import { TemplateDialog } from '@/components/diagram/template-dialog'
import type { Node, Edge } from '@xyflow/react'

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  })

  const handleCreate = async (data: CreateProjectInput) => {
    setLoading(true)
    try {
      const res = await fetchWithTimeout(
        '/api/projects',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        10000
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const project = await res.json()
      toast({ title: 'Project Created', description: 'Your project has been created successfully' })
      router.push(`/projects/${project.id || project.data?.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (template: { data: { nodes: Node[]; edges: Edge[] } }) => {
    // Create project first, then apply template
    const form = document.querySelector('form')
    if (!form) return

    const formData = new FormData(form)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) {
      toast({
        title: 'Error',
        description: 'Please enter a project name first',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Create project
      const res = await fetchWithTimeout(
        '/api/projects',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        },
        10000
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const project = await res.json()
      const projectId = project.id || project.data?.id

      // Create diagram with template data
      const diagramRes = await fetchWithTimeout(
        '/api/diagrams',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            name: 'Main Diagram',
            data: template.data,
          }),
        },
        10000
      )

      if (!diagramRes.ok) {
        throw new Error('Failed to apply template')
      }

      toast({
        title: 'Project Created',
        description: 'Your project has been created with the selected template',
      })
      router.push(`/projects/${projectId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  // Check if user came from template link
  const fromTemplate = searchParams.get('from') === 'template'

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back
            </Button>
          </Link>
          <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-bold text-xl">JobStack</span>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Infrastructure Project"
                  {...register('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your infrastructure..."
                  {...register('description')}
                  rows={4}
                  aria-invalid={errors.description ? 'true' : 'false'}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-destructive" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  disabled={loading}
                >
                  Use Template
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <TemplateDialog
        open={showTemplates || fromTemplate}
        onClose={() => setShowTemplates(false)}
        onApply={handleApplyTemplate}
      />
    </div>
  )
}
