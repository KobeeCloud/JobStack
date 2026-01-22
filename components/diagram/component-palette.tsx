'use client'
import { ComponentConfig } from '@/lib/catalog'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ComponentPaletteProps {
  components: ComponentConfig[]
  onDragStart: (e: React.DragEvent, component: ComponentConfig) => void
}

export function ComponentPalette({ components, onDragStart }: ComponentPaletteProps) {
  const categories = Array.from(new Set(components.map(c => c.category)))

  return (
    <div className="w-64 border-r bg-muted/20 p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Components</h3>
      {categories.map(category => {
        const categoryComponents = components.filter(c => c.category === category)
        return (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">{category}</h4>
            <div className="space-y-2">
              {categoryComponents.map(component => {
                const Icon = component.icon as LucideIcon
                return (
                  <Card
                    key={component.id}
                    className="p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                    draggable
                    onDragStart={(e) => onDragStart(e, component)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: component.color }} />
                      <span className="text-sm font-medium">{component.name}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
