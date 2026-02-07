'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CustomComponentRecord {
  id: string
  organization_id: string
  created_by: string | null
  name: string
  description: string | null
  category: string
  icon: string
  color: string
  provider: string
  default_config: Record<string, unknown>
  connection_rules: string[]
  is_shared: boolean
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface UseCustomComponentsOptions {
  organizationId?: string | null
}

export function useCustomComponents({ organizationId }: UseCustomComponentsOptions = {}) {
  const [components, setComponents] = useState<CustomComponentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComponents = useCallback(async () => {
    if (!organizationId) {
      setComponents([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/custom-components?organization_id=${organizationId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch components')
      }
      const data = await res.json()
      setComponents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchComponents()
  }, [fetchComponents])

  // Subscribe to realtime changes
  useEffect(() => {
    if (!organizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`custom-components-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_components',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          fetchComponents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, fetchComponents])

  const createComponent = useCallback(
    async (data: {
      name: string
      description?: string
      category?: string
      icon?: string
      color?: string
      provider?: string
      default_config?: Record<string, unknown>
      connection_rules?: string[]
    }) => {
      if (!organizationId) throw new Error('No organization selected')

      const res = await fetch('/api/custom-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, organization_id: organizationId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create component')
      }

      const component = await res.json()
      setComponents((prev) => [...prev, component])
      return component as CustomComponentRecord
    },
    [organizationId]
  )

  const updateComponent = useCallback(
    async (id: string, data: Partial<CustomComponentRecord>) => {
      const res = await fetch(`/api/custom-components/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update component')
      }

      const updated = await res.json()
      setComponents((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return updated as CustomComponentRecord
    },
    []
  )

  const deleteComponent = useCallback(async (id: string) => {
    const res = await fetch(`/api/custom-components/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to delete component')
    }

    setComponents((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const duplicateComponent = useCallback(
    async (component: CustomComponentRecord) => {
      return createComponent({
        name: `${component.name} (Copy)`,
        description: component.description || undefined,
        category: component.category,
        icon: component.icon,
        color: component.color,
        provider: component.provider,
        default_config: component.default_config,
        connection_rules: component.connection_rules,
      })
    },
    [createComponent]
  )

  return {
    components,
    loading,
    error,
    fetchComponents,
    createComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
  }
}
