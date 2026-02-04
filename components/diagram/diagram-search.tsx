'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, X, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { Node } from '@xyflow/react'
import { COMPONENT_CATALOG } from '@/lib/catalog'

interface DiagramSearchProps {
  nodes: Node[]
  onHighlightNode: (nodeId: string | null) => void
  onFitNode: (nodeId: string) => void
}

export function DiagramSearch({ nodes, onHighlightNode, onFitNode }: DiagramSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Node[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterProvider, setFilterProvider] = useState<string | null>(null)

  // Get unique categories and providers from nodes
  const categories = Array.from(new Set(
    nodes.map(n => {
      const componentId = (n.data as any).componentId || (n.data as any).component
      const comp = COMPONENT_CATALOG.find(c => c.id === componentId)
      return comp?.category
    }).filter(Boolean)
  ))

  const providers = Array.from(new Set(
    nodes.map(n => (n.data as any).provider).filter(Boolean)
  ))

  // Search logic
  useEffect(() => {
    if (!searchQuery && !filterCategory && !filterProvider) {
      setResults([])
      return
    }

    const filtered = nodes.filter(node => {
      const data = node.data as any
      const label = String(data.label || '').toLowerCase()
      const componentId = data.componentId || data.component || ''
      const component = COMPONENT_CATALOG.find(c => c.id === componentId)
      const provider = String(data.provider || '').toLowerCase()
      const query = searchQuery.toLowerCase()

      // Text search
      const matchesQuery = !searchQuery ||
        label.includes(query) ||
        componentId.toLowerCase().includes(query) ||
        component?.name.toLowerCase().includes(query)

      // Category filter
      const matchesCategory = !filterCategory || component?.category === filterCategory

      // Provider filter
      const matchesProvider = !filterProvider || data.provider === filterProvider

      return matchesQuery && matchesCategory && matchesProvider
    })

    setResults(filtered)
    setSelectedIndex(0)
  }, [searchQuery, filterCategory, filterProvider, nodes])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        onFitNode(results[selectedIndex].id)
        onHighlightNode(results[selectedIndex].id)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        onHighlightNode(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onFitNode, onHighlightNode])

  // Highlight on hover
  useEffect(() => {
    if (results[selectedIndex]) {
      onHighlightNode(results[selectedIndex].id)
    }
  }, [selectedIndex, results, onHighlightNode])

  // Open with Ctrl/Cmd + F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === 'f') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleResultClick = (nodeId: string) => {
    onFitNode(nodeId)
    onHighlightNode(nodeId)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterCategory(null)
    setFilterProvider(null)
    setResults([])
    onHighlightNode(null)
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/90 backdrop-blur shadow-md"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Components
            <kbd className="ml-2 text-[10px] bg-muted px-1 rounded">⌘F</kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-3" align="center">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
                autoFocus
              />
              {(searchQuery || filterCategory || filterProvider) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      {filterCategory || 'Category'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1">
                    <div className="space-y-1">
                      <Button
                        variant={filterCategory === null ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setFilterCategory(null)}
                      >
                        All Categories
                      </Button>
                      {categories.map(cat => (
                        <Button
                          key={cat}
                          variant={filterCategory === cat ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setFilterCategory(cat as string)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {providers.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      {filterProvider?.toUpperCase() || 'Provider'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1">
                    <div className="space-y-1">
                      <Button
                        variant={filterProvider === null ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setFilterProvider(null)}
                      >
                        All
                      </Button>
                      {providers.map(prov => (
                        <Button
                          key={prov}
                          variant={filterProvider === prov ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setFilterProvider(prov as string)}
                        >
                          {(prov as string).toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="border rounded-md max-h-60 overflow-auto">
                <div className="p-2 text-xs text-muted-foreground border-b bg-muted/50">
                  {results.length} result{results.length !== 1 ? 's' : ''} • Use ↑↓ to navigate
                </div>
                {results.map((node, idx) => {
                  const data = node.data as any
                  const componentId = data.componentId || data.component
                  const component = COMPONENT_CATALOG.find(c => c.id === componentId)

                  return (
                    <div
                      key={node.id}
                      className={`p-2 cursor-pointer flex items-center gap-2 ${
                        idx === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleResultClick(node.id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="text-xl">{data.icon || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{data.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {component?.name || componentId}
                        </div>
                      </div>
                      {data.provider && (
                        <Badge variant="outline" className="text-[10px]">
                          {data.provider.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* No results */}
            {(searchQuery || filterCategory || filterProvider) && results.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No components found
              </div>
            )}

            {/* Navigation hint */}
            {results.length > 1 && (
              <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                <kbd className="px-1 bg-muted rounded">↑</kbd>
                <kbd className="px-1 bg-muted rounded">↓</kbd>
                <span>navigate</span>
                <kbd className="px-1 bg-muted rounded">Enter</kbd>
                <span>select</span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
