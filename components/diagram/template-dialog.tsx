'use client'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { COMPONENT_CATALOG } from '@/lib/catalog'

interface Template {
  id: string
  name: string
  description: string
  category: string
  cloud_provider?: string
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
  const [providerFilter, setProviderFilter] = useState<string>('all')

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
    startup: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    microservices: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'side-project': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'data-pipeline': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    gaming: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  }

  const providerColors: Record<string, string> = {
    aws: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    azure: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    gcp: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }

  // Calculate estimated monthly cost from template nodes using catalog data
  const getTemplateCost = (template: Template): number => {
    return (template.data?.nodes || []).reduce((total: number, node: any) => {
      const componentId = node.data?.componentId
      if (!componentId) return total
      const catalogItem = COMPONENT_CATALOG.find(c => c.id === componentId)
      if (!catalogItem) return total
      // Use min cost as estimate
      return total + (catalogItem.estimatedCost?.min || 0)
    }, 0)
  }

  const providers = [
    'all',
    ...Array.from(new Set(templates.map(t => t.cloud_provider).filter(Boolean))),
  ]

  const filteredTemplates =
    providerFilter === 'all'
      ? templates
      : templates.filter(t => t.cloud_provider === providerFilter)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a pre-built architecture template to get started quickly
          </DialogDescription>
        </DialogHeader>

        {/* Provider filter tabs */}
        {providers.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {providers.map(p => (
              <Button
                key={p}
                variant={providerFilter === p ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
                onClick={() => setProviderFilter(p!)}
              >
                {p === 'all' ? 'All Providers' : p?.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1">
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
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 p-1">
              {filteredTemplates.map(template => {
                const estimatedCost = getTemplateCost(template)
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                    onClick={() => {
                      onApply(template)
                      onClose()
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                        <div className="flex gap-1 flex-shrink-0">
                          {template.cloud_provider && (
                            <Badge
                              className={`text-xs ${providerColors[template.cloud_provider] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {template.cloud_provider.toUpperCase()}
                            </Badge>
                          )}
                          <Badge
                            className={`text-xs ${categoryColors[template.category] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{template.data?.nodes?.length || 0} components</span>
                        {estimatedCost > 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            ~${estimatedCost}/mo
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
