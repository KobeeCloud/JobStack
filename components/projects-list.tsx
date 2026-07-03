'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, FolderOpen, Search, X } from 'lucide-react'
import { ProjectCard } from '@/components/project-card'

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  created_at: string
  status: string
  cloud_provider: string
}

interface ProjectsListProps {
  projects: Project[]
}

const providerColors: Record<string, string> = {
  aws: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  azure: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  gcp: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  vercel: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  netlify: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  cloudflare: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated')

  const providers = useMemo(
    () => Array.from(new Set(projects.map(p => p.cloud_provider).filter(Boolean))),
    [projects]
  )

  const filtered = useMemo(() => {
    let list = projects

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
      )
    }
    if (providerFilter !== 'all') {
      list = list.filter(p => p.cloud_provider === providerFilter)
    }
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter)
    }

    if (sortBy === 'updated') {
      list = [...list].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    } else if (sortBy === 'created') {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [projects, search, providerFilter, statusFilter, sortBy])

  const hasFilters = search.trim() || providerFilter !== 'all' || statusFilter !== 'all'

  return (
    <>
      {/* Toolbar: search + filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {providers.length > 1 && (
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {providers.map(p => (
                <SelectItem key={p} value={p}>
                  {p.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last updated</SelectItem>
            <SelectItem value="created">Date created</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setProviderFilter('all')
              setStatusFilter('all')
            }}
            className="text-muted-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            {hasFilters ? (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No matching projects</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setProviderFilter('all')
                    setStatusFilter('all')
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first cloud infrastructure project to get started.
                </p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <div key={project.id} className="relative">
              <ProjectCard project={project} />
              <div className="absolute top-3 right-12 z-10">
                <Badge variant="secondary" className={providerColors[project.cloud_provider] || ''}>
                  {project.cloud_provider?.toUpperCase() || 'N/A'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
