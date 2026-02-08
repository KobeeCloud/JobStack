'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Share2, Loader2, Trash2, UserPlus, Copy, Check, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface SharedUser {
  id: string
  shared_with_user_id: string | null
  email: string
  permission: string
  created_at: string
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface ProjectShareDialogProps {
  projectId: string
  projectName: string
}

export function ProjectShareDialog({ projectId, projectName }: ProjectShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [shares, setShares] = useState<SharedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const loadShares = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select('id, shared_with_user_id, email, permission, created_at')
        .eq('project_id', projectId)

      if (error) throw error
      setShares(data || [])
    } catch {
      toast.error('Failed to load shares')
    } finally {
      setLoading(false)
    }
  }, [projectId, supabase])

  useEffect(() => {
    if (open) loadShares()
  }, [open, loadShares])

  const handleShare = async () => {
    if (!email.trim()) return
    setSharing(true)
    try {
      // Check if already shared
      const existing = shares.find(s => s.email === email.trim())
      if (existing) {
        toast.error('Already shared with this email')
        return
      }

      // Look up user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single()

      const { error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          shared_with_user_id: profile?.id || null,
          email: email.trim(),
          permission,
        })

      if (error) throw error

      toast.success(`Shared with ${email.trim()}`)
      setEmail('')
      loadShares()
    } catch (err: any) {
      toast.error(err.message || 'Failed to share project')
    } finally {
      setSharing(false)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error
      setShares(prev => prev.filter(s => s.id !== shareId))
      toast.success('Access removed')
    } catch {
      toast.error('Failed to remove access')
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/projects/${projectId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Share &quot;{projectName}&quot; with team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share form */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
              />
            </div>
            <Select value={permission} onValueChange={(v) => setPermission(v as 'view' | 'edit')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleShare} disabled={sharing || !email.trim()} size="icon">
              {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate flex-1">
              {typeof window !== 'undefined' ? `${window.location.origin}/projects/${projectId}` : ''}
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyLink}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Current shares */}
          <div>
            <Label className="text-xs text-muted-foreground">Shared with</Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center">
                Not shared with anyone yet
              </p>
            ) : (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between gap-2 p-2 rounded-md border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{share.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{share.permission}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
