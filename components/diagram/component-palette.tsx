'use client'
import { useState, useMemo } from 'react'
import { ComponentConfig } from '@/lib/catalog'
import { LucideIcon, Search, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
}

export function ComponentPalette({ components, onDragStart }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = Array.from(new Set(components.map((c) => c.category)))

  const filteredComponents = useMemo(() => {
    let filtered = components

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
  }, [components, searchQuery, selectedCategory])

  const filteredCategories = Array.from(new Set(filteredComponents.map((c) => c.category)))

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold">Components</h3>
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
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComponents.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No components found
          </div>
        ) : (
          filteredCategories.map((category) => {
            const categoryComponents = filteredComponents.filter((c) => c.category === category)
            return (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryComponents.map((component) => {
                    const Icon = component.icon as LucideIcon
                    return (
                      <Card
                        key={component.id}
                        className="p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                        draggable
                        onDragStart={(e) => onDragStart(e, component)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Drag ${component.name} component`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: component.color }} />
                          <span className="text-sm font-medium">{component.name}</span>
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
