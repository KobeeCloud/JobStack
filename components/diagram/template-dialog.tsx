'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

interface Template {
  id: string
  name: string
  description: string
  category: string
  data: {
    nodes: any[]
    edges: any[]
  }
}

interface TemplateDialogProps {
  open: boolean
  onClose: () => void
  onApply: (template: Template) => void
}

export function TemplateDialog({ open, onClose, onApply }: TemplateDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/api/templates', {}, 10000)
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json()
      setTemplates(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const categoryColors: Record<string, string> = {
    startup: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800',
    microservices: 'bg-green-100 text-green-800',
    'side-project': 'bg-yellow-100 text-yellow-800',
    gaming: 'bg-pink-100 text-pink-800',
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>Select a pre-built architecture template to get started quickly</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadTemplates} variant="outline">
              Retry
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  onApply(template)
                  onClose()
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{template.name}</CardTitle>
                    <Badge className={categoryColors[template.category] || 'bg-gray-100 text-gray-800'}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {template.data?.nodes?.length || 0} components
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
