'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      })

      if (error) throw error

      // Also update profiles table
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      toast.success('Profile updated successfully')
    } catch (error: unknown) {
      toast.error('Failed to update profile', { description: (error as Error).message })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl} alt={fullName || 'User avatar'} />
          <AvatarFallback className="text-lg">
            {getInitials(fullName, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input
            id="avatarUrl"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-80"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL to your profile picture
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your email is managed by your authentication provider
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function DeleteAccountButton({ user }: { user: User }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletionScheduledFor, setDeletionScheduledFor] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if deletion is already scheduled
  useState(() => {
    supabase
      .from('profiles')
      .select('deletion_scheduled_for')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { deletion_scheduled_for: string | null } | null }) => {
        if (data?.deletion_scheduled_for) {
          setDeletionScheduledFor(data.deletion_scheduled_for)
        }
      })
  })

  const handleScheduleDeletion = async () => {
    if (deleteConfirmation !== user.email) {
      toast.error('Please type your email correctly to confirm deletion')
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      const body = await res.json()

      if (!res.ok) throw new Error(body.error)

      setDeletionScheduledFor(body.deletion_scheduled_for)
      setDeleteConfirmation('')
      toast.success('Account deletion scheduled', {
        description: `Your account will be permanently deleted on ${new Date(body.deletion_scheduled_for).toLocaleDateString()}. You can cancel at any time before that.`,
      })
    } catch (error: unknown) {
      toast.error('Failed to schedule deletion', { description: (error as Error).message })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDeletion = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      const body = await res.json()

      if (!res.ok) throw new Error(body.error)

      setDeletionScheduledFor(null)
      toast.success('Account deletion cancelled', {
        description: 'Your account will remain active.',
      })
      router.refresh()
    } catch (error: unknown) {
      toast.error('Failed to cancel deletion', { description: (error as Error).message })
    } finally {
      setIsCancelling(false)
    }
  }

  if (deletionScheduledFor) {
    const scheduledDate = new Date(deletionScheduledFor)
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm text-destructive font-medium">
          Deletion scheduled for {scheduledDate.toLocaleDateString()}
        </p>
        <Button
          variant="outline"
          onClick={handleCancelDeletion}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            'Cancel Deletion'
          )}
        </Button>
      </div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Your account will be scheduled for deletion with a <strong>7-day grace period</strong>.
            During this time you can cancel the deletion. After 7 days your account and all data
            (projects, diagrams, settings) will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="confirm-email">
            Type <span className="font-semibold">{user.email}</span> to confirm
          </Label>
          <Input
            id="confirm-email"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Enter your email"
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleScheduleDeletion}
            disabled={isDeleting || deleteConfirmation !== user.email}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Deletion'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
