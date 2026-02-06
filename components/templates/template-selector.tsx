'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ARCHITECTURE_TEMPLATES, ArchitectureTemplate } from '@/lib/templates/architecture-templates'
import { Search, Cloud, Server, Database, Cpu, GitBranch, DollarSign, Layers } from 'lucide-react'

interface TemplateSelectorProps {
  onSelectTemplate: (template: ArchitectureTemplate) => void
}

const categoryIcons = {
  web: Cloud,
  microservices: Server,
  data: Database,
  ml: Cpu,
  devops: GitBranch,
}

const providerColors = {
  aws: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  azure: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  gcp: 'bg-red-500/10 text-red-600 border-red-500/20',
  'multi-cloud': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
}

const complexityColors = {
  basic: 'bg-green-500/10 text-green-600',
  intermediate: 'bg-yellow-500/10 text-yellow-600',
  advanced: 'bg-red-500/10 text-red-600',
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<ArchitectureTemplate | null>(null)

  const filteredTemplates = useMemo(() => {
    return ARCHITECTURE_TEMPLATES.filter(t => {
      const matchesSearch = !search || 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      const matchesProvider = providerFilter === 'all' || t.provider === providerFilter

      return matchesSearch && matchesCategory && matchesProvider
    })
  }, [search, categoryFilter, providerFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="web">Web Apps</SelectItem>
            <SelectItem value="microservices">Microservices</SelectItem>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="ml">ML/AI</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
          </SelectContent>
        </Select>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="aws">AWS</SelectItem>
            <SelectItem value="azure">Azure</SelectItem>
            <SelectItem value="gcp">GCP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const CategoryIcon = categoryIcons[template.category] || Layers
          return (
            <Dialog key={template.id}>
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CategoryIcon className="h-8 w-8 text-primary" />
                      <Badge variant="outline" className={providerColors[template.provider]}>
                        {template.provider.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className={complexityColors[template.complexity]}>
                        {template.complexity}
                      </Badge>
                      {template.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${template.estimatedCost.min} - ${template.estimatedCost.max}/mo
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    {template.name}
                  </DialogTitle>
                  <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={providerColors[template.provider]}>
                      {template.provider.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className={complexityColors[template.complexity]}>
                      {template.complexity}
                    </Badge>
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div>
                      <p className="text-sm text-muted-foreground">Components</p>
                      <p className="text-2xl font-bold">{template.nodes.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="text-2xl font-bold">${template.estimatedCost.min} - ${template.estimatedCost.max}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Included Components:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.nodes.map(node => (
                        <Badge key={node.id} variant="secondary" className="text-xs">
                          {String(node.data?.label || node.id)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
