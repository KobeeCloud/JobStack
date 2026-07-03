'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Webhook, Eye, EyeOff, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const AVAILABLE_EVENTS = [
  'project.created',
  'project.updated',
  'project.deleted',
  'diagram.saved',
  'diagram.exported',
  'member.joined',
  'member.removed',
]

interface WebhookItem {
  id: string
  name: string
  url: string
  secret: string
  events: string[]
  is_active: boolean
  last_triggered_at: string | null
  failure_count: number
  created_at: string
}

export function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Form state
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const supabase = createClient()

  const loadWebhooks = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWebhooks(data || [])
    } catch {
      toast.error('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadWebhooks()
  }, [loadWebhooks])

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('webhooks').insert({
        user_id: user.id,
        name: name.trim(),
        url: url.trim(),
        events: selectedEvents,
        is_active: true,
      })

      if (error) throw error

      toast.success('Webhook created')
      setName('')
      setUrl('')
      setSelectedEvents([])
      setCreateOpen(false)
      loadWebhooks()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create webhook')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      setWebhooks(prev => prev.map(w => (w.id === id ? { ...w, is_active: !isActive } : w)))
    } catch {
      toast.error('Failed to update webhook')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', id)
      if (error) throw error
      setWebhooks(prev => prev.filter(w => w.id !== id))
      toast.success('Webhook deleted')
    } catch {
      toast.error('Failed to delete webhook')
    }
  }

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </h3>
          <p className="text-sm text-muted-foreground">
            Receive notifications when events happen in your projects
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Configure an endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wh-name">Name</Label>
                <Input
                  id="wh-name"
                  placeholder="My Webhook"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-url">Payload URL</Label>
                <Input
                  id="wh-url"
                  placeholder="https://example.com/webhook"
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <Badge
                      key={event}
                      variant={selectedEvents.includes(event) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleEvent(event)}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to select events. Leave empty to receive all events.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={saving || !name.trim() || !url.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Webhook className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No webhooks configured</p>
          <p className="text-xs mt-1">Add a webhook to receive event notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(wh => (
            <div key={wh.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{wh.name}</h4>
                    {!wh.is_active && <Badge variant="secondary">Inactive</Badge>}
                    {wh.failure_count > 0 && (
                      <Badge variant="destructive">{wh.failure_count} failures</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{wh.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={wh.is_active}
                    onCheckedChange={() => toggleActive(wh.id, wh.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(wh.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Secret */}
              <div className="flex items-center gap-2 bg-muted/50 rounded p-2">
                <span className="text-xs text-muted-foreground">Secret:</span>
                <code className="text-xs flex-1 truncate">
                  {showSecrets[wh.id] ? wh.secret : '••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowSecrets(prev => ({ ...prev, [wh.id]: !prev[wh.id] }))}
                >
                  {showSecrets[wh.id] ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copySecret(wh.secret)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {/* Events */}
              {wh.events.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {wh.events.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Last triggered */}
              {wh.last_triggered_at && (
                <p className="text-xs text-muted-foreground">
                  Last triggered: {new Date(wh.last_triggered_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
