'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  useCustomComponents,
  type CustomComponentRecord,
} from '@/hooks/use-custom-components'
import {
  Plus,
  Trash2,
  Copy,
  Edit3,
  Save,
  Box,
  Palette,
  Search,
  Loader2,
  GripVertical,
  Settings2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

const PRESET_ICONS = [
  '📦', '🔧', '⚙️', '🌐', '💾', '🔒', '📊', '🚀', '💻', '☁️',
  '🔥', '⚡', '🎯', '📡', '🔌', '🗄️', '🔑', '📈', '🤖', '🛡️',
  '🎛️', '📱', '🖥️', '🧩', '🔗', '💡', '🧪', '🏗️', '📝', '🔍',
]

const CATEGORIES = [
  { value: 'custom', label: 'Custom' },
  { value: 'compute', label: 'Compute' },
  { value: 'storage', label: 'Storage' },
  { value: 'database', label: 'Database' },
  { value: 'networking', label: 'Networking' },
  { value: 'security', label: 'Security' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'container', label: 'Container' },
  { value: 'serverless', label: 'Serverless' },
  { value: 'ai-ml', label: 'AI / ML' },
  { value: 'devops', label: 'DevOps' },
  { value: 'other', label: 'Other' },
]

const PROVIDERS = [
  { value: 'custom', label: 'Custom' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
  { value: 'generic', label: 'Generic' },
]

// ============================================================================
// Component Editor Dialog
// ============================================================================

interface ComponentEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  component?: CustomComponentRecord | null
  onSave: (data: {
    name: string
    description?: string
    category?: string
    icon?: string
    color?: string
    provider?: string
    default_config?: Record<string, unknown>
    connection_rules?: string[]
  }) => Promise<void>
  saving?: boolean
}

function ComponentEditorDialog({
  open,
  onOpenChange,
  component,
  onSave,
  saving,
}: ComponentEditorDialogProps) {
  const [name, setName] = useState(component?.name || '')
  const [description, setDescription] = useState(component?.description || '')
  const [category, setCategory] = useState(component?.category || 'custom')
  const [icon, setIcon] = useState(component?.icon || '📦')
  const [color, setColor] = useState(component?.color || '#6366f1')
  const [provider, setProvider] = useState(component?.provider || 'custom')
  const [connectionRules, setConnectionRules] = useState<string[]>(
    component?.connection_rules || []
  )
  const [newRule, setNewRule] = useState('')

  // Reset form when component changes
  useState(() => {
    if (component) {
      setName(component.name)
      setDescription(component.description || '')
      setCategory(component.category)
      setIcon(component.icon)
      setColor(component.color)
      setProvider(component.provider)
      setConnectionRules(component.connection_rules || [])
    } else {
      setName('')
      setDescription('')
      setCategory('custom')
      setIcon('📦')
      setColor('#6366f1')
      setProvider('custom')
      setConnectionRules([])
    }
  })

  const handleSubmit = async () => {
    await onSave({
      name,
      description: description || undefined,
      category,
      icon,
      color,
      provider,
      connection_rules: connectionRules,
    })
    onOpenChange(false)
  }

  const addConnectionRule = () => {
    if (newRule.trim() && !connectionRules.includes(newRule.trim())) {
      setConnectionRules([...connectionRules, newRule.trim()])
      setNewRule('')
    }
  }

  const removeConnectionRule = (rule: string) => {
    setConnectionRules(connectionRules.filter((r) => r !== rule))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            {component ? 'Edit Component' : 'Create Custom Component'}
          </DialogTitle>
          <DialogDescription>
            {component
              ? 'Update the component settings below'
              : 'Design a reusable component for your organization'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-5 py-2">
            {/* Preview */}
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 shadow-sm"
                style={{
                  borderColor: color,
                  backgroundColor: `${color}10`,
                }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-medium">{name || 'Component Name'}</span>
                <Badge variant="outline" className="text-[10px] ml-2">
                  {provider.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="comp-name">Name *</Label>
              <Input
                id="comp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Redis Cluster"
                maxLength={64}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="comp-desc">Description</Label>
              <Input
                id="comp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this component do?"
              />
            </div>

            {/* Category & Provider */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-muted/30">
                {PRESET_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded text-lg hover:bg-muted transition-colors',
                      icon === emoji && 'bg-primary/10 ring-2 ring-primary'
                    )}
                    onClick={() => setIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="comp-color">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  id="comp-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Connection Rules */}
            <div className="space-y-2">
              <Label>Connection Rules (component IDs this can connect to)</Label>
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="e.g., aws-ec2, azure-vm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConnectionRule())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConnectionRule}
                  disabled={!newRule.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {connectionRules.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {connectionRules.map((rule) => (
                    <Badge key={rule} variant="secondary" className="gap-1">
                      {rule}
                      <button onClick={() => removeConnectionRule(rule)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            <Save className="h-4 w-4 mr-1" />
            {component ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Custom Component Library Panel (for diagram editor sidebar)
// ============================================================================

interface CustomComponentPanelProps {
  organizationId: string | null
  onDragStart: (
    e: React.DragEvent,
    component: { id: string; name: string; icon: string; color: string; category: string; provider: string }
  ) => void
  className?: string
}

export function CustomComponentPanel({
  organizationId,
  onDragStart,
  className,
}: CustomComponentPanelProps) {
  const { components, loading, createComponent, updateComponent, deleteComponent, duplicateComponent } =
    useCustomComponents({ organizationId })
  const { toast } = useToast()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<CustomComponentRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filteredComponents = search
    ? components.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase())
      )
    : components

  const grouped = filteredComponents.reduce(
    (acc, comp) => {
      const cat = comp.category || 'custom'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(comp)
      return acc
    },
    {} as Record<string, CustomComponentRecord[]>
  )

  const handleSave = useCallback(
    async (data: {
      name: string
      description?: string
      category?: string
      icon?: string
      color?: string
      provider?: string
      connection_rules?: string[]
    }) => {
      setSaving(true)
      try {
        if (editingComponent) {
          await updateComponent(editingComponent.id, data)
          toast({ title: 'Updated', description: `${data.name} updated successfully` })
        } else {
          await createComponent(data)
          toast({ title: 'Created', description: `${data.name} created successfully` })
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Operation failed',
          variant: 'destructive',
        })
        throw err // re-throw so dialog stays open
      } finally {
        setSaving(false)
        setEditingComponent(null)
      }
    },
    [editingComponent, createComponent, updateComponent, toast]
  )

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      await deleteComponent(deletingId)
      toast({ title: 'Deleted', description: 'Component deleted successfully' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }, [deletingId, deleteComponent, toast])

  const handleDuplicate = useCallback(
    async (comp: CustomComponentRecord) => {
      try {
        await duplicateComponent(comp)
        toast({ title: 'Duplicated', description: `${comp.name} duplicated` })
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to duplicate',
          variant: 'destructive',
        })
      }
    },
    [duplicateComponent, toast]
  )

  if (!organizationId) {
    return (
      <div className={cn('p-4 text-center text-sm text-muted-foreground', className)}>
        <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Join an organization to use custom components</p>
      </div>
    )
  }

  return (
    <>
      <div className={cn('flex flex-col', className)}>
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Custom Library
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingComponent(null)
              setEditorOpen(true)
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>

        {components.length > 3 && (
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Box className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  {search ? 'No matching components' : 'No custom components yet'}
                </p>
                {!search && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      setEditingComponent(null)
                      setEditorOpen(true)
                    }}
                  >
                    Create your first
                  </Button>
                )}
              </div>
            ) : (
              Object.entries(grouped).map(([category, comps]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                    {CATEGORIES.find((c) => c.value === category)?.label || category}
                    <span className="ml-1">({comps.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {comps.map((comp) => (
                      <Card
                        key={comp.id}
                        className="p-2 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/reactflow',
                            JSON.stringify({
                              type: 'custom',
                              componentId: `custom-${comp.id}`,
                              label: comp.name,
                              icon: comp.icon,
                              color: comp.color,
                              provider: comp.provider,
                              category: comp.category,
                              isCustom: true,
                            })
                          )
                          e.dataTransfer.effectAllowed = 'move'
                          onDragStart(e, comp)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                          <span className="text-lg flex-shrink-0">{comp.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{comp.name}</span>
                            {comp.description && (
                              <span className="text-[11px] text-muted-foreground block truncate">
                                {comp.description}
                              </span>
                            )}
                          </div>
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: comp.color }}
                          />
                        </div>

                        {/* Hover actions */}
                        <div className="absolute right-1 top-1 hidden group-hover:flex gap-0.5 bg-background/90 rounded shadow-sm border p-0.5">
                          <button
                            className="p-1 hover:bg-muted rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingComponent(comp)
                              setEditorOpen(true)
                            }}
                            title="Edit"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            className="p-1 hover:bg-muted rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicate(comp)
                            }}
                            title="Duplicate"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            className="p-1 hover:bg-muted rounded text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeletingId(comp.id)
                              setDeleteDialogOpen(true)
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Editor Dialog */}
      <ComponentEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) setEditingComponent(null)
        }}
        component={editingComponent}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Component</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will remove the component from your organization library. Existing
              diagrams using this component will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CustomComponentPanel
