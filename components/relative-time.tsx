'use client'

import { useEffect, useState } from 'react'

/**
 * BUG-3: Client-side relative time component.
 * Replaces server-computed "5m ago" strings that become stale when Next.js
 * caches or revalidates pages. Re-computes every 60 seconds on the client.
 */
export function RelativeTime({ date }: { date: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const update = () => {
      const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
      if (seconds < 60) return setText('just now')
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return setText(`${minutes}m ago`)
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return setText(`${hours}h ago`)
      setText(`${Math.floor(hours / 24)}d ago`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [date])

  return <span suppressHydrationWarning>{text}</span>
}
