'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface CollaboratorPresence {
  user_id: string
  user_name: string
  avatar_url?: string
  color: string
  cursor?: { x: number; y: number }
  selected_node?: string
  last_seen: string
}

const PRESENCE_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#A855F7',
]

function getColorForUser(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length]
}

interface UseRealtimeCollaborationOptions {
  projectId: string
  userId: string
  userName: string
  avatarUrl?: string
}

export function useRealtimeCollaboration({
  projectId,
  userId,
  userName,
  avatarUrl,
}: UseRealtimeCollaborationOptions) {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`project:${projectId}`, {
      config: {
        presence: { key: userId },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const others: CollaboratorPresence[] = []
        for (const [key, presences] of Object.entries(state)) {
          const presenceArray = presences as CollaboratorPresence[]
          if (key !== userId && presenceArray.length > 0) {
            others.push(presenceArray[0])
          }
        }
        setCollaborators(others)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: CollaboratorPresence[] }) => {
        if (key !== userId) {
          console.log(`[Collab] ${newPresences[0]?.user_name} joined`)
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: CollaboratorPresence[] }) => {
        if (key !== userId) {
          console.log(`[Collab] ${leftPresences[0]?.user_name} left`)
        }
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            user_name: userName,
            avatar_url: avatarUrl,
            color: getColorForUser(userId),
            last_seen: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [projectId, userId, userName, avatarUrl, supabase])

  const updateCursor = useCallback(
    (x: number, y: number) => {
      channelRef.current?.track({
        user_id: userId,
        user_name: userName,
        avatar_url: avatarUrl,
        color: getColorForUser(userId),
        cursor: { x, y },
        last_seen: new Date().toISOString(),
      })
    },
    [userId, userName, avatarUrl]
  )

  const updateSelectedNode = useCallback(
    (nodeId: string | null) => {
      channelRef.current?.track({
        user_id: userId,
        user_name: userName,
        avatar_url: avatarUrl,
        color: getColorForUser(userId),
        selected_node: nodeId || undefined,
        last_seen: new Date().toISOString(),
      })
    },
    [userId, userName, avatarUrl]
  )

  const broadcastDiagramChange = useCallback(
    (payload: { type: string; data: unknown }) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'diagram_change',
        payload,
      })
    },
    []
  )

  const onDiagramChange = useCallback(
    (callback: (payload: { type: string; data: unknown }) => void) => {
      channelRef.current?.on('broadcast', { event: 'diagram_change' }, ({ payload }) => {
        callback(payload)
      })
    },
    []
  )

  return {
    collaborators,
    updateCursor,
    updateSelectedNode,
    broadcastDiagramChange,
    onDiagramChange,
  }
}
