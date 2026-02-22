'use client'

import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react'
import Link from 'next/link'
import { Bell, Check, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string | null
  created_at: string
  user_id?: string
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const typeIcon: Record<string, string> = {
  invite: '\ud83d\udce8',
  share: '\ud83d\udd17',
  comment: '\ud83d\udcac',
  mention: '@',
  compliance: '\u26a0\ufe0f',
  system: '\ud83d\udd14',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  // BUG-5: AbortController ref so in-flight fetches are cancelled on unmount
  const abortRef = useRef<AbortController | null>(null)

  const fetchNotifications = useCallback(async () => {
    // Cancel any previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20', { signal: controller.signal })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      // non-fatal
    } finally {
      setLoading(false)
    }
  }, [])

  // SR-4: Subscribe to Supabase Realtime for new notifications + fallback poll
  useEffect(() => {
    fetchNotifications()

    // Set up Supabase Realtime channel for instant notifications
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    // Get user ID so we can filter the channel
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (!user) return
      channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: { new: Notification }) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
            setUnreadCount(c => c + 1)
          },
        )
        .subscribe()
    })

    // Keep a slow fallback poll (5 min) in case Realtime is unavailable
    const interval = setInterval(fetchNotifications, 300_000)

    return () => {
      abortRef.current?.abort()
      clearInterval(interval)
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchNotifications])

  // Refetch when popover opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await fetch('/api/notifications', { method: 'POST' })
      setUnreadCount(0)
      setNotifications((prev: Notification[]) => prev.map((n: Notification) => ({ ...n, is_read: true })))
    } catch {
      // non-fatal
    } finally {
      setMarkingAll(false)
    }
  }

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((c: number) => Math.max(0, c - 1))
    } catch {
      // non-fatal
    }
  }

  const deleteOne = async (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      const removed = notifications.find((n: Notification) => n.id === id)
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id))
      if (removed && !removed.is_read) setUnreadCount((c: number) => Math.max(0, c - 1))
    } catch {
      // non-fatal
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={markAllRead}
              disabled={markingAll}
            >
              {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
              Mark all read
            </Button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="h-[360px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-sm gap-2">
              <Bell className="h-8 w-8 opacity-30" />
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={cn(
                    'group flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors',
                    !n.is_read && 'bg-primary/5'
                  )}
                  onClick={() => {
                    if (!n.is_read) markOneRead(n.id)
                    if (n.link) setOpen(false)
                  }}
                >
                  <span className="text-xl mt-0.5 shrink-0" aria-hidden>
                    {typeIcon[n.type] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.is_read && 'font-medium')}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e: MouseEvent<HTMLButtonElement>) => deleteOne(n.id, e)}
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Link
            href="/settings#notifications"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            Notification settings →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
