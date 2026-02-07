'use client'
import { useState, useMemo, useRef, useCallback } from 'react'
import { ComponentConfig, CloudProvider, ServiceType } from '@/lib/catalog'
import { LucideIcon, Search, X, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ComponentPaletteProps {
  components: ComponentConfig[]
  onDragStart: (e: React.DragEvent, component: ComponentConfig) => void
  cloudProvider?: CloudProvider // Filter by this provider
  projectTypes?: ServiceType[] // Filter by these types (iaas, paas, saas)
}

export function ComponentPalette({
  components,
  onDragStart,
  cloudProvider,
  projectTypes
}: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const dragImageRef = useRef<HTMLDivElement>(null)

  // Custom drag start handler with proper drag image
  const handleDragStart = useCallback((e: React.DragEvent, component: ComponentConfig) => {
    // Create custom drag image
    const dragImage = document.createElement('div')
    dragImage.className = 'fixed pointer-events-none bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2 z-50'
    dragImage.style.width = '180px'
    dragImage.innerHTML = `
      <span class="text-sm font-medium">${component.name}</span>
    `
    document.body.appendChild(dragImage)

    // Position off-screen initially
    dragImage.style.top = '-1000px'
    dragImage.style.left = '-1000px'

    // Set as drag image
    e.dataTransfer.setDragImage(dragImage, 90, 20)

    // Clean up after drag ends
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)

    // Call the original onDragStart
    onDragStart(e, component)
  }, [onDragStart])

  // Filter components by provider and service type
  const providerFilteredComponents = useMemo(() => {
    let filtered = components

    // Filter by cloud provider - STRICT filtering
    if (cloudProvider) {
      filtered = filtered.filter((c) => {
        // Only include components without provider (generic) OR exact match
        if (!c.provider || c.provider === 'generic') return true
        return c.provider === cloudProvider
      })
    }

    // Filter by project types (iaas, paas, saas)
    if (projectTypes && projectTypes.length > 0) {
      filtered = filtered.filter((c) => {
        // Include generic components OR matching service type
        if (!c.serviceType || c.serviceType === 'generic') return true
        return projectTypes.includes(c.serviceType)
      })
    }

    return filtered
  }, [components, cloudProvider, projectTypes])

  const categories = Array.from(new Set(providerFilteredComponents.map((c) => c.category)))

  const filteredComponents = useMemo(() => {
    let filtered = providerFilteredComponents

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [providerFilteredComponents, searchQuery, selectedCategory])

  const filteredCategories = Array.from(new Set(filteredComponents.map((c) => c.category)))

  // Category display names
  const categoryNames: Record<string, string> = {
    networking: '🌐 Networking',
    compute: '💻 Compute',
    storage: '💾 Storage',
    security: '🔒 Security',
    database: '🗄️ Database',
    containers: '📦 Containers',
    cloud: '☁️ Cloud Services',
    frontend: '🎨 Frontend',
    backend: '⚙️ Backend',
    service: '🔧 Services',
    devops: '🚀 DevOps',
    analytics: '📊 Analytics',
    ai: '🤖 AI/ML',
    monitoring: '📈 Monitoring',
    identity: '🔑 Identity',
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="p-4 border-b space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Components</h3>
          {cloudProvider && (
            <Badge variant="outline" className="text-xs capitalize">
              {cloudProvider}
            </Badge>
          )}
        </div>
        {projectTypes && projectTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {projectTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs uppercase">
                {type}
              </Badge>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
            aria-label="Search components"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories ({providerFilteredComponents.length})</SelectItem>
            {categories.map((category) => {
              const count = providerFilteredComponents.filter(c => c.category === category).length
              return (
                <SelectItem key={category} value={category}>
                  {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComponents.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No components found</p>
            {cloudProvider && (
              <p className="text-xs mt-1">for {cloudProvider.toUpperCase()}</p>
            )}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const categoryComponents = filteredComponents.filter((c) => c.category === category)
            return (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className="ml-1 text-xs">({categoryComponents.length})</span>
                </h4>
                <div className="space-y-2">
                  {categoryComponents.map((component) => {
                    const Icon = component.icon as LucideIcon
                    return (
                      <Card
                        key={component.id}
                        className="p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Drag ${component.name} component`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: component.color }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{component.name}</span>
                            {component.estimatedCost.max > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ${component.estimatedCost.min}-${component.estimatedCost.max}/mo
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Hover tooltip with description */}
                        <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-50 w-48 p-2 bg-popover border rounded-md shadow-md text-xs">
                          {component.description}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
