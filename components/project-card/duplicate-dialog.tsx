'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, GitBranch } from 'lucide-react'

interface DuplicateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  duplicateName: string
  setDuplicateName: (name: string) => void
  duplicateEnv: 'dev' | 'staging' | 'production'
  setDuplicateEnv: (env: 'dev' | 'staging' | 'production') => void
  isDuplicating: boolean
  onDuplicate: () => void
}

export function DuplicateDialog({
  open,
  onOpenChange,
  projectName,
  duplicateName,
  setDuplicateName,
  duplicateEnv,
  setDuplicateEnv,
  isDuplicating,
  onDuplicate,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-400" />
            Duplicate Project
          </DialogTitle>
          <DialogDescription>
            Creates a copy of &ldquo;{projectName}&rdquo; including all diagrams. Use environment promotion to scale replicas automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dupName">New Project Name</Label>
            <Input
              id="dupName"
              placeholder={`${projectName} (${duplicateEnv.toUpperCase()})`}
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Target Environment</Label>
            <Select value={duplicateEnv} onValueChange={(v: any) => setDuplicateEnv(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development (1× replicas)</SelectItem>
                <SelectItem value="staging">Staging (2× replicas)</SelectItem>
                <SelectItem value="production">Production (3× replicas)</SelectItem>
              </SelectContent>
            </Select>
            {duplicateEnv !== 'dev' && (
              <p className="text-xs text-muted-foreground">
                Nodes with a &ldquo;Replicas&rdquo; config will be scaled automatically.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDuplicating}>
            Cancel
          </Button>
          <Button onClick={onDuplicate} disabled={isDuplicating}>
            {isDuplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
