'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface EmailPreferences {
  org_invites: boolean
  project_shares: boolean
  account_alerts: boolean
  weekly_digest: boolean
}

const defaultPrefs: EmailPreferences = {
  org_invites: true,
  project_shares: true,
  account_alerts: true,
  weekly_digest: false,
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<EmailPreferences>(defaultPrefs)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/email-preferences')
      .then(res => res.json())
      .then(data => {
        setPrefs({ ...defaultPrefs, ...data })
      })
      .catch(() => {
        // Use defaults on error
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save notification preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const toggle = (key: keyof EmailPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="org-invites">Organization Invitations</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when invited to an organization
          </p>
        </div>
        <Switch
          id="org-invites"
          checked={prefs.org_invites}
          onCheckedChange={() => toggle('org_invites')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="project-shares">Project Shares</Label>
          <p className="text-sm text-muted-foreground">
            Receive email when someone shares a project with you
          </p>
        </div>
        <Switch
          id="project-shares"
          checked={prefs.project_shares}
          onCheckedChange={() => toggle('project_shares')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="account-alerts">Account Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Important notifications about your account security
          </p>
        </div>
        <Switch
          id="account-alerts"
          checked={prefs.account_alerts}
          onCheckedChange={() => toggle('account_alerts')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="weekly-digest">Weekly Digest</Label>
          <p className="text-sm text-muted-foreground">
            Summary of your projects and activity each week
          </p>
        </div>
        <Switch
          id="weekly-digest"
          checked={prefs.weekly_digest}
          onCheckedChange={() => toggle('weekly_digest')}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
